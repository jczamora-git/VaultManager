import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { Credential, CredentialCategory, CredentialFormData } from '@/models/credential.model';
import { DecryptedVaultPayload, EncryptedVaultEnvelope, VaultStateSummary } from '@/models/vault.model';
import { useAuthStore } from './auth.store';
import { CryptoService } from '@/services/crypto.service';
import { StorageService } from '@/services/storage.service';
import { FaviconService } from '@/services/favicon.service';
import { PasswordGeneratorService } from '@/services/password-generator.service';
import { WebsiteIconCacheService } from '@/services/websiteIconCache.service';

export const useVaultStore = defineStore('vault', () => {
  const credentials = ref<Credential[]>([]);
  const createdAt = ref<string>(new Date().toISOString());
  const updatedAt = ref<string>(new Date().toISOString());

  const searchQuery = ref('');
  const selectedCategory = ref<CredentialCategory | 'All'>('All');
  const sortBy = ref<'title' | 'updatedAt' | 'createdAt'>('title');
  const sortOrder = ref<'asc' | 'desc'>('asc');

  const authStore = useAuthStore();

  /**
   * Set in-memory decrypted payload
   */
  function setDecryptedPayload(payload: DecryptedVaultPayload) {
    credentials.value = payload.credentials || [];
    createdAt.value = payload.metadata?.createdAt || new Date().toISOString();
    updatedAt.value = payload.metadata?.updatedAt || new Date().toISOString();

    // 1. Repair missing icons immediately on unlock/load (never blocked by 24h timer)
    const allDomains = credentials.value.map((c) => c.domain || c.website).filter(Boolean) as string[];
    WebsiteIconCacheService.ensureMissingIcons(allDomains);

    // 2. Trigger daily background icon refresh sweep for existing cached icons if 24h elapsed (non-blocking)
    WebsiteIconCacheService.refreshAllIfDue(allDomains);
  }

  /**
   * Clear in-memory vault data
   */
  function clearInMemoryData() {
    credentials.value = [];
  }

  /**
   * Encrypts and persists the current state to storage
   */
  async function persistVault(): Promise<void> {
    const envelope = await StorageService.getEncryptedVault();
    if (!authStore.cachedVaultKey && !authStore.cachedMasterPassword) {
      throw new Error('Vault is not unlocked; cannot persist changes.');
    }

    updatedAt.value = new Date().toISOString();
    const payload: DecryptedVaultPayload = {
      version: 1,
      credentials: credentials.value,
      metadata: {
        createdAt: createdAt.value,
        updatedAt: updatedAt.value,
      },
    };

    if (authStore.cachedVaultKey && envelope?.crypto) {
      const newEnvelope = await CryptoService.encryptVaultWithKey(payload, authStore.cachedVaultKey, envelope.crypto);
      await StorageService.saveEncryptedVault(newEnvelope);
    } else if (authStore.cachedMasterPassword) {
      const newEnvelope = await CryptoService.encryptVault(payload, authStore.cachedMasterPassword, authStore.cachedVaultKey || undefined);
      await StorageService.saveEncryptedVault(newEnvelope);
    }
  }

  /**
   * Exports envelope for backup
   */
  async function getExportEnvelope(): Promise<EncryptedVaultEnvelope | null> {
    return await StorageService.getEncryptedVault();
  }

  /**
   * Get payload snapshot
   */
  function getPayloadSnapshot(): DecryptedVaultPayload {
    return {
      version: 1,
      credentials: credentials.value,
      metadata: {
        createdAt: createdAt.value,
        updatedAt: updatedAt.value,
      },
    };
  }

  /**
   * Computed: Filtered and sorted credentials
   */
  const filteredCredentials = computed(() => {
    let list = [...credentials.value];

    // Search query filter (title, domain, website, email, username, notes)
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase().trim();
      list = list.filter((item) => {
        return (
          item.title.toLowerCase().includes(q) ||
          (item.domain && item.domain.toLowerCase().includes(q)) ||
          (item.website && item.website.toLowerCase().includes(q)) ||
          (item.email && item.email.toLowerCase().includes(q)) ||
          (item.username && item.username.toLowerCase().includes(q)) ||
          (item.notes && item.notes.toLowerCase().includes(q))
        );
      });
    }

    // Category filter
    if (selectedCategory.value !== 'All') {
      list = list.filter((item) => item.category === selectedCategory.value);
    }

    // Sorting
    list.sort((a, b) => {
      let comparison = 0;
      if (sortBy.value === 'title') {
        comparison = a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
      } else if (sortBy.value === 'updatedAt') {
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      } else if (sortBy.value === 'createdAt') {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return sortOrder.value === 'asc' ? comparison : -comparison;
    });

    return list;
  });

  /**
   * Computed: Favorites list
   */
  const favoriteCredentials = computed(() => {
    return credentials.value.filter((item) => item.favorite);
  });

  /**
   * Computed: Recently modified / viewed credentials
   */
  const recentCredentials = computed(() => {
    return [...credentials.value]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);
  });

  /**
   * Computed: Vault Summary stats
   */
  const summary = computed<VaultStateSummary>(() => {
    const categoryCounts: Record<string, number> = {};
    let weakCount = 0;
    const passwordMap = new Map<string, number>();

    credentials.value.forEach((item) => {
      // Category count
      categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;

      // Weak password check
      const analysis = PasswordGeneratorService.analyze(item.password);
      if (analysis.score < 2) {
        weakCount++;
      }

      // Reused count
      if (item.password) {
        passwordMap.set(item.password, (passwordMap.get(item.password) || 0) + 1);
      }
    });

    let reusedCount = 0;
    passwordMap.forEach((count) => {
      if (count > 1) reusedCount += count;
    });

    return {
      totalCount: credentials.value.length,
      favoriteCount: favoriteCredentials.value.length,
      categoryCounts,
      weakPasswordCount: weakCount,
      reusedPasswordCount: reusedCount,
    };
  });

  /**
   * Get single credential by ID
   */
  function getCredentialById(id: string): Credential | undefined {
    return credentials.value.find((c) => c.id === id);
  }

  /**
   * Add new credential
   */
  async function addCredential(formData: CredentialFormData): Promise<Credential> {
    const now = new Date().toISOString();
    const domain = formData.website ? WebsiteIconCacheService.normalizeDomain(formData.website) : undefined;
    const favicon = domain ? FaviconService.getFaviconUrl(domain) : undefined;

    // Generate random UUID
    const id = crypto.randomUUID ? crypto.randomUUID() : `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newCredential: Credential = {
      id,
      title: formData.title.trim(),
      website: formData.website?.trim() || undefined,
      url: formData.website?.trim() || undefined,
      domain: domain || undefined,
      favicon: favicon || undefined,
      email: formData.email?.trim() || undefined,
      username: formData.username?.trim() || undefined,
      password: formData.password,
      notes: formData.notes?.trim() || undefined,
      category: formData.category || 'Other',
      favorite: !!formData.favorite,
      createdAt: now,
      updatedAt: now,
    };

    credentials.value.unshift(newCredential);
    await persistVault();

    // If new domain is not cached yet, fetch it immediately in background if online
    if (domain) {
      WebsiteIconCacheService.clearFailedDomain(domain);
      void WebsiteIconCacheService.ensureIcon(domain);
    }

    return newCredential;
  }

  /**
   * Update existing credential
   */
  async function updateCredential(id: string, formData: Partial<CredentialFormData>): Promise<Credential> {
    const index = credentials.value.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new Error(`Credential with id "${id}" not found.`);
    }

    const existing = credentials.value[index];
    const now = new Date().toISOString();

    const website = formData.website !== undefined ? formData.website.trim() : existing.website;
    const domain = website ? WebsiteIconCacheService.normalizeDomain(website) : undefined;
    const favicon = domain ? FaviconService.getFaviconUrl(domain) : undefined;

    const updated: Credential = {
      ...existing,
      title: formData.title !== undefined ? formData.title.trim() : existing.title,
      website: website || undefined,
      url: website || undefined,
      domain: domain || undefined,
      favicon: favicon || undefined,
      email: formData.email !== undefined ? formData.email.trim() || undefined : existing.email,
      username: formData.username !== undefined ? formData.username.trim() || undefined : existing.username,
      password: formData.password !== undefined ? formData.password : existing.password,
      notes: formData.notes !== undefined ? formData.notes.trim() || undefined : existing.notes,
      category: formData.category !== undefined ? formData.category : existing.category,
      favorite: formData.favorite !== undefined ? formData.favorite : existing.favorite,
      updatedAt: now,
    };

    credentials.value[index] = updated;
    await persistVault();

    // If domain changed/added and is uncached, fetch immediately in background if online
    if (domain) {
      WebsiteIconCacheService.clearFailedDomain(domain);
      void WebsiteIconCacheService.ensureIcon(domain);
    }

    return updated;
  }

  /**
   * Delete credential by ID
   */
  async function deleteCredential(id: string): Promise<void> {
    const initialLen = credentials.value.length;
    credentials.value = credentials.value.filter((c) => c.id !== id);
    if (credentials.value.length !== initialLen) {
      await persistVault();
      // Clean up orphaned icons
      const remainingDomains = credentials.value.map((c) => c.domain || c.website).filter(Boolean) as string[];
      WebsiteIconCacheService.cleanupOrphans(remainingDomains);
    }
  }

  /**
   * Toggle favorite status
   */
  async function toggleFavorite(id: string): Promise<boolean> {
    const item = credentials.value.find((c) => c.id === id);
    if (item) {
      item.favorite = !item.favorite;
      item.updatedAt = new Date().toISOString();
      await persistVault();
      return item.favorite;
    }
    return false;
  }

  /**
   * Record last viewed timestamp
   */
  function recordView(id: string): void {
    const item = credentials.value.find((c) => c.id === id);
    if (item) {
      item.lastViewedAt = new Date().toISOString();
    }
  }

  return {
    credentials,
    createdAt,
    updatedAt,
    searchQuery,
    selectedCategory,
    sortBy,
    sortOrder,
    filteredCredentials,
    favoriteCredentials,
    recentCredentials,
    summary,
    setDecryptedPayload,
    clearInMemoryData,
    persistVault,
    getExportEnvelope,
    getPayloadSnapshot,
    getCredentialById,
    addCredential,
    updateCredential,
    deleteCredential,
    toggleFavorite,
    recordView,
  };
});
