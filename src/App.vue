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

onMounted(async () => {
  await settingsStore.loadSettings();
  setupListeners();
  StatusBarService.updateForRoute(route.path, settingsStore.isDark);
});

watch(
  () => settingsStore.isDark,
  (isDark) => {
    StatusBarService.updateForRoute(route.path, isDark);
  }
);

onUnmounted(() => {
  removeListeners();
});
</script>

<style>
/* Global App Container */
ion-app {
  background-color: var(--canvas);
  color: var(--text-primary);
}
</style>
