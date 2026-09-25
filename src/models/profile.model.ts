export type AvatarType = 'initials' | 'local-image';

export interface LocalProfile {
  id: string;
  displayName: string;
  avatarType: AvatarType;
  avatarColor: string;
  avatarValue?: string;
  avatarStyle?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppMetadata {
  onboardingComplete: boolean;
  profile: LocalProfile;
  security: {
    pinConfigured: boolean;
    biometricEnabled: boolean;
    autoLockMinutes: number;
    lockOnBackground: boolean;
    clipboardClearSeconds: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AvatarPaletteOption {
  id: string;
  label: string;
  color: string;
  text: string;
}

export const AVATAR_PALETTES: AvatarPaletteOption[] = [
  { id: 'red', label: 'Brand Red', color: '#B82825', text: '#FFFFFF' },
  { id: 'charcoal', label: 'Charcoal', color: '#2D3748', text: '#FFFFFF' },
  { id: 'slate', label: 'Warm Slate', color: '#4A5568', text: '#FFFFFF' },
  { id: 'green', label: 'Muted Green', color: '#2F855A', text: '#FFFFFF' },
  { id: 'violet', label: 'Muted Violet', color: '#6B46C1', text: '#FFFFFF' },
];

/**
 * Generate 1-2 uppercase initials from a display name
 */
export function generateInitials(name: string): string {
  if (!name) return 'V';
  const trimmed = name.trim();
  if (!trimmed) return 'V';

  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, Math.min(2, parts[0].length)).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
