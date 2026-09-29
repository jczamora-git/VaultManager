# Changelog

All notable changes to Vaultify will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-09-30

### Added
- Seven dynamic Vaultify accent colors: Red, Blue, Purple, Green, Yellow, Orange, and Pink.
- New category picker bottom sheet before creating a login.
- Category preselection when opening the New Login form.
- Shared accent-color personalization across Settings and Local Profile.

### Improved
- Light, Dark, and System theme consistency.
- Semantic theme tokens across Vaultify UI.
- Generator and Analyzer dark-theme surfaces and text contrast.
- Dynamic native status-bar accent handling.
- Credential website/domain favicon caching and first-fetch behavior.
- Website URL normalization and Open action behavior.
- PIN, Settings, Cipher, Generator, Vault, credential, and shared-control theming.
- Add Login flow across Vault card, FAB, and empty state.

### Fixed
- New website domains could fail to fetch their favicon immediately when the daily refresh interval was not due.
- Some UI components still used hardcoded Vaultify red instead of the selected dynamic accent.
- Generator Analyzer could display light cards with unreadable text in Dark Theme.
- Some PIN/shared icons did not correctly inherit the active accent.
- Remaining theme inconsistencies between newer hero-sheet pages and older Settings/Danger pages.
- Updated Delete Vault Data UI to match the modern Vaultify hero-sheet system.

### Changed
- Brand accent colors are now independent from Light/Dark appearance.
- Destructive, warning, success, and password-strength colors remain independent from the selected brand accent.
- Creating a credential now starts with category selection before entering the New Login form.
- Delete Vault Data now follows the same visual language as Backup and other Settings pages.

### Compatibility
- No intended breaking changes to existing encrypted credentials or normal vault usage.

## [1.0.0] - 2026-09-01

### Added
- Initial official release of Vaultify local-first encrypted password manager.
- Zero-knowledge AES-256-GCM vault encryption and PBKDF2 key derivation.
- 6-digit PIN and Biometric quick-unlock.
- Encrypted backup export and import.
- Password generator and cipher tools.
