export type ThemeMode = 'system' | 'light' | 'dark';

export type AutoLockTimeout = 0 | 30 | 60 | 300 | 900 | -1; // -1 = Never, seconds
export type ClipboardTimeout = 0 | 15 | 30 | 60; // 0 = Never, seconds

export interface AppSettings {
  theme: ThemeMode;
  autoLockTimeout: AutoLockTimeout;
  lockOnBackground: boolean;
  clipboardTimeout: ClipboardTimeout;
  biometricsEnabled: boolean;
  maskPasswordsInDetailByDefault: boolean;
  hapticsEnabled: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  autoLockTimeout: 300, // 5 minutes
  lockOnBackground: true,
  clipboardTimeout: 30, // 30 seconds
  biometricsEnabled: false,
  maskPasswordsInDetailByDefault: true,
  hapticsEnabled: true,
};
