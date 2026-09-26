<template>
  <button
    type="button"
    class="vk-dock-item"
    :class="{ 'is-active': active }"
    :aria-label="ariaLabel || ariaLabelFallback"
    :aria-current="active ? 'page' : undefined"
    @click="$emit('navigate', route)"
  >
    <div class="vk-dock-slot">
      <!-- Inactive Icon Only -->
      <div class="vk-dock-icon-wrapper" aria-hidden="true">
        <!-- Vault Icon: lock-closed-outline -->
        <svg
          v-if="icon === 'vault'"
          xmlns="http://www.w3.org/2000/svg"
          width="21"
          height="21"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.1"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>

        <!-- Generator Icon: cycle / regenerate icon -->
        <svg
          v-else-if="icon === 'generator'"
          xmlns="http://www.w3.org/2000/svg"
          width="21"
          height="21"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.1"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
          <path d="M3 3v5h5"/>
          <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
          <path d="M16 21h5v-5"/>
        </svg>

        <!-- Cipher Icon: key-outline -->
        <svg
          v-else-if="icon === 'cipher'"
          xmlns="http://www.w3.org/2000/svg"
          width="21"
          height="21"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.1"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="7.5" cy="15.5" r="5.5"/>
          <path d="m21 2-9.6 9.6"/>
          <path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4"/>
        </svg>

        <!-- Settings Icon: settings-outline -->
        <svg
          v-else-if="icon === 'settings'"
          xmlns="http://www.w3.org/2000/svg"
          width="21"
          height="21"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.1"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      </div>

      <!-- Active Text Pill Only -->
      <div class="vk-dock-pill-wrapper" aria-hidden="true">
        <span class="vk-dock-pill">{{ activeLabel }}</span>
      </div>
    </div>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  icon: 'vault' | 'generator' | 'cipher' | 'settings';
  activeLabel: string;
  active: boolean;
  route: string;
  ariaLabel?: string;
}>();

defineEmits<{
  (e: 'navigate', path: string): void;
}>();

const ariaLabelFallback = computed(() => {
  switch (props.icon) {
    case 'vault':
      return 'Vault';
    case 'generator':
      return 'Password Generator';
    case 'cipher':
      return 'Cipher';
    case 'settings':
      return 'Settings';
    default:
      return 'Tab';
  }
});
</script>

<style scoped>
.vk-dock-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 44px;
  background: transparent;
  border: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
  position: relative;
  outline: none;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  transition: transform var(--vk-motion-instant, 100ms) var(--vk-ease-press, ease);
}

.vk-dock-item:active {
  transform: scale(0.95);
}

.vk-dock-slot {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.vk-dock-icon-wrapper {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--vk-dock-text);
  opacity: 1;
  transform: scale(1);
  transition: opacity 160ms cubic-bezier(0.2, 0, 0, 1), transform 160ms cubic-bezier(0.2, 0, 0, 1), color 160ms ease;
  pointer-events: none;
}

.vk-dock-item.is-active .vk-dock-icon-wrapper {
  opacity: 0;
  transform: scale(0.85);
  pointer-events: none;
}

.vk-dock-pill-wrapper {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: scale(0.92);
  transition: opacity 160ms cubic-bezier(0.2, 0, 0, 1), transform 160ms cubic-bezier(0.2, 0, 0, 1);
  pointer-events: none;
}

.vk-dock-item.is-active .vk-dock-pill-wrapper {
  opacity: 1;
  transform: scale(1);
  pointer-events: auto;
}

.vk-dock-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  padding: 0 14px;
  min-width: 44px;
  background: var(--vk-dock-pill-bg, #B82825);
  color: var(--vk-dock-pill-text, #FFFFFF);
  border-radius: 999px;
  font-family: var(--vk-font-sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
  font-size: 11.5px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  box-shadow: 0 2px 10px rgba(184, 40, 37, 0.28);
  white-space: nowrap;
  line-height: 1;
}
</style>
