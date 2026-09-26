import { reactive, ref } from 'vue';
import { StorageService } from './storage.service';

export const WEBSITE_ICON_REFRESH_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours for existing cached icons
export const MISSING_ICON_RETRY_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes retry for failed/missing icons

export interface CachedWebsiteIcon {
  domain: string;
  dataUrl: string;
  mimeType?: string;
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
const MAX_CONCURRENT_FETCHES = 3;

export class WebsiteIconCacheService {
  private static dbPromise: Promise<IDBDatabase> | null = null;
  private static refreshPromise: Promise<void> | null = null;
  private static isInitialized = false;

  // Reactive in-memory map of domain -> dataUrl for synchronous, flicker-free Vue rendering
  public static reactiveIconMap = reactive<Map<string, string>>(new Map());

  // Reactive version counter bumped whenever an icon is added, updated, or cleared
  public static cacheVersion = ref(0);

  // In-memory tracker of recently failed domain fetches: domain -> timestamp of failure
  private static failedDomainMap = new Map<string, number>();

  // In-flight fetch promises to deduplicate simultaneous requests for the same domain
  private static inFlightFetches = new Map<string, Promise<string | null>>();

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
      this.cacheVersion.value++;
    } catch (e) {
      console.warn('[WebsiteIconCache] Init warning:', e);
    }
  }

  /**
   * Synchronously get a locally cached icon dataUrl if available in memory.
   */
  public static getCachedIcon(domainOrUrl?: string): string | null {
    // Access cacheVersion to ensure reactive tracking in computed properties
    void this.cacheVersion.value;
    const domain = this.normalizeDomain(domainOrUrl);
    if (!domain) return null;
    return this.reactiveIconMap.get(domain) || null;
  }

  /**
   * Returns true if an icon is currently cached locally for the domain.
   */
  public static hasCachedIcon(domainOrUrl?: string): boolean {
    const domain = this.normalizeDomain(domainOrUrl);
    if (!domain) return false;
    return this.reactiveIconMap.has(domain);
  }

  /**
   * Checks if a missing/failed domain is eligible to be fetched (respects retry backoff).
   */
  public static canRetryMissing(domainOrUrl?: string): boolean {
    const domain = this.normalizeDomain(domainOrUrl);
    if (!domain) return false;
    const lastFailed = this.failedDomainMap.get(domain);
    if (!lastFailed) return true;
    return Date.now() - lastFailed > MISSING_ICON_RETRY_INTERVAL_MS;
  }

  /**
   * Clears failure state for a domain so subsequent fetch attempts run immediately.
   * Useful when the user explicitly adds or edits a credential.
   */
  public static clearFailedDomain(domainOrUrl?: string): void {
    const domain = this.normalizeDomain(domainOrUrl);
    if (domain) {
      this.failedDomainMap.delete(domain);
    }
  }

  /**
   * OPERATION A: ENSURE ICON EXISTS
   * Fetches immediately ONLY if icon is missing from local cache.
   * If already cached, returns immediately without network request.
   * Does NOT wait for or touch the 24-hour global sync timer.
   */
  public static async ensureIcon(domainOrUrl?: string, options?: { force?: boolean }): Promise<string | null> {
    const domain = this.normalizeDomain(domainOrUrl);
    if (!domain) return null;

    // 1. Check reactive memory cache first (instant)
    const existing = this.reactiveIconMap.get(domain);
    if (existing && !options?.force) {
      return existing;
    }

    // 2. Check IndexedDB if memory was not loaded yet
    if (!options?.force) {
      const cachedEntry = await this.getIconEntry(domain);
      if (cachedEntry?.dataUrl) {
        this.reactiveIconMap.set(domain, cachedEntry.dataUrl);
        this.cacheVersion.value++;
        return cachedEntry.dataUrl;
      }
    }

    // 3. If missing: check network & retry backoff
    if (!this.isOnline()) {
      return null;
    }

    if (!options?.force && !this.canRetryMissing(domain)) {
      return null;
    }

    // 4. Deduplicate concurrent in-flight fetches for the same domain
    const inFlight = this.inFlightFetches.get(domain);
    if (inFlight) {
      return inFlight;
    }

    const fetchPromise = (async () => {
      try {
        const success = await this.fetchAndStoreIcon(domain);
        if (success) {
          this.failedDomainMap.delete(domain);
          return this.reactiveIconMap.get(domain) || null;
        } else {
          this.failedDomainMap.set(domain, Date.now());
          return null;
        }
      } finally {
        this.inFlightFetches.delete(domain);
      }
    })();

    this.inFlightFetches.set(domain, fetchPromise);
    return fetchPromise;
  }

  /**
   * STARTUP / UNLOCK PASS: REPAIR MISSING ICONS
   * Inspects all active vault domains.
   * If an icon is missing locally and the domain is eligible for retry,
   * immediately attempts fetch in background.
   * NEVER blocked by lastWebsiteIconSyncAt.
   */
  public static async ensureMissingIcons(domainsInput: (string | undefined)[] | Set<string>): Promise<void> {
    if (!this.isOnline()) return;

    // Extract unique normalized domains
    const uniqueDomains = new Set<string>();
    for (const item of domainsInput) {
      const norm = this.normalizeDomain(item);
      if (norm) uniqueDomains.add(norm);
    }

    // Filter to only missing domains that are eligible for retry
    const missingDomains: string[] = [];
    for (const domain of uniqueDomains) {
      if (!this.hasCachedIcon(domain) && this.canRetryMissing(domain)) {
        missingDomains.push(domain);
      }
    }

    if (missingDomains.length === 0) return;

    // Fetch with concurrency limiter (3 at a time)
    await this.runWithConcurrency(missingDomains, MAX_CONCURRENT_FETCHES, async (domain) => {
      await this.ensureIcon(domain);
    });
  }

  /**
   * OPERATION B: REVALIDATE EXISTING ICON
   * Checks if an existing cached icon has changed remotely (conditional request).
   * Replaces local icon in-place if changed.
   */
  public static async revalidateIcon(domainOrUrl?: string): Promise<boolean> {
    const domain = this.normalizeDomain(domainOrUrl);
    if (!domain || !this.isOnline()) return false;

    try {
      const cachedMeta = await this.getIconEntry(domain);
      return await this.fetchAndStoreIcon(domain, cachedMeta || undefined);
    } catch {
      return false;
    }
  }

  /**
   * DAILY SYNC: REVALIDATE ALREADY-CACHED ICONS ONCE EVERY 24 HOURS
   * Throttled globally via `lastWebsiteIconSyncAt`.
   * Only operates on EXISTING cached domains.
   */
  public static async refreshAllIfDue(domainsInput: (string | undefined)[] | Set<string>, force = false): Promise<void> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        if (!this.isOnline()) return;

        // Check 24-hour interval
        if (!force) {
          const lastSyncAt = await StorageService.getLastWebsiteIconSyncAt();
          const elapsed = Date.now() - lastSyncAt;
          if (elapsed < WEBSITE_ICON_REFRESH_INTERVAL_MS) {
            // Not due yet for existing cached icons
            return;
          }
        }

        // Collect unique domains that ALREADY have a cached icon
        const existingCachedDomains: string[] = [];
        for (const item of domainsInput) {
          const norm = this.normalizeDomain(item);
          if (norm && this.hasCachedIcon(norm)) {
            existingCachedDomains.push(norm);
          }
        }

        if (existingCachedDomains.length === 0) {
          await StorageService.setLastWebsiteIconSyncAt(Date.now());
          return;
        }

        // Background revalidation with concurrency limiter
        await this.runWithConcurrency(existingCachedDomains, MAX_CONCURRENT_FETCHES, async (domain) => {
          await this.revalidateIcon(domain);
        });

        // Update global sync timestamp after sweep completes
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
   * Core fetch helper: discovers, downloads, validates, and stores favicon for a domain.
   * Validates response to ensure only genuine image data is cached.
   */
  private static async fetchAndStoreIcon(domain: string, cachedMeta?: CachedWebsiteIcon): Promise<boolean> {
    // Discovery URLs in order of preference
    const candidateUrls = [
      `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`,
      `https://${domain}/favicon.ico`,
      `https://${domain}/favicon.png`,
    ];

    for (const url of candidateUrls) {
      try {
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

        if (res.status === 304 && cachedMeta) {
          // Not modified - update lastCheckedAt
          cachedMeta.lastCheckedAt = Date.now();
          await this.saveIconEntry(cachedMeta);
          return true;
        }

        if (!res.ok) {
          continue; // Try next candidate
        }

        const contentType = (res.headers.get('content-type') || '').toLowerCase();
        // Reject HTML error pages or non-image types if header is explicitly html/text
        if (contentType.includes('text/html') || contentType.includes('application/json')) {
          continue;
        }

        const blob = await res.blob();
        if (blob.size === 0) {
          continue;
        }

        // Validate buffer is not HTML text masquerading as image
        const buffer = await blob.arrayBuffer();
        if (!this.isValidImageBuffer(buffer, blob.type)) {
          continue;
        }

        // Compute SHA-256 hash
        let contentHash = '';
        if (typeof crypto !== 'undefined' && crypto.subtle) {
          const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          contentHash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
        } else {
          contentHash = `size_${blob.size}`;
        }

        const etag = res.headers.get('ETag') || undefined;
        const lastModified = res.headers.get('Last-Modified') || undefined;

        // If content is identical to existing cache, retain without re-encoding
        if (cachedMeta && cachedMeta.contentHash === contentHash && cachedMeta.dataUrl) {
          cachedMeta.lastCheckedAt = Date.now();
          if (etag) cachedMeta.etag = etag;
          if (lastModified) cachedMeta.lastModified = lastModified;
          await this.saveIconEntry(cachedMeta);
          return true;
        }

        // Convert valid image Blob to Data URL
        const dataUrl = await this.blobToDataUrl(blob);
        if (!dataUrl || !dataUrl.startsWith('data:image/')) {
          continue;
        }

        const now = Date.now();
        const updatedEntry: CachedWebsiteIcon = {
          domain,
          dataUrl,
          mimeType: blob.type || undefined,
          contentHash,
          etag,
          lastModified,
          lastCheckedAt: now,
          updatedAt: now,
        };

        await this.saveIconEntry(updatedEntry);
        this.reactiveIconMap.set(domain, dataUrl);
        this.cacheVersion.value++;
        return true;
      } catch {
        // Continue to next candidate URL
      }
    }

    return false;
  }

  /**
   * Helper: Validates binary buffer does not start with HTML or text tags.
   */
  private static isValidImageBuffer(buffer: ArrayBuffer, mimeType: string): boolean {
    if (buffer.byteLength < 4) return false;

    const uint8 = new Uint8Array(buffer.slice(0, 32));
    const headerStr = String.fromCharCode(...Array.from(uint8.slice(0, 16))).toLowerCase();

    // Reject HTML/XML signatures
    if (
      headerStr.startsWith('<!doctype') ||
      headerStr.startsWith('<html') ||
      headerStr.startsWith('<?xml') ||
      headerStr.startsWith('{"') ||
      headerStr.startsWith('error')
    ) {
      // SVG images may start with <?xml or <svg, allow if explicitly image/svg
      if (mimeType.includes('svg') || headerStr.includes('<svg')) {
        return true;
      }
      return false;
    }

    // Check common image magic bytes
    // PNG: 89 50 4E 47
    if (uint8[0] === 0x89 && uint8[1] === 0x50 && uint8[2] === 0x4e && uint8[3] === 0x47) return true;
    // JPEG: FF D8 FF
    if (uint8[0] === 0xff && uint8[1] === 0xd8 && uint8[2] === 0xff) return true;
    // GIF: GIF8
    if (uint8[0] === 0x47 && uint8[1] === 0x49 && uint8[2] === 0x46 && uint8[3] === 0x38) return true;
    // WebP: RIFF ... WEBP
    if (uint8[0] === 0x52 && uint8[1] === 0x49 && uint8[2] === 0x46 && uint8[3] === 0x46) return true;
    // ICO: 00 00 01 00 or 00 00 02 00
    if (uint8[0] === 0x00 && uint8[1] === 0x00 && (uint8[2] === 0x01 || uint8[2] === 0x02) && uint8[3] === 0x00) return true;

    // Fallback: accept if mimeType is an image type
    return mimeType.startsWith('image/');
  }

  /**
   * Concurrency Limiter helper
   */
  private static async runWithConcurrency<T>(
    items: T[],
    concurrency: number,
    fn: (item: T) => Promise<void>
  ): Promise<void> {
    const queue = [...items];
    const workers = Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
      while (queue.length > 0) {
        const item = queue.shift();
        if (item !== undefined) {
          try {
            await fn(item);
          } catch {
            // Silently handle error per item
          }
        }
      }
    });
    await Promise.all(workers);
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
          if (!activeDomains.has(entry.domain)) {
            await this.deleteIconEntry(entry.domain);
            this.reactiveIconMap.delete(entry.domain);
          }
        }
      }

      this.cacheVersion.value++;
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
      this.failedDomainMap.clear();
      this.inFlightFetches.clear();
      this.cacheVersion.value++;

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

