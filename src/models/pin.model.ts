export interface PinWrappedKeyEnvelope {
  salt: string;       // base64 PBKDF2 salt
  iv: string;         // base64 AES-GCM IV
  iterations: number; // PBKDF2 iterations (e.g. 100000)
  wrappedKey: string; // base64 ciphertext
}

export interface PinLockoutInfo {
  isLocked: boolean;
  remainingSeconds: number;
  failedAttempts: number;
  requireMasterPassword?: boolean;
}
