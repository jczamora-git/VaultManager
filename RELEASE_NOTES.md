# Vaultify v1.1.0 — Personalization & Smarter Login Creation

Vaultify v1.1.0 expands personalization and improves the credential creation experience.

## What's new:

- **Seven dynamic accent colors**: Red, Blue, Purple, Green, Yellow, Orange, and Pink.
- **Improved theme consistency**: Streamlined Light, Dark, and System theme appearance across all screens.
- **Category selection bottom sheet**: Native bottom sheet to choose a category before creating credentials.
- **Smarter category preselection**: Preselects chosen category when opening the New Login form while keeping it fully editable.
- **Improved favicon fetching**: Instant missing icon fetching and repair for newly encountered website domains.
- **Improved website URL normalization**: Better domain extraction and Launch/Open behavior.
- **Enhanced Dark Theme contrast**: High-contrast dark-mode surfaces and typography for Password Generator and Analyzer.
- **Shared UI theming**: Updated PIN keypad, Cipher, Settings, Vault, credential rows, and shared components.
- **Refreshed Delete Vault Data**: Modernized destructive action screen using the Vaultify hero-sheet architecture.

## Security Semantics

Security semantics remain strictly separate from personalization:
- Destructive actions remain danger red (`--vk-danger`).
- Warnings retain warning amber/orange.
- Password-strength states retain their security-status indicators.
- Core cryptographic protections (AES-256-GCM, PBKDF2, Argon2id, hardware biometric wrapping) remain unchanged.

## Compatibility

- No intended breaking changes to existing encrypted credentials, categories, or normal vault usage.
