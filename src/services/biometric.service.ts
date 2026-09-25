import { Capacitor } from '@capacitor/core';
import { NativeBiometric, BiometryType, BiometricAuthError } from '@capgo/capacitor-native-biometric';
import { StorageService } from './storage.service';
import { CryptoService, bufferToBase64 } from './crypto.service';
import { DecryptedVaultPayload } from '@/models/vault.model';

export type BiometricTypeString = 'face' | 'fingerprint' | 'iris' | 'multiple' | 'none';

export interface BiometricAvailability {
  available: boolean;
  type: BiometricTypeString;
  label: string;
}

export class BiometricUserCancelledError extends Error {
  constructor(message = 'Biometric authentication cancelled by user') {
    super(message);
    this.name = 'BiometricUserCancelledError';
  }
}

export class BiometricLockoutError extends Error {
  constructor(message = 'Biometric unlock is temporarily unavailable. Use your master password.') {
    super(message);
    this.name = 'BiometricLockoutError';
  }
}

export class BiometricAuthFailedError extends Error {
  constructor(message = 'Biometric authentication failed') {
    super(message);
    this.name = 'BiometricAuthFailedError';
  }
}

const SERVER_KEY = 'vaultkey.app.biometric';
const CREDENTIAL_USERNAME = 'vaultkey_bio_token';

export class BiometricService {
  /**
   * Check if biometrics are available on the current device
   */
  static async checkAvailability(): Promise<BiometricAvailability> {
    if (!Capacitor.isNativePlatform()) {
      return {
        available: false,
        type: 'none',
        label: 'Biometrics',
      };
    }

    try {
      const result = await NativeBiometric.isAvailable({ useFallback: false });
      if (!result.isAvailable) {
        return {
          available: false,
          type: 'none',
          label: 'Biometrics',
        };
      }

      let type: BiometricTypeString = 'fingerprint';
      let label = 'Fingerprint';

      switch (result.biometryType) {
        case BiometryType.FACE_ID:
          type = 'face';
          label = 'Face ID';
          break;
        case BiometryType.FACE_AUTHENTICATION:
          type = 'face';
          label = 'Face Unlock';
          break;
        case BiometryType.TOUCH_ID:
          type = 'fingerprint';
          label = 'Touch ID';
          break;
        case BiometryType.FINGERPRINT:
          type = 'fingerprint';
          label = 'Fingerprint';
          break;
        case BiometryType.IRIS_AUTHENTICATION:
          type = 'iris';
          label = 'Iris';
          break;
        case BiometryType.MULTIPLE:
          type = 'multiple';
          label = 'Biometrics';
          break;
        default:
          type = 'fingerprint';
          label = 'Biometrics';
      }

      return {
        available: true,
        type,
        label,
      };
    } catch {
      return {
        available: false,
        type: 'none',
        label: 'Biometrics',
      };
    }
  }

  /**
   * Enables biometric unlock by wrapping the 256-bit Vault Key
   * with a cryptographically secure random token stored inside native Keychain / Keystore.
   * Master password is NEVER stored in plaintext.
   */
  static async enableBiometricUnlock(vaultKeyOrMasterPassword: string): Promise<void> {
    const envelope = await StorageService.getEncryptedVault();
    if (!envelope) {
      throw new Error('No vault exists to enable biometric unlock for.');
    }

    let vaultKeyBase64 = vaultKeyOrMasterPassword;

    // If a master password was passed, extract the vault key
    if (vaultKeyOrMasterPassword.length < 32 || !vaultKeyOrMasterPassword.includes('=')) {
      const { vaultKeyBase64: extractedKey } = await CryptoService.decryptVaultAndExtractKey(envelope, vaultKeyOrMasterPassword);
      vaultKeyBase64 = extractedKey;
    }

    // 1. Generate a 256-bit cryptographically secure random biometric wrapping secret
    const randomSecretBytes = CryptoService.getRandomBytes(32);
    const bioSecretKey = bufferToBase64(randomSecretBytes);

    // 2. Encrypt / wrap the Vault Key using AES-256-GCM keyed from this random secret
    const wrappedPayload = await CryptoService.encryptCustomText(vaultKeyBase64, bioSecretKey);

    // 3. Save the wrapped payload in local storage
    await StorageService.saveBiometricWrappedPayload(wrappedPayload);

    // 4. Save the wrapping secret in native OS Keychain / Keystore protected by biometrics
    if (Capacitor.isNativePlatform()) {
      try {
        await NativeBiometric.setCredentials({
          server: SERVER_KEY,
          username: CREDENTIAL_USERNAME,
          password: bioSecretKey,
        });
      } catch (err: any) {
        // Rollback wrapped payload on failure
        await StorageService.clearBiometricWrappedPayload();
        throw new Error(err.message || 'Failed to register credentials in secure native storage.');
      }
    }
  }

