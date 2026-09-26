export type CipherAlgorithm = 'AES-GCM' | 'Caesar' | 'ROT13' | 'Vigenere' | 'Base64';

export interface CipherAlgorithmInfo {
  id: CipherAlgorithm;
  name: string;
  badge: 'Secure' | 'Educational' | 'Encoding';
  badgeColor: 'success' | 'warning' | 'medium';
  description: string;
}

export const CIPHER_ALGORITHMS: CipherAlgorithmInfo[] = [
  {
    id: 'Caesar',
    name: 'Caesar Cipher',
    badge: 'Educational',
    badgeColor: 'warning',
    description: 'Classical substitution cipher by shifting letters. NOT secure for real secrets.',
  },
  {
    id: 'ROT13',
    name: 'ROT13',
    badge: 'Educational',
    badgeColor: 'warning',
    description: 'Special Caesar cipher with fixed 13-letter shift. Symmetric rotate tool for spoilers/obfuscation.',
  },
  {
    id: 'Vigenere',
    name: 'Vigenère Cipher',
    badge: 'Educational',
    badgeColor: 'warning',
    description: 'Polyalphabetic substitution cipher using a secret keyword. Historic and educational only.',
  },
  {
    id: 'Base64',
    name: 'Base64',
    badge: 'Encoding',
    badgeColor: 'medium',
    description: 'Binary-to-text encoding scheme. Provides NO confidentiality or encryption security.',
  },
  {
    id: 'AES-GCM',
    name: 'AES-256-GCM',
    badge: 'Secure',
    badgeColor: 'success',
    description: 'Authenticated, military-grade symmetric encryption derived with PBKDF2. Safe for confidential data.',
  },
];
