import { PinWrappedKeyEnvelope, PinLockoutInfo } from '@/models/pin.model';
import { StorageService } from './storage.service';
import { CryptoService, bufferToBase64, base64ToBuffer } from './crypto.service';

const PIN_PBKDF2_ITERATIONS = 100000;
const SALT_LENGTH = 32;
const IV_LENGTH = 12;

interface StoredLockoutData {
  failedAttempts: number;
  lockoutUntil: number; // Unix timestamp in ms
}

const WEAK_PINS = new Set([
  '000000', '111111', '222222', '333333', '444444',
  '555555', '666666', '777777', '888888', '999999',
  '123456', '654321', '012345', '543210', '987654',
  '456789', '234567', '765432', '345678', '876543',
  '098765', '567890', '121212', '123123', '696969',
  '007007', '112233', '131313', '242424', '363636'
]);

export class PinService {
  /**
   * Validates PIN format and detects easy-to-guess patterns
   */
  static validatePinStrength(pin: string): { valid: boolean; error?: string } {
    if (!pin || pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      return { valid: false, error: 'PIN must be exactly 6 digits.' };
    }

    // Check against known common weak PINs
    if (WEAK_PINS.has(pin)) {
      return {
        valid: false,
        error: 'This PIN is easy to guess. Use a less predictable six-digit PIN.',
      };
    }

    // Check all same digit (e.g. 777777)
    if (/^(\d)\1{5}$/.test(pin)) {
      return {
        valid: false,
        error: 'This PIN is easy to guess. Use a less predictable six-digit PIN.',
      };
    }

    // Check 3-digit repeating pattern (e.g. 147147)
    if (pin.slice(0, 3) === pin.slice(3, 6)) {
      return {
        valid: false,
        error: 'This PIN is easy to guess. Use a less predictable six-digit PIN.',
      };
    }

    // Check 2-digit repeating pattern (e.g. 191919)
    if (pin.slice(0, 2) === pin.slice(2, 4) && pin.slice(2, 4) === pin.slice(4, 6)) {
      return {
        valid: false,
        error: 'This PIN is easy to guess. Use a less predictable six-digit PIN.',
      };
    }

    return { valid: true };
  }

  /**
   * Checks whether a 6-digit PIN has been configured on this device
   */
  static async hasConfiguredPin(): Promise<boolean> {
    const wrapped = await StorageService.getPinWrappedPayload();
    return !!wrapped;
  }

  /**
   * Derives a cryptographic key from the 6-digit PIN and wraps the 256-bit Vault Key
   */
  static async createPinProtection(pin: string, vaultKeyBase64: string): Promise<void> {
    const salt = CryptoService.getRandomBytes(SALT_LENGTH);
    const iv = CryptoService.getRandomBytes(IV_LENGTH);

    // Derive key using PBKDF2-SHA256 (100k iterations)
    const pinDerivedKey = await CryptoService.deriveKey(pin, salt, PIN_PBKDF2_ITERATIONS);

    const encoder = new TextEncoder();
    const encodedVaultKey = encoder.encode(vaultKeyBase64);

    const subtle = CryptoService.getSubtle();
    const encryptedBuffer = await subtle.encrypt(
      { name: 'AES-GCM', iv: iv as BufferSource },
      pinDerivedKey,
      encodedVaultKey as BufferSource
    );

    const envelope: PinWrappedKeyEnvelope = {
      salt: bufferToBase64(salt),
      iv: bufferToBase64(iv),
      iterations: PIN_PBKDF2_ITERATIONS,
      wrappedKey: bufferToBase64(encryptedBuffer),
    };

    await StorageService.savePinWrappedPayload(JSON.stringify(envelope));
    await StorageService.clearPinLockoutState();
  }

