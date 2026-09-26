import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { AppSettings, DEFAULT_SETTINGS } from '@/models/settings.model';
import { StorageService } from '@/services/storage.service';

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<AppSettings>({ ...DEFAULT_SETTINGS });
  const isLoaded = ref(false);

  const isDark = computed(() => {
    const theme = settings.value.theme;
    if (typeof window === 'undefined' || !window.matchMedia) return theme === 'dark';
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return theme === 'dark' || (theme === 'system' && prefersDark);
  });

  /**
   * Load settings from storage and apply theme
   */
  async function loadSettings() {
    const loaded = await StorageService.getSettings();
    settings.value = loaded;
    isLoaded.value = true;
    applyTheme(loaded.theme);
  }

  /**
   * Update one or more settings
   */
  async function updateSettings(partial: Partial<AppSettings>) {
    settings.value = { ...settings.value, ...partial };
    await StorageService.saveSettings(settings.value);

    if (partial.theme !== undefined) {
      applyTheme(partial.theme);
    }
  }

  /**
   * Apply theme to DOM
   */
  function applyTheme(theme: AppSettings['theme']) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const darkActive = theme === 'dark' || (theme === 'system' && prefersDark);

    document.documentElement.classList.toggle('ion-palette-dark', darkActive);
    document.documentElement.classList.toggle('dark', darkActive);
    document.body.classList.toggle('dark-theme', darkActive);
    document.documentElement.setAttribute('data-theme', darkActive ? 'dark' : 'light');
  }

  return {
    settings,
    isLoaded,
    isDark,
    loadSettings,
    updateSettings,
    applyTheme,
  };
});
