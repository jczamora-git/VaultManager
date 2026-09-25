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
}

export const DEFAULT_CATEGORIES: CategoryInfo[] = [
  { id: 'Social', name: 'Social', icon: 'Share2', color: '#3b82f6' },
  { id: 'Email', name: 'Email', icon: 'Mail', color: '#6366f1' },
  { id: 'Work', name: 'Work', icon: 'Briefcase', color: '#0ea5e9' },
  { id: 'School', name: 'School', icon: 'GraduationCap', color: '#10b981' },
  { id: 'Development', name: 'Development', icon: 'Code', color: '#8b5cf6' },
  { id: 'Banking', name: 'Banking & Finance', icon: 'Landmark', color: '#f59e0b' },
  { id: 'Shopping', name: 'Shopping', icon: 'ShoppingBag', color: '#ec4899' },
  { id: 'Entertainment', name: 'Entertainment', icon: 'Tv', color: '#f43f5e' },
  { id: 'Gaming', name: 'Gaming', icon: 'Gamepad2', color: '#14b8a6' },
  { id: 'Other', name: 'Other', icon: 'Key', color: '#64748b' },
];

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
