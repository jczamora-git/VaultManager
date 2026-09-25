<template>
  <nav class="vk-floating-dock-wrap" aria-label="Main Navigation">
    <FloatingDockItem
      icon="vault"
      active-label="VAU"
      :active="activeTab === 'vault'"
      route="/tabs/vault"
      aria-label="Vault"
      @navigate="navigate"
    />

    <FloatingDockItem
      icon="generator"
      active-label="GEN"
      :active="activeTab === 'generator'"
      route="/tabs/generator"
      aria-label="Password Generator"
      @navigate="navigate"
    />

    <FloatingDockItem
      icon="cipher"
      active-label="CIPH"
      :active="activeTab === 'cipher'"
      route="/tabs/cipher"
      aria-label="Cipher"
      @navigate="navigate"
    />

    <FloatingDockItem
      icon="settings"
      active-label="SET"
      :active="activeTab === 'settings'"
      route="/tabs/settings"
      aria-label="Settings"
      @navigate="navigate"
    />
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import FloatingDockItem from './FloatingDockItem.vue';

const route = useRoute();
const router = useRouter();

const activeTab = computed(() => {
  const path = route.path;
  if (path.includes('/generator')) return 'generator';
  if (path.includes('/cipher')) return 'cipher';
  if (path.includes('/settings')) return 'settings';
  return 'vault';
});

function navigate(path: string) {
  if (route.path !== path) {
    router.push(path);
  }
}
</script>

<style scoped>
.vk-floating-dock-wrap {
  position: fixed;
  bottom: calc(12px + env(safe-area-inset-bottom, 0px));
  left: 16px;
  right: 16px;
  width: calc(100% - 32px);
  max-width: 440px;
  margin: 0 auto;
  height: var(--vk-dock-height, 64px);
  background: var(--vk-dock-bg);
  border: 1px solid var(--vk-dock-border);
  border-radius: 24px;
  box-shadow: var(--vk-dock-shadow);
  display: flex;
  align-items: center;
  justify-content: space-around;
  z-index: 9999;
  padding: 4px 6px;
  user-select: none;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  animation: vkDockEnter var(--vk-motion-slow, 300ms) var(--vk-ease-enter, ease-out) forwards;
  transition: background-color var(--vk-motion-base, 200ms) ease,
              border-color var(--vk-motion-base, 200ms) ease,
              box-shadow var(--vk-motion-base, 200ms) ease;
}

@keyframes vkDockEnter {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
