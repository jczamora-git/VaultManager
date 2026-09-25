<template>
  <nav class="vk-floating-dock-wrap" aria-label="Main Navigation">
    <!-- Vault Tab -->
    <button
      type="button"
      class="vk-dock-item"
      :class="{ 'is-active': activeTab === 'vault' }"
      @click="navigate('/tabs/vault')"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
      <span class="vk-dock-label">Vault</span>
      <span v-if="activeTab === 'vault'" class="vk-dock-active-dot"></span>
    </button>

    <!-- Generator Tab -->
    <button
      type="button"
      class="vk-dock-item"
      :class="{ 'is-active': activeTab === 'generator' }"
      @click="navigate('/tabs/generator')"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m13 2-2 2.5h3L11 8h3l-5 8 2-5H8l2-4.5H7Z"/>
      </svg>
      <span class="vk-dock-label">Generator</span>
      <span v-if="activeTab === 'generator'" class="vk-dock-active-dot"></span>
    </button>

    <!-- Cipher Tab -->
    <button
      type="button"
      class="vk-dock-item"
      :class="{ 'is-active': activeTab === 'cipher' }"
      @click="navigate('/tabs/cipher')"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/>
      </svg>
      <span class="vk-dock-label">Cipher</span>
      <span v-if="activeTab === 'cipher'" class="vk-dock-active-dot"></span>
    </button>

    <!-- Settings Tab -->
    <button
      type="button"
      class="vk-dock-item"
      :class="{ 'is-active': activeTab === 'settings' }"
      @click="navigate('/tabs/settings')"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>
      </svg>
      <span class="vk-dock-label">Settings</span>
      <span v-if="activeTab === 'settings'" class="vk-dock-active-dot"></span>
    </button>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

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
