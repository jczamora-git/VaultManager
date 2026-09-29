export type ThemeMode = 'system' | 'light' | 'dark';
export type AccentColor =
  | 'red'
  | 'blue'
  | 'purple'
  | 'green'
  | 'yellow'
  | 'orange'
  | 'pink';

export const VALID_ACCENTS: readonly AccentColor[] = [
  'red',
  'blue',
  'purple',
  'green',
  'yellow',
  'orange',
  'pink',
] as const;

export function isValidAccent(val: unknown): val is AccentColor {
  return typeof val === 'string' && (VALID_ACCENTS as readonly string[]).includes(val);
}

export interface AccentOptionMetadata {
  value: AccentColor;
  label: string;
}

export const ACCENT_OPTIONS: AccentOptionMetadata[] = [
  { value: 'red', label: 'Red (Default)' },
  { value: 'blue', label: 'Blue' },
  { value: 'purple', label: 'Purple' },
  { value: 'green', label: 'Green' },
  { value: 'yellow', label: 'Yellow' },
  { value: 'orange', label: 'Orange' },
  { value: 'pink', label: 'Pink' },
];

export type AutoLockTimeout = 0 | 30 | 60 | 300 | 900 | -1; // -1 = Never, seconds
export type ClipboardTimeout = 0 | 15 | 30 | 60; // 0 = Never, seconds

export interface AppSettings {
  theme: ThemeMode;
  accent: AccentColor;
  autoLockTimeout: AutoLockTimeout;
  lockOnBackground: boolean;
  clipboardTimeout: ClipboardTimeout;
  biometricsEnabled: boolean;
  maskPasswordsInDetailByDefault: boolean;
  hapticsEnabled: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  accent: 'red',
  autoLockTimeout: 300, // 5 minutes
  lockOnBackground: true,
  clipboardTimeout: 30, // 30 seconds
  biometricsEnabled: false,
  maskPasswordsInDetailByDefault: true,
  hapticsEnabled: true,
};
