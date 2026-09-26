<template>
  <div class="vk-category-scroller">
    <button
      v-if="showAllOption"
      type="button"
      class="vk-category-pill"
      :class="{ 'is-active': modelValue === 'All' }"
      @click="$emit('update:modelValue', 'All')"
    >
      <span>All</span>
    </button>

    <button
      v-for="cat in DEFAULT_CATEGORIES"
      :key="cat.id"
      type="button"
      class="vk-category-pill"
      :class="{ 'is-active': modelValue === cat.id }"
      @click="$emit('update:modelValue', cat.id)"
    >
      <span>{{ cat.name }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { CredentialCategory, DEFAULT_CATEGORIES } from '@/models/credential.model';

withDefaults(
  defineProps<{
    modelValue: CredentialCategory | 'All';
    showAllOption?: boolean;
  }>(),
  {
    showAllOption: true,
  }
);

defineEmits<{
  (e: 'update:modelValue', val: CredentialCategory | 'All'): void;
}>();
</script>

<style scoped>
.vk-category-scroller {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 2px 2px 14px 2px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.vk-category-scroller::-webkit-scrollbar {
  display: none;
}

.vk-category-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 18px;
  height: 38px;
  background: var(--surface-light);
  border: none;
  border-radius: var(--radius-pill);
  font-size: 0.825rem;
  font-weight: 700;
  color: var(--text-secondary);
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 140ms ease, color 140ms ease, transform 140ms ease;
  user-select: none;
  flex-shrink: 0;
  letter-spacing: -0.01em;
}

.dark .vk-category-pill,
.ion-palette-dark .vk-category-pill,
body.dark-theme .vk-category-pill {
  background: #202020;
  color: #A0A0A0;
}

@media (hover: hover) {
  .vk-category-pill:hover {
    background: #E5E4E0;
    color: var(--text-primary);
  }
  .dark .vk-category-pill:hover,
  .ion-palette-dark .vk-category-pill:hover,
  body.dark-theme .vk-category-pill:hover {
    background: #292929;
    color: #F5F5F5;
  }
}

.vk-category-pill:active {
  transform: scale(0.96);
}

.dark .vk-category-pill:active,
.ion-palette-dark .vk-category-pill:active,
body.dark-theme .vk-category-pill:active {
  background: #303030;
}

.vk-category-pill.is-active {
  background: var(--black);
  color: #FFFFFF;
}

.dark .vk-category-pill.is-active,
.ion-palette-dark .vk-category-pill.is-active,
body.dark-theme .vk-category-pill.is-active {
  background: #FFFFFF;
  color: var(--black);
}
</style>
