<template>
  <ion-app>
    <ion-router-outlet />
    <VaultToast />
  </ion-app>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { useSettingsStore } from '@/stores/settings.store';
import { useAutoLock } from '@/composables/useAutoLock';
import VaultToast from '@/components/common/VaultToast.vue';

const settingsStore = useSettingsStore();
const { setupListeners, removeListeners } = useAutoLock();

onMounted(async () => {
  await settingsStore.loadSettings();
  setupListeners();
});

onUnmounted(() => {
  removeListeners();
});
</script>

<style>
/* Global App Container */
ion-app {
  background-color: var(--vk-bg-page);
  color: var(--vk-text-primary);
}
</style>
