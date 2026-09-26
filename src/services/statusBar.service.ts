import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

export const SYSTEM_COLORS = {
  brandRed: '#D02724',
  darkSurface: '#151515',
  lightSurface: '#FFFFFF',
} as const;

export const StatusBarService = {
  /**
   * Sets the status bar for Vaultify brand red hero surfaces (#D02724)
   * with light (white) status icons.
   */
  async setBrand(): Promise<void> {
    this.updatePwaThemeColor(SYSTEM_COLORS.brandRed);
    if (!Capacitor.isNativePlatform()) return;
    try {
      await StatusBar.setStyle({ style: Style.Dark }); // Light/white status icons
      if (Capacitor.getPlatform() === 'android') {
        await StatusBar.setBackgroundColor({ color: SYSTEM_COLORS.brandRed });
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
