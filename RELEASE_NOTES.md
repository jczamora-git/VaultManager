# Vaultify 1.0.0

Initial Release — September 2026

## Overview

Vaultify 1.0.0 is the official initial release of the privacy-first, offline-first local password manager built with Ionic Vue and Capacitor.

## Features

- **Local encrypted credential vault**: Zero-knowledge AES-GCM-256 local encrypted storage with PBKDF2 key derivation.
- **Master Password protection**: Robust cryptographic protection for the 256-bit vault key.
- **6-digit PIN unlock**: Ergonomic quick unlock designed for mobile one-handed access with lockout safety.
- **Biometric quick unlock**: Native Face ID / Fingerprint sensor integration with secure hardware token wrapping.
- **Credential management**: Full CRUD for accounts with masked visibility, favorite filtering, instant search, and domain extraction.
- **Categories and favorites**: Structured categorization (Logins, Cards, Secure Notes, Identity) and favorite pinning.
- **Password generator**: Cryptographically secure generator utilizing Web Crypto API entropy with custom rules.
- **Cipher utility**: On-device encryption (AES-256-GCM), encoding (Base64), and classic ciphers (Caesar, ROT13, Vigenère).
- **Local profile**: Personalized display name, dynamic initials, customizable avatar palette, and time-aware greetings.
- **Encrypted backup import/export**: Versioned portable backup format (`vaultify-backup-YYYY-MM-DD.json`) bundling profile, credentials, and settings.
- **Offline-first functionality**: 100% of core features operate without network connectivity or account signups.
- **Light/dark themes**: Polished red/neutral design system with support for Light Mode, Dark Mode, and System appearance.
