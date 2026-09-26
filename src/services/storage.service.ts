import { Preferences } from '@capacitor/preferences';
import { EncryptedVaultEnvelope } from '@/models/vault.model';
import { AppSettings, DEFAULT_SETTINGS } from '@/models/settings.model';
import { LocalProfile } from '@/models/profile.model';

const STORAGE_KEYS = {
  VAULT_ENVELOPE: 'vaultkey_encrypted_vault_v1',
  SETTINGS: 'vaultkey_user_settings_v1',
  VAULT_EXISTS_FLAG: 'vaultkey_vault_exists',
  BIOMETRIC_WRAPPED_PAYLOAD: 'vaultkey_bio_wrapped_v1',
  PIN_WRAPPED_KEY: 'vaultkey_pin_wrapped_v1',
  PIN_LOCKOUT_STATE: 'vaultkey_pin_lockout_v1',
  LOCAL_PROFILE: 'vaultkey_local_profile_v1',
  ONBOARDING_COMPLETE: 'vaultkey_onboarding_complete_v1',
  LAST_WEBSITE_ICON_SYNC_AT: 'vaultkey_last_website_icon_sync_at_v1',
};

/**
 * Layered StorageService abstraction.
 * Encrypted vault envelope is stored locally.
 * Can be easily swapped with SQLite plugin or FileSystem in future.
 */
export class StorageService {
  /**
   * Check if a vault is already created
   */
  static async hasVault(): Promise<boolean> {
    const { value } = await Preferences.get({ key: STORAGE_KEYS.VAULT_EXISTS_FLAG });
    if (value === 'true') return true;
    
    // Check fallback in localStorage
    const local = localStorage.getItem(STORAGE_KEYS.VAULT_ENVELOPE);
    return !!local;
  }

  /**
   * Get the encrypted vault envelope
   */
  static async getEncryptedVault(): Promise<EncryptedVaultEnvelope | null> {
    const { value } = await Preferences.get({ key: STORAGE_KEYS.VAULT_ENVELOPE });
    if (value) {
      try {
        return JSON.parse(value) as EncryptedVaultEnvelope;
      } catch (e) {
        console.error('Failed to parse envelope from Preferences', e);
      }
    }

    // Check localStorage fallback
    const local = localStorage.getItem(STORAGE_KEYS.VAULT_ENVELOPE);
    if (local) {
      try {
        return JSON.parse(local) as EncryptedVaultEnvelope;
      } catch (e) {
        console.error('Failed to parse envelope from localStorage', e);
      }
    }

    return null;
  }

  /**
   * Save the encrypted vault envelope
   */
  static async saveEncryptedVault(envelope: EncryptedVaultEnvelope): Promise<void> {
    const serialized = JSON.stringify(envelope);
    await Preferences.set({
      key: STORAGE_KEYS.VAULT_ENVELOPE,
      value: serialized,
    });
    await Preferences.set({
      key: STORAGE_KEYS.VAULT_EXISTS_FLAG,
      value: 'true',
    });

    // Also keep in localStorage for browser PWA persistence
    localStorage.setItem(STORAGE_KEYS.VAULT_ENVELOPE, serialized);
    localStorage.setItem(STORAGE_KEYS.VAULT_EXISTS_FLAG, 'true');
  }

  /**
   * Save the PIN-wrapped vault key envelope
   */
  static async savePinWrappedPayload(payload: string): Promise<void> {
    await Preferences.set({
      key: STORAGE_KEYS.PIN_WRAPPED_KEY,
      value: payload,
    });
    localStorage.setItem(STORAGE_KEYS.PIN_WRAPPED_KEY, payload);
  }

  /**
   * Get the PIN-wrapped vault key envelope
   */
  static async getPinWrappedPayload(): Promise<string | null> {
    const { value } = await Preferences.get({ key: STORAGE_KEYS.PIN_WRAPPED_KEY });
    if (value) return value;
    return localStorage.getItem(STORAGE_KEYS.PIN_WRAPPED_KEY);
  }

