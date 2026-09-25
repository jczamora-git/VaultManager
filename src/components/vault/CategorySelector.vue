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
  transition: all 0.18s ease;
  user-select: none;
  flex-shrink: 0;
  letter-spacing: -0.01em;
}

.vk-category-pill:hover {
  background: #E5E4E0;
  color: var(--text-primary);
}

.vk-category-pill.is-active {
  background: var(--black);
  color: #FFFFFF;
}

.dark .vk-category-pill.is-active {
  background: #FFFFFF;
  color: var(--black);
}
</style>
