import { EncryptedVaultEnvelope, DecryptedVaultPayload, VaultCryptoMetadata } from '@/models/vault.model';

const PBKDF2_ITERATIONS = 250000;
const SALT_LENGTH = 32; // 256 bits
const IV_LENGTH = 12;   // 96 bits for AES-GCM
const KEY_LENGTH = 256; // 256 bits for AES

/**
 * ArrayBuffer and Base64 conversion utilities
 */
export function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

export function base64ToBuffer(base64: string): Uint8Array {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export class CryptoService {
  /**
   * Generates cryptographically secure random bytes
   */
  static getRandomBytes(length: number): Uint8Array {
    const bytes = new Uint8Array(length);
    window.crypto.getRandomValues(bytes);
    return bytes;
  }

  /**
   * Generates a random 256-bit Vault Key (Base64 string)
   */
  static generateVaultKey(): string {
    return bufferToBase64(this.getRandomBytes(32));
  }

  /**
   * Imports a raw Base64 AES-GCM 256-bit key into a Web Crypto CryptoKey
   */
  static async importAesKey(rawKeyBase64: string): Promise<CryptoKey> {
    const rawBuffer = base64ToBuffer(rawKeyBase64);
    return await window.crypto.subtle.importKey(
      'raw',
      rawBuffer as BufferSource,
      { name: 'AES-GCM', length: KEY_LENGTH },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Derives a CryptoKey from a passphrase and salt using PBKDF2 + SHA-256
   */
  static async deriveKey(password: string, salt: Uint8Array, iterations = PBKDF2_ITERATIONS): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);

    const baseKey = await window.crypto.subtle.importKey(
      'raw',
      passwordBuffer as BufferSource,
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    return await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt as BufferSource,
        iterations: iterations,
        hash: 'SHA-256',
      },
      baseKey,
      {
        name: 'AES-GCM',
        length: KEY_LENGTH,
      },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encrypts the vault payload directly with a random 256-bit Vault Key,
   * and wraps that Vault Key using the Master Password.
   */
  static async encryptVault(
    payload: DecryptedVaultPayload,
    masterPassword: string,
    existingVaultKeyBase64?: string
  ): Promise<EncryptedVaultEnvelope> {
    const vaultKeyBase64 = existingVaultKeyBase64 || this.generateVaultKey();
    const aesVaultKey = await this.importAesKey(vaultKeyBase64);

    // 1. Encrypt vault payload using AES-256-GCM keyed directly by Vault Key
    const payloadIv = this.getRandomBytes(IV_LENGTH);
    const jsonString = JSON.stringify(payload);
    const encodedData = new TextEncoder().encode(jsonString);

    const encryptedPayloadBuffer = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: payloadIv as BufferSource },
      aesVaultKey,
      encodedData as BufferSource
    );

    // 2. Wrap the Vault Key with Master Password derived key
    const masterSalt = this.getRandomBytes(SALT_LENGTH);
    const masterIv = this.getRandomBytes(IV_LENGTH);
    const masterDerivedKey = await this.deriveKey(masterPassword, masterSalt, PBKDF2_ITERATIONS);

    const encodedVaultKey = new TextEncoder().encode(vaultKeyBase64);
    const wrappedKeyBuffer = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: masterIv as BufferSource },
      masterDerivedKey,
      encodedVaultKey as BufferSource
    );

    const cryptoMeta: VaultCryptoMetadata = {
      algorithm: 'AES-GCM',
      kdf: 'PBKDF2',
      hash: 'SHA-256',
      iterations: PBKDF2_ITERATIONS,
      salt: bufferToBase64(masterSalt),
      iv: bufferToBase64(payloadIv),
      wrappedMasterKey: bufferToBase64(wrappedKeyBuffer),
      wrappedMasterIv: bufferToBase64(masterIv),
    };

    return {
      version: 1,
      appName: 'VaultKey',
      crypto: cryptoMeta,
      payload: bufferToBase64(encryptedPayloadBuffer),
    };
  }

  /**
   * Decrypts the vault using Master Password by unwrapping the Vault Key,
   * then decrypting the vault data.
   */
  static async decryptVault(
    envelope: EncryptedVaultEnvelope,
    masterPassword: string
  ): Promise<DecryptedVaultPayload> {
    if (!envelope || !envelope.crypto || !envelope.payload) {
      throw new Error('Invalid vault structure.');
    }

    const { payload } = await this.decryptVaultAndExtractKey(envelope, masterPassword);
    return payload;
  }

  /**
   * Decrypts the vault and returns both the payload and the unwrapped Vault Key
   */
  static async decryptVaultAndExtractKey(
    envelope: EncryptedVaultEnvelope,
    masterPassword: string
  ): Promise<{ payload: DecryptedVaultPayload; vaultKeyBase64: string }> {
    if (!envelope || !envelope.crypto || !envelope.payload) {
      throw new Error('Invalid vault structure.');
    }

    const masterSalt = base64ToBuffer(envelope.crypto.salt);
    const payloadIv = base64ToBuffer(envelope.crypto.iv);
    const ciphertextPayload = base64ToBuffer(envelope.payload);

    const masterDerivedKey = await this.deriveKey(
      masterPassword,
      masterSalt,
      envelope.crypto.iterations || PBKDF2_ITERATIONS
    );

    // Case 1: Standard Modern Envelope with wrapped Vault Key
    if (envelope.crypto.wrappedMasterKey && envelope.crypto.wrappedMasterIv) {
      const wrappedKeyBuffer = base64ToBuffer(envelope.crypto.wrappedMasterKey);
      const masterIvBuffer = base64ToBuffer(envelope.crypto.wrappedMasterIv);

      let vaultKeyBase64 = '';
      try {
        const unwrappedBuffer = await window.crypto.subtle.decrypt(
          { name: 'AES-GCM', iv: masterIvBuffer as BufferSource },
          masterDerivedKey,
          wrappedKeyBuffer as BufferSource
        );
        vaultKeyBase64 = new TextDecoder().decode(unwrappedBuffer);
      } catch {
        throw new Error('Invalid master password or corrupted key wrapper.');
      }

      const aesVaultKey = await this.importAesKey(vaultKeyBase64);

      try {
        const decryptedBuffer = await window.crypto.subtle.decrypt(
          { name: 'AES-GCM', iv: payloadIv as BufferSource },
          aesVaultKey,
          ciphertextPayload as BufferSource
        );
        const decodedText = new TextDecoder().decode(decryptedBuffer);
        return {
          payload: JSON.parse(decodedText) as DecryptedVaultPayload,
          vaultKeyBase64,
        };
      } catch {
        throw new Error('Corrupted vault ciphertext.');
      }
    }

    // Case 2: Legacy Envelope (encrypted directly with master derived key)
    try {
      const decryptedBuffer = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: payloadIv as BufferSource },
        masterDerivedKey,
        ciphertextPayload as BufferSource
      );

      const decodedText = new TextDecoder().decode(decryptedBuffer);
      const payload = JSON.parse(decodedText) as DecryptedVaultPayload;
      const vaultKeyBase64 = this.generateVaultKey();

      return { payload, vaultKeyBase64 };
    } catch {
      throw new Error('Invalid master password or corrupted vault.');
    }
  }

  /**
   * Decrypts the vault payload directly using the 256-bit Vault Key
   */
  static async decryptVaultWithKey(
    envelope: EncryptedVaultEnvelope,
    vaultKeyBase64: string
  ): Promise<DecryptedVaultPayload> {
    if (!envelope || !envelope.crypto || !envelope.payload) {
      throw new Error('Invalid vault structure.');
    }

    const payloadIv = base64ToBuffer(envelope.crypto.iv);
    const ciphertextPayload = base64ToBuffer(envelope.payload);
    const aesVaultKey = await this.importAesKey(vaultKeyBase64);

    try {
      const decryptedBuffer = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: payloadIv as BufferSource },
        aesVaultKey,
        ciphertextPayload as BufferSource
      );

      const decodedText = new TextDecoder().decode(decryptedBuffer);
      return JSON.parse(decodedText) as DecryptedVaultPayload;
    } catch {
      throw new Error('Failed to decrypt vault with active vault key.');
    }
  }

  /**
   * Encrypts the vault payload using an active Vault Key while preserving master wrapper
   */
  static async encryptVaultWithKey(
    payload: DecryptedVaultPayload,
    vaultKeyBase64: string,
    existingEnvelopeMeta: VaultCryptoMetadata
  ): Promise<EncryptedVaultEnvelope> {
    const payloadIv = this.getRandomBytes(IV_LENGTH);
    const aesVaultKey = await this.importAesKey(vaultKeyBase64);

    const jsonString = JSON.stringify(payload);
    const encodedData = new TextEncoder().encode(jsonString);

    const encryptedBuffer = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: payloadIv as BufferSource },
      aesVaultKey,
      encodedData as BufferSource
    );

    const updatedMeta: VaultCryptoMetadata = {
      ...existingEnvelopeMeta,
      iv: bufferToBase64(payloadIv),
    };

    return {
      version: 1,
      appName: 'VaultKey',
      crypto: updatedMeta,
      payload: bufferToBase64(encryptedBuffer),
    };
  }

  /**
   * Encrypt arbitrary text with an ad-hoc passphrase using AES-256-GCM (For Cipher utility)
   */
  static async encryptCustomText(text: string, passphrase: string): Promise<string> {
    const salt = this.getRandomBytes(16);
    const iv = this.getRandomBytes(12);
    const key = await this.deriveKey(passphrase, salt, 100000);

    const encoded = new TextEncoder().encode(text);
    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv as BufferSource },
      key,
      encoded as BufferSource
    );

    return `${bufferToBase64(salt)}:${bufferToBase64(iv)}:${bufferToBase64(encrypted)}`;
  }

  /**
   * Decrypt arbitrary text encrypted with encryptCustomText (For Cipher utility)
   */
  static async decryptCustomText(encryptedString: string, passphrase: string): Promise<string> {
    const parts = encryptedString.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted format. Expected "salt:iv:payload".');
    }

    const salt = base64ToBuffer(parts[0]);
    const iv = base64ToBuffer(parts[1]);
    const ciphertext = base64ToBuffer(parts[2]);

    const key = await this.deriveKey(passphrase, salt, 100000);

    try {
      const decrypted = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv as BufferSource },
        key,
        ciphertext as BufferSource
      );
      return new TextDecoder().decode(decrypted);
    } catch {
      throw new Error('Decryption failed. Incorrect passphrase or corrupted ciphertext.');
    }
  }
}
