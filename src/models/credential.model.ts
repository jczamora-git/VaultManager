export type CredentialCategory =
  | 'Social'
  | 'Email'
  | 'Work'
  | 'School'
  | 'Development'
  | 'Banking'
  | 'Shopping'
  | 'Entertainment'
  | 'Gaming'
  | 'Other';

export interface CategoryInfo {
  id: CredentialCategory;
  name: string;
  icon: string; // Lucide or Ionic icon identifier
  color: string;
  description: string;
}

export const DEFAULT_CATEGORIES: CategoryInfo[] = [
  { id: 'Social', name: 'Social', icon: 'Share2', color: '#3b82f6', description: 'Social networks and communities' },
  { id: 'Email', name: 'Email', icon: 'Mail', color: '#6366f1', description: 'Email accounts and inboxes' },
  { id: 'Work', name: 'Work', icon: 'Briefcase', color: '#0ea5e9', description: 'Workplace and business accounts' },
  { id: 'School', name: 'School', icon: 'GraduationCap', color: '#10b981', description: 'Education and learning accounts' },
  { id: 'Development', name: 'Developer', icon: 'Code', color: '#8b5cf6', description: 'Developer tools and services' },
  { id: 'Banking', name: 'Banking & Finance', icon: 'Landmark', color: '#f59e0b', description: 'Banks, wallets, and investments' },
  { id: 'Shopping', name: 'Shopping', icon: 'ShoppingBag', color: '#ec4899', description: 'Online stores and marketplaces' },
  { id: 'Entertainment', name: 'Entertainment', icon: 'Tv', color: '#f43f5e', description: 'Streaming and media platforms' },
  { id: 'Gaming', name: 'Gaming', icon: 'Gamepad2', color: '#14b8a6', description: 'Gaming platforms and launchers' },
  { id: 'Other', name: 'Other', icon: 'Key', color: '#64748b', description: 'Anything else' },
];

/**
 * Validates and safely parses a category string into a valid CredentialCategory.
 * Case-insensitive and handles aliases like 'developer' -> 'Development'.
 */
export function parseCredentialCategory(val: unknown, fallback: CredentialCategory = 'Other'): CredentialCategory {
  if (typeof val !== 'string') return fallback;
  const trimmed = val.trim().toLowerCase();
  if (!trimmed) return fallback;

  for (const cat of DEFAULT_CATEGORIES) {
    if (cat.id.toLowerCase() === trimmed || cat.name.toLowerCase() === trimmed) {
      return cat.id;
    }
  }

  if (trimmed === 'developer' || trimmed === 'dev') {
    return 'Development';
  }

  return fallback;
}

export interface Credential {
  id: string;
  title: string;
  website?: string;
  url?: string;
  domain?: string;
  favicon?: string;
  email?: string;
  username?: string;
  password: string;
  notes?: string;
  category: CredentialCategory;
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
  lastViewedAt?: string;
}

export interface CredentialFormData {
  title: string;
  website?: string;
  email?: string;
  username?: string;
  password: string;
  notes?: string;
  category: CredentialCategory;
  favorite: boolean;
}