  /**
   * Authenticates entered PIN against wrapped vault key.
   * If correct, returns the unwrapped 256-bit vaultKeyBase64.
   */
  static async unlockWithPin(pin: string): Promise<string> {
    const lockout = await this.getLockoutStatus();
    if (lockout.isLocked) {
      throw new Error(`Too many attempts. Try again in ${lockout.remainingSeconds} seconds.`);
    }

    const rawPayload = await StorageService.getPinWrappedPayload();
    if (!rawPayload) {
      throw new Error('No PIN configured. Please unlock with your master password.');
    }

    let envelope: PinWrappedKeyEnvelope;
    try {
      envelope = JSON.parse(rawPayload);
    } catch {
      throw new Error('Corrupted PIN security payload.');
    }

    const salt = base64ToBuffer(envelope.salt);
    const iv = base64ToBuffer(envelope.iv);
    const ciphertext = base64ToBuffer(envelope.wrappedKey);

    const pinDerivedKey = await CryptoService.deriveKey(pin, salt, envelope.iterations || PIN_PBKDF2_ITERATIONS);

    try {
      const subtle = CryptoService.getSubtle();
      const decryptedBuffer = await subtle.decrypt(
        { name: 'AES-GCM', iv: iv as BufferSource },
        pinDerivedKey,
        ciphertext as BufferSource
      );

      const vaultKeyBase64 = new TextDecoder().decode(decryptedBuffer);
      await this.recordSuccessfulUnlock();
      return vaultKeyBase64;
    } catch {
      const updatedLockout = await this.recordFailedAttempt();
      if (updatedLockout.isLocked) {
        throw new Error(`Too many attempts. Try again in ${updatedLockout.remainingSeconds} seconds.`);
      }
      throw new Error('Incorrect PIN');
    }
  }

  /**
   * Retrieves current lockout status and remaining seconds
   */
  static async getLockoutStatus(): Promise<PinLockoutInfo> {
    const raw = await StorageService.getPinLockoutState();
    if (!raw) {
      return { isLocked: false, remainingSeconds: 0, failedAttempts: 0 };
    }

    try {
      const data: StoredLockoutData = JSON.parse(raw);
      const now = Date.now();
      if (data.lockoutUntil > now) {
        const remainingSeconds = Math.ceil((data.lockoutUntil - now) / 1000);
        return {
          isLocked: true,
          remainingSeconds,
          failedAttempts: data.failedAttempts,
          requireMasterPassword: data.failedAttempts >= 10,
        };
      } else {
        return {
          isLocked: false,
          remainingSeconds: 0,
          failedAttempts: data.failedAttempts,
          requireMasterPassword: data.failedAttempts >= 10,
        };
      }
    } catch {
      return { isLocked: false, remainingSeconds: 0, failedAttempts: 0 };
    }
  }

  /**
   * Increments failed attempt counter and calculates progressive timeout
   */
  static async recordFailedAttempt(): Promise<PinLockoutInfo> {
    const current = await this.getLockoutStatus();
    const attempts = current.failedAttempts + 1;
    let lockoutDurationMs = 0;

    if (attempts >= 10) {
      lockoutDurationMs = 300 * 1000; // 5 minutes
    } else if (attempts >= 8) {
      lockoutDurationMs = 60 * 1000;  // 1 minute
    } else if (attempts >= 5) {
      lockoutDurationMs = 30 * 1000;  // 30 seconds
    }

    const lockoutUntil = lockoutDurationMs > 0 ? Date.now() + lockoutDurationMs : 0;
    const data: StoredLockoutData = {
      failedAttempts: attempts,
      lockoutUntil,
    };

    await StorageService.savePinLockoutState(JSON.stringify(data));

    return {
      isLocked: lockoutDurationMs > 0,
      remainingSeconds: Math.ceil(lockoutDurationMs / 1000),
      failedAttempts: attempts,
      requireMasterPassword: attempts >= 10,
    };
  }

  /**
   * Resets failed attempt counter on successful unlock
   */
  static async recordSuccessfulUnlock(): Promise<void> {
    await StorageService.clearPinLockoutState();
  }

  /**
   * Erases all PIN protection material
   */
  static async clearPinProtection(): Promise<void> {
    await StorageService.clearPinWrappedPayload();
    await StorageService.clearPinLockoutState();
  }
}
