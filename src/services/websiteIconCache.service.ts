import { reactive } from 'vue';
import { StorageService } from './storage.service';

export const WEBSITE_ICON_REFRESH_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface CachedWebsiteIcon {
  domain: string;
  dataUrl: string;
  contentHash?: string;
  etag?: string;
  lastModified?: string;
  lastCheckedAt: number;
  updatedAt: number;
}

const DB_NAME = 'vaultify_website_icons_db';
const DB_VERSION = 1;
const STORE_NAME = 'website_icons';
const MAX_CACHED_ICONS = 200;

export class WebsiteIconCacheService {
  private static dbPromise: Promise<IDBDatabase> | null = null;
  private static refreshPromise: Promise<void> | null = null;
  private static isInitialized = false;

  // Reactive in-memory map of domain -> dataUrl for synchronous, flicker-free Vue rendering
  public static reactiveIconMap = reactive<Map<string, string>>(new Map());

  /**
   * Opens / retrieves IndexedDB instance
   */
  private static getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof indexedDB === 'undefined') {
        return reject(new Error('IndexedDB not supported in this environment'));
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'domain' });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  /**
   * Normalizes a website URL or string to a clean domain (e.g. "https://www.github.com/login?u=1" -> "github.com")
   */
  public static normalizeDomain(input?: string): string {
    if (!input || !input.trim()) return '';
    let clean = input.trim();

    if (!/^https?:\/\//i.test(clean)) {
      clean = 'https://' + clean;
    }

    try {
      const url = new URL(clean);
      let hostname = url.hostname.toLowerCase();
      if (hostname.startsWith('www.')) {
        hostname = hostname.substring(4);
      }
      return hostname;
    } catch {
      const match = input.match(/^(?:https?:\/\/)?(?:www\.)?([^/\s:]+)/i);
      return match ? match[1].toLowerCase() : input.trim().toLowerCase();
    }
  }

  /**
   * Initialize cache on app startup: loads all cached icons into the reactive in-memory map.
   */
  public static async init(): Promise<void> {
    if (this.isInitialized) return;

    try {
      const db = await this.getDB();
      const allEntries = await new Promise<CachedWebsiteIcon[]>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });

      this.reactiveIconMap.clear();
      for (const entry of allEntries) {
        if (entry.domain && entry.dataUrl) {
          this.reactiveIconMap.set(entry.domain, entry.dataUrl);
        }
      }
      this.isInitialized = true;
    } catch (e) {
      console.warn('[WebsiteIconCache] Init warning:', e);
    }
  }

  /**
   * Synchronously get a locally cached icon dataUrl if available in memory.
   */
  public static getCachedIcon(domainOrUrl?: string): string | null {
    const domain = this.normalizeDomain(domainOrUrl);
    if (!domain) return null;
    return this.reactiveIconMap.get(domain) || null;
  }

  /**
   * Ensure an icon is available for a single domain.
   * If already cached, returns immediately without network.
   * If uncached and device is online, fetches, hashes, and stores it in cache.
   */
  public static async ensureIcon(domainOrUrl?: string): Promise<string | null> {
    const domain = this.normalizeDomain(domainOrUrl);
    if (!domain) return null;

    // Check reactive memory cache first
    const existing = this.reactiveIconMap.get(domain);
    if (existing) {
      return existing;
    }

    // Check IndexedDB if memory was somehow missing
    const cachedEntry = await this.getIconEntry(domain);
    if (cachedEntry?.dataUrl) {
      this.reactiveIconMap.set(domain, cachedEntry.dataUrl);
      return cachedEntry.dataUrl;
    }

    // Uncached domain: fetch immediately if online
    if (this.isOnline()) {
      await this.refreshDomain(domain);
      return this.reactiveIconMap.get(domain) || null;
    }

    return null;
  }

  /**
   * Fetches/revalidates a single domain's favicon from remote source.
   * Replaces existing icon in-place if changed.
   * Fails silently on error without disturbing UI.
   */
  public static async refreshDomain(domainOrUrl?: string): Promise<boolean> {
    const domain = this.normalizeDomain(domainOrUrl);
    if (!domain || !this.isOnline()) return false;

    try {
      const cachedMeta = await this.getIconEntry(domain);
      const url = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;

      const headers: Record<string, string> = {};
      if (cachedMeta?.etag) {
        headers['If-None-Match'] = cachedMeta.etag;
      }
      if (cachedMeta?.lastModified) {
        headers['If-Modified-Since'] = cachedMeta.lastModified;
      }

      const res = await fetch(url, {
        headers,
        cache: 'no-cache',
      });

      if (res.status === 304) {
        // Not modified - update lastCheckedAt
        if (cachedMeta) {
          cachedMeta.lastCheckedAt = Date.now();
          await this.saveIconEntry(cachedMeta);
        }
        return false;
      }

      if (!res.ok) {
        return false;
      }

      const etag = res.headers.get('ETag') || undefined;
      const lastModified = res.headers.get('Last-Modified') || undefined;

      const blob = await res.blob();
      if (blob.size === 0) return false;

      // Calculate SHA-256 hash to avoid replacing identical binary content
      const buffer = await blob.arrayBuffer();
      let contentHash = '';
      if (typeof crypto !== 'undefined' && crypto.subtle) {
        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        contentHash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      } else {
        contentHash = `size_${blob.size}`;
      }

      if (cachedMeta && cachedMeta.contentHash === contentHash && cachedMeta.dataUrl) {
        // Same content, no replacement needed
        cachedMeta.lastCheckedAt = Date.now();
        if (etag) cachedMeta.etag = etag;
        if (lastModified) cachedMeta.lastModified = lastModified;
        await this.saveIconEntry(cachedMeta);
        return false;
      }

      // Convert Blob to Data URL for persistent offline storage
      const dataUrl = await this.blobToDataUrl(blob);

      const now = Date.now();
      const updatedEntry: CachedWebsiteIcon = {
        domain,
        dataUrl,
        contentHash,
        etag,
        lastModified,
        lastCheckedAt: now,
        updatedAt: now,
      };

      await this.saveIconEntry(updatedEntry);
      this.reactiveIconMap.set(domain, dataUrl);
      return true;
    } catch {
      // Silently keep previous cached icon if any, no network error toast
      return false;
    }
  }

  /**
   * Revalidates all unique domains in the vault if the 24-hour interval has elapsed.
   * Throttled globally via `lastWebsiteIconSyncAt`.
   * Concurrency-locked via `refreshPromise`.
   */
  public static async refreshAllIfDue(domainsInput: (string | undefined)[] | Set<string>, force = false): Promise<void> {
    if (this.refreshPromise) {
      // Refresh already in progress, reuse the existing promise
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        // 1. Check network availability
        if (!this.isOnline()) {
          // IMPORTANT: Do NOT update lastWebsiteIconSyncAt if skipped due to offline
          return;
        }

        // 2. Check 24-hour interval
        if (!force) {
          const lastSyncAt = await StorageService.getLastWebsiteIconSyncAt();
          const elapsed = Date.now() - lastSyncAt;
          if (elapsed < WEBSITE_ICON_REFRESH_INTERVAL_MS) {
            // Not due yet
            return;
          }
        }

        // 3. Extract unique normalized domains
        const uniqueDomains = new Set<string>();
        for (const item of domainsInput) {
          const norm = this.normalizeDomain(item);
          if (norm) uniqueDomains.add(norm);
        }

        if (uniqueDomains.size === 0) {
          await StorageService.setLastWebsiteIconSyncAt(Date.now());
          return;
        }

        // 4. Background refresh each unique domain (concurrency limited to 3)
        const domainList = Array.from(uniqueDomains);
        const concurrency = 3;
        for (let i = 0; i < domainList.length; i += concurrency) {
          const chunk = domainList.slice(i, i + concurrency);
          await Promise.allSettled(chunk.map((domain) => this.refreshDomain(domain)));
        }

        // 5. Update global sync timestamp ONLY after sweep finishes
        await StorageService.setLastWebsiteIconSyncAt(Date.now());
      } catch (e) {
        console.warn('[WebsiteIconCache] Background refresh error:', e);
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  /**
   * Cleanup orphaned cached icons not referenced by any credential.
   * Also enforces MAX_CACHED_ICONS cap.
   */
  public static async cleanupOrphans(referencedDomainsInput: (string | undefined)[] | Set<string>): Promise<void> {
    try {
      const activeDomains = new Set<string>();
      for (const item of referencedDomainsInput) {
        const norm = this.normalizeDomain(item);
        if (norm) activeDomains.add(norm);
      }

      const db = await this.getDB();
      const allEntries = await new Promise<CachedWebsiteIcon[]>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });

      const orphans = allEntries.filter((entry) => !activeDomains.has(entry.domain));
      for (const orphan of orphans) {
        await this.deleteIconEntry(orphan.domain);
        this.reactiveIconMap.delete(orphan.domain);
      }

      // If still exceeding cap, prune oldest entries that are not referenced
      if (allEntries.length - orphans.length > MAX_CACHED_ICONS) {
        const remaining = allEntries
          .filter((entry) => !orphans.some((o) => o.domain === entry.domain))
          .sort((a, b) => a.lastCheckedAt - b.lastCheckedAt);

        const excessCount = remaining.length - MAX_CACHED_ICONS;
        for (let i = 0; i < excessCount; i++) {
          const entry = remaining[i];
          // Only remove if not actively referenced
          if (!activeDomains.has(entry.domain)) {
            await this.deleteIconEntry(entry.domain);
            this.reactiveIconMap.delete(entry.domain);
          }
        }
      }
    } catch (e) {
      console.warn('[WebsiteIconCache] Cleanup error:', e);
    }
  }

  /**
   * Wipes all cached icons from IndexedDB, reactive map, and resets sync timestamp.
   * Called during "Delete All Vaultify Data".
   */
  public static async clearAll(): Promise<void> {
    try {
      this.reactiveIconMap.clear();
      const db = await this.getDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.clear();
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
      await StorageService.setLastWebsiteIconSyncAt(0);
    } catch (e) {
      console.warn('[WebsiteIconCache] Clear all error:', e);
    }
  }

  /**
   * Get single entry from IndexedDB
   */
  private static async getIconEntry(domain: string): Promise<CachedWebsiteIcon | null> {
    try {
      const db = await this.getDB();
      return await new Promise<CachedWebsiteIcon | null>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(domain);
        req.onsuccess = () => resolve((req.result as CachedWebsiteIcon) || null);
        req.onerror = () => reject(req.error);
      });
    } catch {
      return null;
    }
  }

  /**
   * Save single entry to IndexedDB
   */
  private static async saveIconEntry(entry: CachedWebsiteIcon): Promise<void> {
    try {
      const db = await this.getDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(entry);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn('[WebsiteIconCache] Save error:', e);
    }
  }

  /**
   * Delete single entry from IndexedDB
   */
  private static async deleteIconEntry(domain: string): Promise<void> {
    try {
      const db = await this.getDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(domain);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn('[WebsiteIconCache] Delete error:', e);
    }
  }

  /**
   * Checks network connectivity
   */
  public static isOnline(): boolean {
    if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
      return navigator.onLine;
    }
    return true;
  }

  /**
   * Helper: Convert Blob to Base64 Data URL
   */
  private static blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert blob to data URL'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}