  /**
   * Clear the PIN-wrapped vault key envelope
   */
  static async clearPinWrappedPayload(): Promise<void> {
    await Preferences.remove({ key: STORAGE_KEYS.PIN_WRAPPED_KEY });
    localStorage.removeItem(STORAGE_KEYS.PIN_WRAPPED_KEY);
  }

  /**
   * Save the PIN lockout state
   */
  static async savePinLockoutState(state: string): Promise<void> {
    await Preferences.set({
      key: STORAGE_KEYS.PIN_LOCKOUT_STATE,
      value: state,
    });
    localStorage.setItem(STORAGE_KEYS.PIN_LOCKOUT_STATE, state);
  }

  /**
   * Get the PIN lockout state
   */
  static async getPinLockoutState(): Promise<string | null> {
    const { value } = await Preferences.get({ key: STORAGE_KEYS.PIN_LOCKOUT_STATE });
    if (value) return value;
    return localStorage.getItem(STORAGE_KEYS.PIN_LOCKOUT_STATE);
  }

  /**
   * Clear the PIN lockout state
   */
  static async clearPinLockoutState(): Promise<void> {
    await Preferences.remove({ key: STORAGE_KEYS.PIN_LOCKOUT_STATE });
    localStorage.removeItem(STORAGE_KEYS.PIN_LOCKOUT_STATE);
  }

  /**
   * Save the biometric-wrapped key payload
   */
  static async saveBiometricWrappedPayload(payload: string): Promise<void> {
    await Preferences.set({
      key: STORAGE_KEYS.BIOMETRIC_WRAPPED_PAYLOAD,
      value: payload,
    });
    localStorage.setItem(STORAGE_KEYS.BIOMETRIC_WRAPPED_PAYLOAD, payload);
  }

  /**
   * Get the biometric-wrapped key payload
   */
  static async getBiometricWrappedPayload(): Promise<string | null> {
    const { value } = await Preferences.get({ key: STORAGE_KEYS.BIOMETRIC_WRAPPED_PAYLOAD });
    if (value) return value;
    return localStorage.getItem(STORAGE_KEYS.BIOMETRIC_WRAPPED_PAYLOAD);
  }

  /**
   * Clear the biometric-wrapped key payload
   */
  static async clearBiometricWrappedPayload(): Promise<void> {
    await Preferences.remove({ key: STORAGE_KEYS.BIOMETRIC_WRAPPED_PAYLOAD });
    localStorage.removeItem(STORAGE_KEYS.BIOMETRIC_WRAPPED_PAYLOAD);
  }

  /**
   * Get local user profile
   */
  static async getLocalProfile(): Promise<LocalProfile | null> {
    const { value } = await Preferences.get({ key: STORAGE_KEYS.LOCAL_PROFILE });
    if (value) {
      try {
        return JSON.parse(value) as LocalProfile;
      } catch (e) {
        console.error('Failed to parse local profile from Preferences', e);
      }
    }
    const local = localStorage.getItem(STORAGE_KEYS.LOCAL_PROFILE);
    if (local) {
      try {
        return JSON.parse(local) as LocalProfile;
      } catch (e) {
        console.error('Failed to parse local profile from localStorage', e);
      }
    }
    return null;
  }

  /**
   * Save local user profile
   */
  static async saveLocalProfile(profile: LocalProfile): Promise<void> {
    const serialized = JSON.stringify(profile);
    await Preferences.set({
      key: STORAGE_KEYS.LOCAL_PROFILE,
      value: serialized,
    });
    localStorage.setItem(STORAGE_KEYS.LOCAL_PROFILE, serialized);
  }

