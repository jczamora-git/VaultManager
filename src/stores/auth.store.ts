import { defineStore } from 'pinia';
import { ref } from 'vue';
import { StorageService } from '@/services/storage.service';
import { CryptoService } from '@/services/crypto.service';
import { PinService } from '@/services/pin.service';
import { BiometricService } from '@/services/biometric.service';
import { DecryptedVaultPayload, EncryptedVaultEnvelope } from '@/models/vault.model';

export type UnlockMethod = 'pin' | 'biometric' | 'master';

export const useAuthStore = defineStore('auth', () => {
  const isUnlocked = ref(false);
  const hasVault = ref(false);
  const isInitializing = ref(true);
  const lastUnlockMethod = ref<UnlockMethod | null>(null);

  // Volatile in-memory keys (cleared upon locking)
  const cachedVaultKey = ref<string | null>(null);
  const cachedMasterPassword = ref<string | null>(null);

  /**
   * Initializes auth state from persistent storage
   */
  async function checkVaultStatus(): Promise<boolean> {
    isInitializing.value = true;
    try {
      const exists = await StorageService.hasVault();
      hasVault.value = exists;
      return exists;
    } finally {
      isInitializing.value = false;
    }
  }

  /**
   * Unlocks the vault with master password (high-security fallback / recovery)
   */
  async function unlockWithMasterPassword(password: string): Promise<DecryptedVaultPayload> {
    const envelope = await StorageService.getEncryptedVault();
    if (!envelope) {
      throw new Error('No vault found. Please set up a vault first.');
    }

    const { payload, vaultKeyBase64 } = await CryptoService.decryptVaultAndExtractKey(envelope, password);

    cachedVaultKey.value = vaultKeyBase64;
    cachedMasterPassword.value = password;
    lastUnlockMethod.value = 'master';
    isUnlocked.value = true;

    return payload;
  }

  /**
   * Unlocks the vault with 6-digit PIN (daily fast unlock)
   */
  async function unlockWithPin(pin: string): Promise<DecryptedVaultPayload> {
    const envelope = await StorageService.getEncryptedVault();
    if (!envelope) {
      throw new Error('No vault found.');
    }

    // 1. Authenticate PIN and unwrap the 256-bit Vault Key
    const vaultKeyBase64 = await PinService.unlockWithPin(pin);

    // 2. Decrypt vault data directly with Vault Key
    const payload = await CryptoService.decryptVaultWithKey(envelope, vaultKeyBase64);

    cachedVaultKey.value = vaultKeyBase64;
    lastUnlockMethod.value = 'pin';
    isUnlocked.value = true;

    return payload;
  }

  /**
   * Unlocks the vault with native OS Biometrics (Face ID / Fingerprint)
   */
  async function unlockWithBiometrics(): Promise<DecryptedVaultPayload> {
    const { payload, vaultKeyBase64 } = await BiometricService.unlockWithBiometrics();

    cachedVaultKey.value = vaultKeyBase64;
    lastUnlockMethod.value = 'biometric';
    isUnlocked.value = true;

    return payload;
  }

  /**
   * Backward-compatible unlock alias (uses master password)
   */
  async function unlock(password: string): Promise<DecryptedVaultPayload> {
    return unlockWithMasterPassword(password);
  }

  /**
   * Creates initial vault with Master Password and generates random 256-bit Vault Key
   */
  async function createInitialVault(password: string, initialPayload?: DecryptedVaultPayload): Promise<string> {
    const now = new Date().toISOString();
    const payload: DecryptedVaultPayload = initialPayload || {
      version: 1,
      credentials: [],
      metadata: {
        createdAt: now,
        updatedAt: now,
      },
    };

    const vaultKeyBase64 = CryptoService.generateVaultKey();
    const envelope = await CryptoService.encryptVault(payload, password, vaultKeyBase64);
    await StorageService.saveEncryptedVault(envelope);

    cachedVaultKey.value = vaultKeyBase64;
    cachedMasterPassword.value = password;
    lastUnlockMethod.value = 'master';
    hasVault.value = true;
    isUnlocked.value = true;

    return vaultKeyBase64;
  }

  /**
   * Locks the vault and completely zeroes decrypted state and volatile keys from memory
   */
  function lock(): void {
    isUnlocked.value = false;
    cachedVaultKey.value = null;
    cachedMasterPassword.value = null;
  }

  /**
   * Re-encrypts vault with new master password (re-wraps existing Vault Key)
   */
  async function changeMasterPassword(
    currentPassword: string,
    newPassword: string,
    currentPayload: DecryptedVaultPayload
  ): Promise<void> {
    const envelope = await StorageService.getEncryptedVault();
    let currentVaultKey = cachedVaultKey.value;

    if (!currentVaultKey && envelope) {
      const extracted = await CryptoService.decryptVaultAndExtractKey(envelope, currentPassword);
      currentVaultKey = extracted.vaultKeyBase64;
    }

    if (!currentVaultKey) {
      throw new Error('Could not resolve vault encryption key.');
    }

    currentPayload.metadata.updatedAt = new Date().toISOString();
    const newEnvelope = await CryptoService.encryptVault(currentPayload, newPassword, currentVaultKey);
    await StorageService.saveEncryptedVault(newEnvelope);

    cachedVaultKey.value = currentVaultKey;
    cachedMasterPassword.value = newPassword;
  }

  /**
   * Restores vault from an imported envelope
   */
  async function restoreVaultFromEnvelope(envelope: EncryptedVaultEnvelope, masterPassword: string): Promise<DecryptedVaultPayload> {
    const { payload, vaultKeyBase64 } = await CryptoService.decryptVaultAndExtractKey(envelope, masterPassword);
    await StorageService.saveEncryptedVault(envelope);

    cachedVaultKey.value = vaultKeyBase64;
    cachedMasterPassword.value = masterPassword;
    hasVault.value = true;
    isUnlocked.value = true;
    lastUnlockMethod.value = 'master';

    return payload;
  }

  /**
   * Permanently wipes all vault data, PIN protections, and biometric entries
   */
  async function wipeAllData(): Promise<void> {
    await PinService.clearPinProtection();
    await BiometricService.disableBiometricUnlock();
    await StorageService.clearAllVaultData();
    lock();
    hasVault.value = false;
  }

  return {
    isUnlocked,
    hasVault,
    isInitializing,
    lastUnlockMethod,
    cachedVaultKey,
    cachedMasterPassword,
    checkVaultStatus,
    unlock,
    unlockWithMasterPassword,
    unlockWithPin,
    unlockWithBiometrics,
    createInitialVault,
    lock,
    changeMasterPassword,
    restoreVaultFromEnvelope,
    wipeAllData,
  };
});
