<template>
  <ion-app>
    <ion-router-outlet />
    <VaultToast />
  </ion-app>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { useSettingsStore } from '@/stores/settings.store';
import { useAutoLock } from '@/composables/useAutoLock';
import { StatusBarService } from '@/services/statusBar.service';
import VaultToast from '@/components/common/VaultToast.vue';

const route = useRoute();
const settingsStore = useSettingsStore();
const { setupListeners, removeListeners } = useAutoLock();

let mediaQueryListener: ((e: MediaQueryListEvent) => void) | null = null;

onMounted(async () => {
  await settingsStore.loadSettings();
  setupListeners();
  StatusBarService.updateForRoute(route.path, settingsStore.isDark);

  if (typeof window !== 'undefined' && window.matchMedia) {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQueryListener = () => {
      settingsStore.applyTheme(settingsStore.settings.theme);
      StatusBarService.updateForRoute(route.path, settingsStore.isDark);
    };
    mql.addEventListener('change', mediaQueryListener);
  }
});

watch(
  () => [route.path, settingsStore.isDark],
  ([path, isDark]) => {
    StatusBarService.updateForRoute(path as string, isDark as boolean);
  }
);

onUnmounted(() => {
  removeListeners();
  if (mediaQueryListener && typeof window !== 'undefined' && window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', mediaQueryListener);
  }
});
</script>

<style>
/* Global App Container */
ion-app {
  background-color: var(--canvas);
  color: var(--text-primary);
}
</style>