  /**
   * Get onboarding complete status
   */
  static async getOnboardingComplete(): Promise<boolean> {
    const { value } = await Preferences.get({ key: STORAGE_KEYS.ONBOARDING_COMPLETE });
    if (value === 'true') return true;
    return localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE) === 'true';
  }

  /**
   * Save onboarding complete status
   */
  static async saveOnboardingComplete(completed: boolean): Promise<void> {
    const val = completed ? 'true' : 'false';
    await Preferences.set({
      key: STORAGE_KEYS.ONBOARDING_COMPLETE,
      value: val,
    });
    localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, val);
  }

  /**
   * Get user application settings
   */
  static async getSettings(): Promise<AppSettings> {
    const { value } = await Preferences.get({ key: STORAGE_KEYS.SETTINGS });
    if (value) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(value) };
      } catch {
        return DEFAULT_SETTINGS;
      }
    }
    const local = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (local) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(local) };
      } catch {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  }

  /**
   * Save user application settings
   */
  static async saveSettings(settings: AppSettings): Promise<void> {
    const serialized = JSON.stringify(settings);
    await Preferences.set({
      key: STORAGE_KEYS.SETTINGS,
      value: serialized,
    });
    localStorage.setItem(STORAGE_KEYS.SETTINGS, serialized);
  }

  /**
   * Get last website icon daily sync timestamp
   */
  static async getLastWebsiteIconSyncAt(): Promise<number> {
    const { value } = await Preferences.get({ key: STORAGE_KEYS.LAST_WEBSITE_ICON_SYNC_AT });
    if (value) {
      const parsed = parseInt(value, 10);
      if (!isNaN(parsed)) return parsed;
    }
    const local = localStorage.getItem(STORAGE_KEYS.LAST_WEBSITE_ICON_SYNC_AT);
    if (local) {
      const parsed = parseInt(local, 10);
      if (!isNaN(parsed)) return parsed;
    }
    return 0;
  }

  /**
   * Set last website icon daily sync timestamp
   */
  static async setLastWebsiteIconSyncAt(timestamp: number): Promise<void> {
    const val = String(timestamp);
    await Preferences.set({
      key: STORAGE_KEYS.LAST_WEBSITE_ICON_SYNC_AT,
      value: val,
    });
    localStorage.setItem(STORAGE_KEYS.LAST_WEBSITE_ICON_SYNC_AT, val);
  }

  /**
   * Reset / Wipe all vault data
   */
  static async clearAllVaultData(): Promise<void> {
    await Preferences.remove({ key: STORAGE_KEYS.VAULT_ENVELOPE });
    await Preferences.remove({ key: STORAGE_KEYS.VAULT_EXISTS_FLAG });
    await Preferences.remove({ key: STORAGE_KEYS.BIOMETRIC_WRAPPED_PAYLOAD });
    await Preferences.remove({ key: STORAGE_KEYS.PIN_WRAPPED_KEY });
    await Preferences.remove({ key: STORAGE_KEYS.PIN_LOCKOUT_STATE });
    await Preferences.remove({ key: STORAGE_KEYS.LOCAL_PROFILE });
    await Preferences.remove({ key: STORAGE_KEYS.ONBOARDING_COMPLETE });
    await Preferences.remove({ key: STORAGE_KEYS.LAST_WEBSITE_ICON_SYNC_AT });

    localStorage.removeItem(STORAGE_KEYS.VAULT_ENVELOPE);
    localStorage.removeItem(STORAGE_KEYS.VAULT_EXISTS_FLAG);
    localStorage.removeItem(STORAGE_KEYS.BIOMETRIC_WRAPPED_PAYLOAD);
    localStorage.removeItem(STORAGE_KEYS.PIN_WRAPPED_KEY);
    localStorage.removeItem(STORAGE_KEYS.PIN_LOCKOUT_STATE);
    localStorage.removeItem(STORAGE_KEYS.LOCAL_PROFILE);
    localStorage.removeItem(STORAGE_KEYS.ONBOARDING_COMPLETE);
    localStorage.removeItem(STORAGE_KEYS.LAST_WEBSITE_ICON_SYNC_AT);
  }
}
