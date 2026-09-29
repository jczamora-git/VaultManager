import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { AccentColor, isValidAccent } from '@/models/settings.model';

export const SYSTEM_COLORS = {
  brandRed: '#D02724',
  brandBlue: '#2563EB',
  brandPurple: '#6B46C1',
  brandGreen: '#16865C',
  brandYellow: '#F4C430',
  brandOrange: '#EA6A1B',
  brandPink: '#DB3E7C',
  darkSurface: '#151515',
  lightSurface: '#FFFFFF',
} as const;

export const ACCENT_STATUS_COLORS: Record<AccentColor, string> = {
  red: SYSTEM_COLORS.brandRed,
  blue: SYSTEM_COLORS.brandBlue,
  purple: SYSTEM_COLORS.brandPurple,
  green: SYSTEM_COLORS.brandGreen,
  yellow: SYSTEM_COLORS.brandYellow,
  orange: SYSTEM_COLORS.brandOrange,
  pink: SYSTEM_COLORS.brandPink,
};

export const ACCENT_STATUS_STYLES: Record<AccentColor, Style> = {
  red: Style.Dark,      // Light/white status icons
  blue: Style.Dark,     // Light/white status icons
  purple: Style.Dark,   // Light/white status icons
  green: Style.Dark,    // Light/white status icons
  yellow: Style.Light,  // Dark status icons on yellow for readable contrast
  orange: Style.Dark,   // Light/white status icons
  pink: Style.Dark,     // Light/white status icons
};

export const StatusBarService = {
  /**
   * Retrieves active brand accent enum from document root
   */
  getActiveAccent(): AccentColor {
    if (typeof document !== 'undefined') {
      const raw = document.documentElement.dataset.vkAccent;
      if (isValidAccent(raw)) return raw;
    }
    return 'red';
  },

  /**
   * Retrieves active brand accent color from document root
   */
  getActiveAccentColor(): string {
    const accent = this.getActiveAccent();
    return ACCENT_STATUS_COLORS[accent] || SYSTEM_COLORS.brandRed;
  },

  /**
   * Retrieves active brand status style (dark icons for bright yellow, white for others)
   */
  getActiveAccentStatusStyle(): Style {
    const accent = this.getActiveAccent();
    return ACCENT_STATUS_STYLES[accent] || Style.Dark;
  },

  /**
   * Sets the status bar for Vaultify brand hero surfaces
   * with contrast-aware status icons, matching the active accent color.
   */
  async setBrand(): Promise<void> {
    const brandColor = this.getActiveAccentColor();
    const style = this.getActiveAccentStatusStyle();
    this.updatePwaThemeColor(brandColor);
    if (!Capacitor.isNativePlatform()) return;
    try {
      await StatusBar.setStyle({ style });
      if (Capacitor.getPlatform() === 'android') {
        await StatusBar.setBackgroundColor({ color: brandColor });
      }
    } catch (e) {
      console.warn('StatusBarService.setBrand error:', e);
    }
  },

  /**
   * Sets the status bar for white/light page surfaces (#FFFFFF)
   * with dark status icons.
   */
  async setLight(): Promise<void> {
    this.updatePwaThemeColor(SYSTEM_COLORS.lightSurface);
    if (!Capacitor.isNativePlatform()) return;
    try {
      await StatusBar.setStyle({ style: Style.Light }); // Dark status icons
      if (Capacitor.getPlatform() === 'android') {
        await StatusBar.setBackgroundColor({ color: SYSTEM_COLORS.lightSurface });
      }
    } catch (e) {
      console.warn('StatusBarService.setLight error:', e);
    }
  },

  /**
   * Sets the status bar for dark mode surfaces (#0D0D0D)
   * with light (white) status icons.
   */
  async setDark(): Promise<void> {
    this.updatePwaThemeColor(SYSTEM_COLORS.darkSurface);
    if (!Capacitor.isNativePlatform()) return;
    try {
      await StatusBar.setStyle({ style: Style.Dark }); // Light status icons
      if (Capacitor.getPlatform() === 'android') {
        await StatusBar.setBackgroundColor({ color: SYSTEM_COLORS.darkSurface });
      }
    } catch (e) {
      console.warn('StatusBarService.setDark error:', e);
    }
  },

  /**
   * Update PWA meta theme-color tag dynamically
   */
  updatePwaThemeColor(color: string): void {
    if (typeof document === 'undefined') return;
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', color);
  },

  /**
   * Automatically updates status bar and dynamic web/PWA theme-color based on current route and theme mode.
   * Vaultify design standard: Top status bar and hero header are ALWAYS Vaultify Brand Red (#D02724)
   * with light (white) status icons across all themes (Light, Dark, System).
   */
  async updateForRoute(_path?: string, _isDark?: boolean): Promise<void> {
    await this.setBrand();
  },
};
