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

import { AccentColor } from './settings.model';

export interface AvatarPaletteOption {
  id: string;
  label: string;
  color: string;
  text: string;
  accent?: AccentColor;
}

export const AVATAR_PALETTES: AvatarPaletteOption[] = [
  { id: 'red', label: 'Vaultify Red', color: '#B82825', text: '#FFFFFF', accent: 'red' },
  { id: 'blue', label: 'Ocean Blue', color: '#2563EB', text: '#FFFFFF', accent: 'blue' },
  { id: 'purple', label: 'Royal Purple', color: '#6B46C1', text: '#FFFFFF', accent: 'purple' },
  { id: 'green', label: 'Forest Green', color: '#16865C', text: '#FFFFFF', accent: 'green' },
  { id: 'yellow', label: 'Vibrant Yellow', color: '#F4C430', text: '#1A1A1A', accent: 'yellow' },
  { id: 'orange', label: 'Sunset Orange', color: '#EA6A1B', text: '#FFFFFF', accent: 'orange' },
  { id: 'pink', label: 'Rose Pink', color: '#DB3E7C', text: '#FFFFFF', accent: 'pink' },
];

/**
 * Derives app accent from profile avatar color if matched
 */
export function getAccentFromColor(color?: string): AccentColor | null {
  if (!color) return null;
  const c = color.toLowerCase().trim();
  if (c === '#d02724' || c === '#b82825' || c === '#b8201e' || c === '#b51f1f' || c === 'red') return 'red';
  if (c === '#2563eb' || c === '#1d4ed8' || c === '#3b82f6' || c === 'blue') return 'blue';
  if (c === '#6b46c1' || c === '#5b37a8' || c === '#7c3aed' || c === '#8b5cf6' || c === 'purple' || c === 'violet') return 'purple';
  if (c === '#16865c' || c === '#2f855a' || c === '#11734e' || c === '#10b981' || c === 'green') return 'green';
  if (c === '#f4c430' || c === '#e0ae18' || c === '#fad750' || c === 'yellow') return 'yellow';
  if (c === '#ea6a1b' || c === '#d75a0d' || c === '#f97316' || c === 'orange') return 'orange';
  if (c === '#db3e7c' || c === '#c62f69' || c === '#ec4899' || c === 'pink') return 'pink';
  return null;
}

/**
 * Derives avatar hex color for a given accent
 */
export function getColorFromAccent(accent: AccentColor): string {
  const match = AVATAR_PALETTES.find((p) => p.accent === accent);
  return match ? match.color : '#B82825';
}

/**
 * Provides readable text color (dark initials on bright yellow, white on others)
 */
export function getAvatarTextColor(color?: string): string {
  if (!color) return '#FFFFFF';
  const c = color.toLowerCase().trim();
  if (c === '#f4c430' || c === '#e0ae18' || c === '#fad750' || c === 'yellow') {
    return '#1A1A1A';
  }
  return '#FFFFFF';
}

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
