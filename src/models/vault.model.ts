import { Credential } from './credential.model';

export interface VaultCryptoMetadata {
  algorithm: 'AES-GCM';
  kdf: 'PBKDF2';
  hash: 'SHA-256';
  iterations: number;
  salt: string; // Base64 encoded PBKDF2 salt
  iv: string;   // Base64 encoded AES-GCM IV for payload
  wrappedMasterKey?: string; // Base64 ciphertext of the random 256-bit vault key wrapped with Master Password
  wrappedMasterIv?: string;  // Base64 IV used when wrapping the vault key
}

export interface EncryptedVaultEnvelope {
  version: number;
  appName: string;
  crypto: VaultCryptoMetadata;
  payload: string; // Base64 encoded ciphertext + auth tag
}

export interface DecryptedVaultPayload {
  version: number;
  credentials: Credential[];
  metadata: {
    createdAt: string;
    updatedAt: string;
    lastExportedAt?: string;
  };
}

export interface VaultStateSummary {
  totalCount: number;
  favoriteCount: number;
  categoryCounts: Record<string, number>;
  weakPasswordCount: number;
  reusedPasswordCount: number;
}
