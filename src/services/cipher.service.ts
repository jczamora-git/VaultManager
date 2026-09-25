import { CryptoService } from './crypto.service';

export class CipherService {
  /**
   * Caesar Cipher
   */
  static caesarEncrypt(text: string, shift: number): string {
    const normalizedShift = ((shift % 26) + 26) % 26;
    let result = '';

    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      // Uppercase letters (A-Z)
      if (code >= 65 && code <= 90) {
        result += String.fromCharCode(((code - 65 + normalizedShift) % 26) + 65);
      }
      // Lowercase letters (a-z)
      else if (code >= 97 && code <= 122) {
        result += String.fromCharCode(((code - 97 + normalizedShift) % 26) + 97);
      } else {
        result += text[i];
      }
    }
    return result;
  }

  static caesarDecrypt(text: string, shift: number): string {
    return this.caesarEncrypt(text, -shift);
  }

  /**
   * ROT13 Cipher (Symmetric)
   */
  static rot13(text: string): string {
    return this.caesarEncrypt(text, 13);
  }

  /**
   * Vigenère Cipher
   */
  static vigenereEncrypt(text: string, key: string): string {
    const cleanKey = key.replace(/[^a-zA-Z]/g, '').toUpperCase();
    if (!cleanKey) {
      throw new Error('Key must contain at least one letter.');
    }

    let result = '';
    let keyIndex = 0;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const code = text.charCodeAt(i);
      const shift = cleanKey.charCodeAt(keyIndex % cleanKey.length) - 65;

      if (code >= 65 && code <= 90) {
        result += String.fromCharCode(((code - 65 + shift) % 26) + 65);
        keyIndex++;
      } else if (code >= 97 && code <= 122) {
        result += String.fromCharCode(((code - 97 + shift) % 26) + 97);
        keyIndex++;
      } else {
        result += char;
      }
    }

    return result;
  }

  static vigenereDecrypt(text: string, key: string): string {
    const cleanKey = key.replace(/[^a-zA-Z]/g, '').toUpperCase();
    if (!cleanKey) {
      throw new Error('Key must contain at least one letter.');
    }

    let result = '';
    let keyIndex = 0;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const code = text.charCodeAt(i);
      const shift = cleanKey.charCodeAt(keyIndex % cleanKey.length) - 65;

      if (code >= 65 && code <= 90) {
        result += String.fromCharCode(((code - 65 - shift + 26) % 26) + 65);
        keyIndex++;
      } else if (code >= 97 && code <= 122) {
        result += String.fromCharCode(((code - 97 - shift + 26) % 26) + 97);
        keyIndex++;
      } else {
        result += char;
      }
    }

    return result;
  }

  /**
   * Base64 Encoding & Decoding (UTF-8 safe)
   */
  static base64Encode(text: string): string {
    const utf8Bytes = new TextEncoder().encode(text);
    let binary = '';
    for (let i = 0; i < utf8Bytes.length; i++) {
      binary += String.fromCharCode(utf8Bytes[i]);
    }
    return window.btoa(binary);
  }

  static base64Decode(base64: string): string {
    try {
      const binary = window.atob(base64.trim());
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return new TextDecoder().decode(bytes);
    } catch {
      throw new Error('Invalid Base64 format.');
    }
  }

  /**
   * AES-256-GCM symmetric text encryption
   */
  static async aesEncrypt(text: string, passphrase: string): Promise<string> {
    if (!passphrase.trim()) {
      throw new Error('Passphrase is required for AES-256-GCM encryption.');
    }
    return await CryptoService.encryptCustomText(text, passphrase);
  }

  static async aesDecrypt(ciphertext: string, passphrase: string): Promise<string> {
    if (!passphrase.trim()) {
      throw new Error('Passphrase is required for AES-256-GCM decryption.');
    }
    return await CryptoService.decryptCustomText(ciphertext.trim(), passphrase);
  }
}
