<template>
  <button
    type="button"
    class="vk-copy-btn"
    :class="{ 'is-copied': isCopied, 'vk-copy-btn-sm': size === 'sm' }"
    :title="label || 'Copy to clipboard'"
    @click.stop="handleCopy"
  >
    <svg
      v-if="!isCopied"
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="vk-copy-icon"
    >
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
    <svg
      v-else
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--brand-red)"
      stroke-width="2.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="vk-check-icon"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
    <span v-if="showText" class="vk-copy-text">{{ isCopied ? 'Copied' : (label || 'Copy') }}</span>
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useClipboard } from '@/composables/useClipboard';

const props = withDefaults(
  defineProps<{
    text: string;
    label?: string;
    toastMessage?: string;
    showText?: boolean;
    size?: 'sm' | 'md';
  }>(),
  {
    toastMessage: 'Copied to clipboard',
    showText: false,
    size: 'md',
  }
);

const { copy } = useClipboard();
const isCopied = ref(false);
let timer: number | null = null;

async function handleCopy() {
  if (!props.text) return;
  const success = await copy(props.text, props.toastMessage);
  if (success) {
    isCopied.value = true;
    if (timer) window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      isCopied.value = false;
    }, 1200);
  }
}
</script>

<style scoped>
.vk-copy-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: var(--surface-light);
  border: none;
  border-radius: var(--radius-pill);
  color: var(--text-primary);
  padding: 8px 12px;
  cursor: pointer;
  transition: transform var(--vk-motion-fast) var(--vk-ease-press),
              background-color var(--vk-motion-base) ease,
              color var(--vk-motion-base) ease;
  font-size: 0.8rem;
  font-weight: 700;
}

.dark .vk-copy-btn,
.ion-palette-dark .vk-copy-btn,
body.dark-theme .vk-copy-btn {
  background: #202020;
  color: #F5F5F5;
}

@media (hover: hover) {
  .vk-copy-btn:hover {
    background: #E5E4E0;
  }
  .dark .vk-copy-btn:hover,
  .ion-palette-dark .vk-copy-btn:hover,
  body.dark-theme .vk-copy-btn:hover {
    background: #292929;
    color: #FFFFFF;
  }
}

.vk-copy-btn:active {
  transform: scale(0.97);
}

.dark .vk-copy-btn:active,
.ion-palette-dark .vk-copy-btn:active,
body.dark-theme .vk-copy-btn:active {
  background: #303030;
}

.vk-copy-btn-sm {
  padding: 6px 10px;
  font-size: 0.75rem;
}

.vk-copy-btn.is-copied {
  background: var(--brand-red-subtle);
  color: var(--brand-red);
}

.vk-check-icon {
  animation: vkCheckFadeIn var(--vk-motion-fast) var(--vk-ease-enter) forwards;
}

@keyframes vkCheckFadeIn {
  0% {
    opacity: 0;
    transform: scale(0.85);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
