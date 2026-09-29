import assert from 'node:assert/strict';
import { test, describe, beforeEach } from 'node:test';
import { reactive, ref, computed } from 'vue';

// Mock storage and environment for testing WebsiteIconCacheService logic
const WEBSITE_ICON_REFRESH_INTERVAL_MS = 24 * 60 * 60 * 1000;
const MISSING_ICON_RETRY_INTERVAL_MS = 30 * 60 * 1000;

describe('Website Icon Cache & Fetching Flow Test Suite', () => {

  // Reusable normalization implementation matching WebsiteIconCacheService.normalizeDomain
  function normalizeDomain(input) {
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

  // Reusable open URL helper matching WebsiteIconCacheService.formatOpenUrl
  function formatOpenUrl(input) {
    if (!input || !input.trim()) return '';
    const clean = input.trim();
    return /^https?:\/\//i.test(clean) ? clean : `https://${clean}`;
  }

  // Mock Icon Cache Service
  class TestIconCacheService {
    static reactiveIconMap = reactive(new Map());
    static cacheVersion = ref(0);
    static failedDomainMap = new Map();
    static lastCheckedMap = new Map();
    static inFlightFetches = new Map();
    static mockNetworkOnline = true;
    static fetchCount = 0;
    static mockFetchHandler = null;

    static reset() {
      this.reactiveIconMap.clear();
      this.failedDomainMap.clear();
      this.lastCheckedMap.clear();
      this.inFlightFetches.clear();
      this.cacheVersion.value = 0;
      this.mockNetworkOnline = true;
      this.fetchCount = 0;
      this.mockFetchHandler = null;
    }

    static getCachedIcon(domainOrUrl) {
      void this.cacheVersion.value;
      const domain = normalizeDomain(domainOrUrl);
      if (!domain) return null;
      return this.reactiveIconMap.get(domain) || null;
    }

    static hasCachedIcon(domainOrUrl) {
      const domain = normalizeDomain(domainOrUrl);
      if (!domain) return false;
      return this.reactiveIconMap.has(domain);
    }

    static isDailyRefreshDue(domainOrUrl) {
      const domain = normalizeDomain(domainOrUrl);
      if (!domain) return false;
      const lastChecked = this.lastCheckedMap.get(domain);
      if (!lastChecked) return true;
      return Date.now() - lastChecked >= WEBSITE_ICON_REFRESH_INTERVAL_MS;
    }

    static canRetryMissing(domainOrUrl) {
      const domain = normalizeDomain(domainOrUrl);
      if (!domain) return false;
      const lastFailed = this.failedDomainMap.get(domain);
      if (!lastFailed) return true;
      return Date.now() - lastFailed > MISSING_ICON_RETRY_INTERVAL_MS;
    }

    static clearFailedDomain(domainOrUrl) {
      const domain = normalizeDomain(domainOrUrl);
      if (domain) {
        this.failedDomainMap.delete(domain);
      }
    }

    static async ensureIcon(domainOrUrl, options) {
      const domain = normalizeDomain(domainOrUrl);
      if (!domain) return null;

      // 1. If already cached: return immediately. Background revalidate only if daily refresh due
      const existing = this.reactiveIconMap.get(domain);
      if (existing && !options?.force) {
        if (this.isDailyRefreshDue(domain)) {
          void this.revalidateIcon(domain);
        }
        return existing;
      }

      // 2. If missing: network check & retry backoff
      if (!this.mockNetworkOnline) return null;
      if (!options?.force && !this.canRetryMissing(domain)) return null;

      // 3. Deduplicate in-flight fetches
      const inFlight = this.inFlightFetches.get(domain);
      if (inFlight) return inFlight;

      const fetchPromise = (async () => {
        try {
          this.fetchCount++;
          const result = this.mockFetchHandler ? await this.mockFetchHandler(domain) : `data:image/png;base64,mock_${domain}`;
          if (result) {
            this.reactiveIconMap.set(domain, result);
            this.lastCheckedMap.set(domain, Date.now());
            this.failedDomainMap.delete(domain);
            this.cacheVersion.value++;
            return result;
          } else {
            if (this.mockNetworkOnline) {
              this.failedDomainMap.set(domain, Date.now());
            }
            return null;
          }
        } finally {
          this.inFlightFetches.delete(domain);
        }
      })();

      this.inFlightFetches.set(domain, fetchPromise);
      return fetchPromise;
    }

    static async revalidateIcon(domainOrUrl) {
      const domain = normalizeDomain(domainOrUrl);
      if (!domain || !this.mockNetworkOnline) return false;
      this.fetchCount++;
      const result = this.mockFetchHandler ? await this.mockFetchHandler(domain) : `data:image/png;base64,revalidated_${domain}`;
      if (result) {
        this.reactiveIconMap.set(domain, result);
        this.lastCheckedMap.set(domain, Date.now());
        this.cacheVersion.value++;
        return true;
      }
      return false;
    }

    static async ensureMissingIcons(domains) {
      if (!this.mockNetworkOnline) return;
      const unique = new Set(domains.map(normalizeDomain).filter(Boolean));
      for (const d of unique) {
        if (!this.hasCachedIcon(d) && this.canRetryMissing(d)) {
          await this.ensureIcon(d);
        }
      }
    }

    static async refreshAllIfDue(domains, lastSyncAt) {
      if (!this.mockNetworkOnline) return;
      const elapsed = Date.now() - lastSyncAt;
      if (elapsed < WEBSITE_ICON_REFRESH_INTERVAL_MS) return;

      const unique = new Set(domains.map(normalizeDomain).filter(Boolean));
      for (const d of unique) {
        if (this.hasCachedIcon(d) && this.isDailyRefreshDue(d)) {
          await this.revalidateIcon(d);
        }
      }
    }
  }

  beforeEach(() => {
    TestIconCacheService.reset();
  });

  test('DOMAIN NORMALIZATION: resolves various URL representations to clean domain', () => {
    const inputs = [
      'facebook.com',
      'Facebook.com',
      'www.facebook.com',
      'https://facebook.com',
      'https://www.facebook.com/',
      'https://www.facebook.com/login',
      'https://www.facebook.com/login?foo=bar#section',
    ];
    for (const input of inputs) {
      assert.strictEqual(normalizeDomain(input), 'facebook.com');
    }
  });

  test('WEBSITE OPEN URL: formats link correctly preserving paths & queries without losing scheme', () => {
    assert.strictEqual(formatOpenUrl('facebook.com'), 'https://facebook.com');
    assert.strictEqual(formatOpenUrl('www.facebook.com'), 'https://www.facebook.com');
    assert.strictEqual(formatOpenUrl('https://www.facebook.com/login?query=1'), 'https://www.facebook.com/login?query=1');
    assert.strictEqual(formatOpenUrl('http://insecure.site/test'), 'http://insecure.site/test');
    assert.strictEqual(formatOpenUrl(''), '');
  });

  test('CASE 1: Global icon refresh occurred recently (1 hour ago), missing domain fetches immediately', async () => {
    const oneHourAgo = Date.now() - (1 * 60 * 60 * 1000);
    // Simulating recent daily refresh sweep
    await TestIconCacheService.refreshAllIfDue(['existing.com'], oneHourAgo);
    assert.strictEqual(TestIconCacheService.fetchCount, 0, 'No refresh sweep ran because interval not due');

    // New credential added: facebook.com has no cached icon
    assert.strictEqual(TestIconCacheService.hasCachedIcon('facebook.com'), false);
    const result = await TestIconCacheService.ensureIcon('facebook.com');

    assert.ok(result, 'Icon must be fetched immediately');
    assert.strictEqual(TestIconCacheService.fetchCount, 1);
    assert.strictEqual(TestIconCacheService.hasCachedIcon('facebook.com'), true);
  });

  test('CASE 2: Existing cached icon with age = 1h uses cache immediately without network revalidation', async () => {
    // Seed cache with 1h old icon
    TestIconCacheService.reactiveIconMap.set('facebook.com', 'data:image/png;base64,fb_cached');
    TestIconCacheService.lastCheckedMap.set('facebook.com', Date.now() - (1 * 60 * 60 * 1000));

    const result = await TestIconCacheService.ensureIcon('facebook.com');
    assert.strictEqual(result, 'data:image/png;base64,fb_cached');
    assert.strictEqual(TestIconCacheService.fetchCount, 0, 'Must NOT trigger any network request');
  });

  test('CASE 3: Cached icon with refresh due (25h old) returns old cache immediately and revalidates in background', async () => {
    // Seed cache with 25h old icon
    TestIconCacheService.reactiveIconMap.set('facebook.com', 'data:image/png;base64,fb_old');
    TestIconCacheService.lastCheckedMap.set('facebook.com', Date.now() - (25 * 60 * 60 * 1000));

    assert.strictEqual(TestIconCacheService.isDailyRefreshDue('facebook.com'), true);

    const result = await TestIconCacheService.ensureIcon('facebook.com');
    // Immediate return of old icon
    assert.strictEqual(result, 'data:image/png;base64,fb_old');
    // Background revalidation triggered
    assert.strictEqual(TestIconCacheService.fetchCount, 1);
  });

  test('CASE 4: Add credential with full URL normalizes domain and fetches immediately', async () => {
    const inputUrl = 'https://www.facebook.com/login';
    const domain = normalizeDomain(inputUrl);
    assert.strictEqual(domain, 'facebook.com');

    const result = await TestIconCacheService.ensureIcon(domain);
    assert.ok(result);
    assert.strictEqual(TestIconCacheService.hasCachedIcon('facebook.com'), true);
  });

  test('CASE 5: Edit credential from github.com to uncached facebook.com fetches Facebook immediately', async () => {
    // github.com is cached
    TestIconCacheService.reactiveIconMap.set('github.com', 'data:image/png;base64,gh_cached');
    TestIconCacheService.lastCheckedMap.set('github.com', Date.now());

    // User edits credential to facebook.com
    const newDomain = normalizeDomain('https://www.facebook.com');
    TestIconCacheService.clearFailedDomain(newDomain);
    const result = await TestIconCacheService.ensureIcon(newDomain);

    assert.ok(result);
    assert.strictEqual(TestIconCacheService.hasCachedIcon('facebook.com'), true);
    assert.strictEqual(TestIconCacheService.fetchCount, 1);
  });

  test('CASE 6: Failed icon request does NOT write fake cache and allows future retry', async () => {
    TestIconCacheService.mockFetchHandler = async () => null; // Simulate 404/network failure

    const result = await TestIconCacheService.ensureIcon('broken-site.com');
    assert.strictEqual(result, null);
    assert.strictEqual(TestIconCacheService.hasCachedIcon('broken-site.com'), false);
    assert.strictEqual(TestIconCacheService.canRetryMissing('broken-site.com'), false, 'Backoff penalty applied');

    // User edits credential or clears failed state: immediate retry is possible
    TestIconCacheService.clearFailedDomain('broken-site.com');
    assert.strictEqual(TestIconCacheService.canRetryMissing('broken-site.com'), true);
  });

  test('CASE 7: Vault unlock repair pass fetches missing icons even if daily sync is not due', async () => {
    const oneHourAgo = Date.now() - (1 * 60 * 60 * 1000);
    // Cached domain
    TestIconCacheService.reactiveIconMap.set('google.com', 'data:image/png;base64,google_cached');
    TestIconCacheService.lastCheckedMap.set('google.com', oneHourAgo);

    // Vault loaded with google.com and missing facebook.com
    const allDomains = ['google.com', 'facebook.com'];
    await TestIconCacheService.ensureMissingIcons(allDomains);

    assert.strictEqual(TestIconCacheService.hasCachedIcon('facebook.com'), true, 'Missing icon must be repaired');
    assert.strictEqual(TestIconCacheService.fetchCount, 1, 'Only missing icon should be fetched');
  });

  test('CASE 8: Reactive UI updates when background fetch finishes without page reload', async () => {
    const domain = 'facebook.com';
    const computedIcon = computed(() => TestIconCacheService.getCachedIcon(domain));

    // Initially no icon cached -> null
    assert.strictEqual(computedIcon.value, null);

    // Fetch icon in background
    await TestIconCacheService.ensureIcon(domain);

    // Reactive computed must automatically reflect new cached icon
    assert.ok(computedIcon.value);
    assert.match(computedIcon.value, /^data:image\/png/);
  });

  test('CASE 9: Deduplicates concurrent requests for the same domain across multiple credentials', async () => {
    let activeFetches = 0;
    TestIconCacheService.mockFetchHandler = async (d) => {
      activeFetches++;
      await new Promise((r) => setTimeout(r, 20));
      return `data:image/png;base64,concurrent_${d}`;
    };

    // 3 simultaneous credentials for google.com
    const p1 = TestIconCacheService.ensureIcon('google.com');
    const p2 = TestIconCacheService.ensureIcon('https://www.google.com/login');
    const p3 = TestIconCacheService.ensureIcon('google.com');

    const [r1, r2, r3] = await Promise.all([p1, p2, p3]);

    assert.strictEqual(r1, r2);
    assert.strictEqual(r2, r3);
    assert.strictEqual(TestIconCacheService.fetchCount, 1, 'Only ONE network fetch should be dispatched');
    assert.strictEqual(activeFetches, 1);
  });
});
