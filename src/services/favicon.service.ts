export class FaviconService {
  private static failedDomains = new Set<string>();

  /**
   * Extracts clean domain name from URL or raw text
   * e.g. "https://github.com/settings" -> "github.com"
   * "app.sub.example.co.uk/test" -> "app.sub.example.co.uk"
   */
  static extractDomain(input?: string): string {
    if (!input || !input.trim()) return '';
    let clean = input.trim();

    // If input doesn't have protocol, prepend https:// for URL parser
    if (!/^https?:\/\//i.test(clean)) {
      clean = 'https://' + clean;
    }

    try {
      const url = new URL(clean);
      let hostname = url.hostname.toLowerCase();
      // Remove www. prefix if present
      if (hostname.startsWith('www.')) {
        hostname = hostname.substring(4);
      }
      return hostname;
    } catch {
      // Fallback regex extraction
      const match = input.match(/^(?:https?:\/\/)?(?:www\.)?([^/\s:]+)/i);
      return match ? match[1].toLowerCase() : input.trim().toLowerCase();
    }
  }

  /**
   * Get primary favicon URL for a given domain/website
   */
  static getFaviconUrl(domainOrUrl?: string): string {
    const domain = this.extractDomain(domainOrUrl);
    if (!domain || this.failedDomains.has(domain)) {
      return '';
    }

    // High resolution Google favicon service
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;
  }

  /**
   * Mark domain as failed so fallback UI is rendered immediately without repeated 404s
   */
  static markDomainFailed(domainOrUrl?: string): void {
    const domain = this.extractDomain(domainOrUrl);
    if (domain) {
      this.failedDomains.add(domain);
    }
  }

  /**
   * Generates a deterministic, vibrant background color and text color from string
   */
  static getDeterministicAvatarStyle(seed: string): { background: string; color: string } {
    if (!seed) {
      return { background: 'linear-gradient(135deg, #475569, #334155)', color: '#f8fafc' };
    }

    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
      hash = hash & hash; // Convert to 32bit integer
    }

    // Predefined harmonious gradients
    const gradients = [
      ['#3b82f6', '#1d4ed8'], // Blue
      ['#8b5cf6', '#6d28d9'], // Violet
      ['#ec4899', '#be185d'], // Pink
      ['#10b981', '#047857'], // Emerald
      ['#f59e0b', '#b45309'], // Amber
      ['#06b6d4', '#0e7490'], // Cyan
      ['#6366f1', '#4338ca'], // Indigo
      ['#f43f5e', '#be123c'], // Rose
      ['#14b8a6', '#0f766e'], // Teal
      ['#84cc16', '#4d7c0f'], // Lime
    ];

    const index = Math.abs(hash) % gradients.length;
    const [c1, c2] = gradients[index];

    return {
      background: `linear-gradient(135deg, ${c1}, ${c2})`,
      color: '#ffffff',
    };
  }

  /**
   * Extracts initial letter for fallback icon
   */
  static getFallbackLetter(title?: string, domain?: string): string {
    const source = (title || domain || '?').trim();
    return source.charAt(0).toUpperCase() || '?';
  }
}
