# Vaultify 🔐

A privacy-first, offline-first password manager built with **Ionic Vue** and **Capacitor**.

---

## ✨ Key Features

- **Local Encrypted Vault**: Zero-knowledge storage utilizing authenticated AES-GCM-256 with PBKDF2 (250,000 iterations). Credentials are encrypted before saving to disk.
- **Master Password Protection**: High-security Master Password ensures cryptographic integrity and data safety.
- **6-Digit Quick Unlock PIN**: Thumb-friendly everyday PIN authentication wrapped and protected with PBKDF2 with attempt lockout security.
- **Biometric Unlock**: Integrated native biometric authentication (Face ID & Fingerprint) backed by platform Keychains/Keystores.
- **Password Generator**: Cryptographically secure password generator with customizable length, symbols, numbers, and ambiguity filters.
- **Cipher Tools**: Multi-algorithm utility supporting AES-256-GCM encryption, Base64 encoding, and educational ciphers (Caesar, ROT13, Vigenère).
- **Categories & Favorites**: Clean organization with instant search, category filtering, and favorites.
- **Encrypted Profile Backup**: Full portable encrypted backup and restore (`vaultify-backup-YYYY-MM-DD.json`) bundling local profile, credentials, and preferences without exposing raw PINs or device biometric secrets.
- **Local Profile Greetings**: Localized profile display names and time-of-day dynamic greetings ("Good morning, John.", "Good afternoon, John.", etc.).
- **Configurable Auto-Lock**: Automatic inactivity timer and lock-on-background capabilities.
- **Light / Dark Themes**: Beautiful red, black, and neutral design system with full Dark Mode and Light Mode support.

---

## 🛠️ Technology Stack

- **Framework**: Ionic Vue 8 + Vue 3 Composition API (`<script setup lang="ts">`)
- **Language**: TypeScript (Strict Mode)
- **Build Tool**: Vite
- **State Management**: Pinia
- **Routing**: Ionic Vue Router (`@ionic/vue-router`)
- **Native Platform**: Capacitor 6 (`@capacitor/core`, `@capacitor/preferences`, `@capacitor/app`, `@capacitor/haptics`, `@capgo/capacitor-native-biometric`)
- **Cryptography**: Web Crypto API (`SubtleCrypto`, `crypto.getRandomValues`)
- **Styling**: Vanilla CSS Design System with tokens and Inter typography

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Locally in Development Mode
```bash
npm run dev
```

### 3. Build Production Bundle
```bash
npm run build
```

### 4. Android Local Build

#### Sync Capacitor Android Assets:
```bash
npx cap sync android
```

#### Build Debug APK Locally:
- **Windows (PowerShell / Command Prompt)**:
  ```powershell
  cd android
  .\gradlew.bat assembleDebug
  ```
- **macOS / Linux**:
  ```bash
  cd android
  ./gradlew assembleDebug
  ```

Output APK will be located at:
`android/app/build/outputs/apk/debug/app-debug.apk`

---

## 🤖 GitHub Actions CI/CD & Releases

The repository includes automated CI/CD via GitHub Actions at `.github/workflows/build.yml`.

### Build Triggers

- **Automatic Build**: Every push and pull request to the `main` branch.
- **Manual Build**: Go to **GitHub** → **Actions** → **Vaultify Build** → **Run workflow**.
- **Release Build**: Pushing a version tag (e.g., `v1.0.0`) automatically builds both Debug & Release APKs/AAB bundles and publishes a GitHub Release.

### Creating a Release:
```bash
git tag v1.0.0
git push origin v1.0.0
```

### Downloading Build Artifacts:
1. Navigate to **GitHub** → **Actions**.
2. Click on the latest run under **Vaultify Build**.
3. Scroll down to the **Artifacts** section to download `Vaultify-Android-Debug` (or `Vaultify-Android-Release`).

---

## 🔒 Security Architecture

```
                       RANDOM 256-BIT VAULT KEY
                                  │
      ┌───────────────────────────┼───────────────────────────┐
      │                           │                           │
      ▼                           ▼                           ▼
 MASTER PASSWORD             6-DIGIT PIN              DEVICE BIOMETRICS
  PBKDF2 Derivation       PBKDF2 Derivation       Native Secure Hardware
  Primary Encryption      Quick Unlock Access      Keychain / Keystore
```

- **Zero Online Backend**: Core Vaultify functionality requires no cloud, account, or internet connection.
- **Disclosed Network Access**: Optional website favicon retrieval may access website domains when available, without transmitting any credentials or personal data.
