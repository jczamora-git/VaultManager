import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

export const StatusBarService = {
  /**
   * Sets the status bar for Vaultify brand red hero surfaces (#C62825)
   * with light (white) status icons.
   */
  async setBrand(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;
    try {
      await StatusBar.setStyle({ style: Style.Dark }); // Light/white status bar icons
      if (Capacitor.getPlatform() === 'android') {
        await StatusBar.setBackgroundColor({ color: '#C62825' });
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
    if (!Capacitor.isNativePlatform()) return;
    try {
      await StatusBar.setStyle({ style: Style.Light }); // Dark status bar icons
      if (Capacitor.getPlatform() === 'android') {
        await StatusBar.setBackgroundColor({ color: '#FFFFFF' });
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
    if (!Capacitor.isNativePlatform()) return;
    try {
      await StatusBar.setStyle({ style: Style.Dark }); // Light status bar icons
      if (Capacitor.getPlatform() === 'android') {
        await StatusBar.setBackgroundColor({ color: '#0D0D0D' });
      }
    } catch (e) {
      console.warn('StatusBarService.setDark error:', e);
    }
  },

  /**
   * Automatically updates status bar based on current route and theme mode.
   */
  async updateForRoute(path: string, isDark: boolean): Promise<void> {
    // In dark mode, all screens use dark status bar
    if (isDark) {
      await this.setDark();
      return;
    }

    // In light mode: all screens with red hero header use brand red status bar
    await this.setBrand();
  },
};
