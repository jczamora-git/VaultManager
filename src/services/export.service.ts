import { EncryptedVaultEnvelope, DecryptedVaultPayload } from '@/models/vault.model';
import { LocalProfile } from '@/models/profile.model';
import { AppSettings, DEFAULT_SETTINGS } from '@/models/settings.model';
import { CryptoService } from './crypto.service';

export interface PortableBackupBundle {
  profile: LocalProfile;
  vault: DecryptedVaultPayload;
  preferences: AppSettings;
}

export interface VaultifyBackupEnvelope {
  format: 'vaultify-backup' | 'vaultkey-backup';
  schemaVersion: number;
  appVersion: string;
  exportedAt: string;
  crypto: {
    algorithm: string;
    kdf: string;
    iterations: number;
    salt: string;
    iv: string;
    wrappedVaultKey?: {
      ciphertext: string;
      iv: string;
      tagLength: number;
    };
  };
  payload: string; // AES-256-GCM encrypted JSON string of PortableBackupBundle or DecryptedVaultPayload
}

export interface ImportValidationResult {
  valid: boolean;
  envelope?: VaultifyBackupEnvelope | EncryptedVaultEnvelope;
  format?: 'vaultify-backup' | 'legacy-vault';
  appVersion?: string;
  exportedAt?: string;
  error?: string;
}

export interface DecryptedImportResult {
  valid: boolean;
  bundle?: PortableBackupBundle;
  error?: string;
}

export class ExportService {
  /**
   * Generates formatted filename for backup e.g. "vaultify-backup-2026-09-25.json"
   */
  static getBackupFilename(): string {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    return `vaultify-backup-${dateStr}.json`;
  }

  /**
   * Creates a complete portable encrypted backup package
   */
  static async createBackupPackage(
    vault: DecryptedVaultPayload,
    profile: LocalProfile,
    preferences: AppSettings,
    masterPassword: string,
    existingVaultKey?: string
  ): Promise<VaultifyBackupEnvelope> {
    const bundle: PortableBackupBundle = {
      profile,
      vault,
      preferences,
    };

    // Use CryptoService to encrypt the bundle
    const vaultKeyBase64 = existingVaultKey || CryptoService.generateVaultKey();
    const envelope = await CryptoService.encryptVault(bundle as any, masterPassword, vaultKeyBase64);

    return {
      format: 'vaultify-backup',
      schemaVersion: 1,
      appVersion: '1.0.0',
      exportedAt: new Date().toISOString(),
      crypto: envelope.crypto,
      payload: envelope.payload,
    };
  }

  /**
   * Exports an encrypted backup envelope as a downloadable JSON file
   */
  static exportBackupFile(envelope: VaultifyBackupEnvelope): void {
    const jsonString = JSON.stringify(envelope, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = this.getBackupFilename();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Validates raw JSON string to check if it matches a VaultifyBackupEnvelope or legacy envelope
   */
  static validateBackupFile(fileContent: string): ImportValidationResult {
    try {
      const data = JSON.parse(fileContent);

      if (!data || typeof data !== 'object') {
        return { valid: false, error: 'Invalid file format: not a valid JSON document.' };
      }

      if (!data.crypto || !data.payload) {
        return { valid: false, error: 'Missing required vault encryption metadata.' };
      }

      const { crypto } = data;
      if (!crypto.salt || !crypto.iv || !crypto.algorithm) {
        return { valid: false, error: 'Missing encryption parameters (salt, iv, algorithm).' };
      }

      const isVaultifyFormat = data.format === 'vaultify-backup' || data.format === 'vaultkey-backup';

      return {
        valid: true,
        envelope: data,
        format: isVaultifyFormat ? 'vaultify-backup' : 'legacy-vault',
        appVersion: data.appVersion || '1.0.0',
        exportedAt: data.exportedAt || data.metadata?.createdAt,
      };
    } catch (e: any) {
      return {
        valid: false,
        error: `Could not parse JSON file: ${e.message || 'Syntax error'}`,
      };
    }
  }

  /**
   * Tests decrypting an imported backup with master password and normalizes into PortableBackupBundle
   */
  static async decryptAndExtractBackup(
    envelope: VaultifyBackupEnvelope | EncryptedVaultEnvelope,
    masterPassword: string
  ): Promise<DecryptedImportResult> {
    try {
      const rawEnvelope: EncryptedVaultEnvelope = {
        version: (envelope as any).version || 1,
        appName: 'Vaultify',
        crypto: {
          algorithm: 'AES-GCM',
          kdf: 'PBKDF2',
          hash: 'SHA-256',
          iterations: envelope.crypto.iterations || 250000,
          salt: envelope.crypto.salt,
          iv: envelope.crypto.iv,
          wrappedMasterKey: (envelope.crypto as any).wrappedMasterKey || (envelope.crypto as any).wrappedVaultKey?.ciphertext,
          wrappedMasterIv: (envelope.crypto as any).wrappedMasterIv || (envelope.crypto as any).wrappedVaultKey?.iv,
        },
        payload: envelope.payload,
      };

      const { payload } = await CryptoService.decryptVaultAndExtractKey(rawEnvelope, masterPassword);

      // Check if it's a PortableBackupBundle (contains profile, vault, preferences)
      if ((payload as any).vault && (payload as any).profile) {
        const bundle = payload as unknown as PortableBackupBundle;
        return {
          valid: true,
          bundle: {
            profile: bundle.profile,
            vault: bundle.vault,
            preferences: { ...DEFAULT_SETTINGS, ...bundle.preferences },
          },
        };
      }

      // Legacy DecryptedVaultPayload format
      const legacyPayload = payload as DecryptedVaultPayload;
      const now = new Date().toISOString();
      return {
        valid: true,
        bundle: {
          profile: {
            id: crypto.randomUUID ? crypto.randomUUID() : `profile_${Date.now()}`,
            displayName: 'John',
            avatarType: 'initials',
            avatarColor: '#B82825',
            createdAt: now,
            updatedAt: now,
          },
          vault: legacyPayload,
          preferences: DEFAULT_SETTINGS,
        },
      };
    } catch (err: any) {
      return {
        valid: false,
        error: err.message || 'Unable to decrypt backup. Please check your master password.',
      };
    }
  }
}