  /**
   * Disables biometric unlock and purges the native Keychain / Keystore credentials
   */
  static async disableBiometricUnlock(): Promise<void> {
    await StorageService.clearBiometricWrappedPayload();
    if (Capacitor.isNativePlatform()) {
      try {
        await NativeBiometric.deleteCredentials({ server: SERVER_KEY });
      } catch {
        // Ignore deletion errors if credentials did not exist
      }
    }
  }

  /**
   * Prompts native OS biometric authentication, retrieves the wrapping secret
   * from Keychain / Keystore, unwraps the Vault Key, and decrypts the vault.
   */
  static async unlockWithBiometrics(): Promise<{ payload: DecryptedVaultPayload; vaultKeyBase64: string }> {
    const wrappedPayload = await StorageService.getBiometricWrappedPayload();
    if (!wrappedPayload) {
      throw new Error('Biometric credentials are not configured or have expired.');
    }

    const envelope = await StorageService.getEncryptedVault();
    if (!envelope) {
      throw new Error('No vault found.');
    }

    if (!Capacitor.isNativePlatform()) {
      throw new Error('Biometric authentication is only available on native devices.');
    }

    let bioSecretKey = '';

    try {
      // 1. Verify identity with biometric prompt
      await NativeBiometric.verifyIdentity({
        reason: 'Scan biometrics to unlock Vaultify',
        title: 'Unlock Vault',
        subtitle: 'Authenticate to access your credentials',
        description: 'Biometric authorization is required to access your secure vault',
        negativeButtonText: 'Use PIN or Password',
        maxAttempts: 3,
      });

      // 2. Retrieve credentials released by Keychain / Keystore
      const creds = await NativeBiometric.getCredentials({ server: SERVER_KEY });
      if (!creds || !creds.password) {
        throw new BiometricAuthFailedError('Could not retrieve biometric authorization token.');
      }
      bioSecretKey = creds.password;
    } catch (err: any) {
      const msg = (err?.message || '').toLowerCase();
      const code = err?.code || err?.errorCode;

      if (
        code === BiometricAuthError.USER_CANCEL ||
        code === BiometricAuthError.APP_CANCEL ||
        code === BiometricAuthError.SYSTEM_CANCEL ||
        code === BiometricAuthError.USER_FALLBACK ||
        msg.includes('cancel') ||
        msg.includes('user cancelled') ||
        msg.includes('dismissed')
      ) {
        throw new BiometricUserCancelledError();
      }

      if (
        code === BiometricAuthError.USER_LOCKOUT ||
        code === BiometricAuthError.USER_TEMPORARY_LOCKOUT ||
        msg.includes('lockout') ||
        msg.includes('too many attempts')
      ) {
        throw new BiometricLockoutError();
      }

      throw new BiometricAuthFailedError(err?.message || 'Biometric authentication failed');
    }

    // 3. Unwrap Vault Key (or master password for backwards compatibility)
    let unwrappedKeyOrPass = '';
    try {
      unwrappedKeyOrPass = await CryptoService.decryptCustomText(wrappedPayload, bioSecretKey);
    } catch {
      throw new BiometricAuthFailedError('Failed to unwrap secure vault key with biometric token.');
    }

    // 4. Decrypt vault
    try {
      const payload = await CryptoService.decryptVaultWithKey(envelope, unwrappedKeyOrPass);
      return { payload, vaultKeyBase64: unwrappedKeyOrPass };
    } catch {
      // Fallback for legacy format where master password was wrapped
      const { payload, vaultKeyBase64 } = await CryptoService.decryptVaultAndExtractKey(envelope, unwrappedKeyOrPass);
      return { payload, vaultKeyBase64 };
    }
  }
}
