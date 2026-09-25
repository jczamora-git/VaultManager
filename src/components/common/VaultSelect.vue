<template>
  <div class="vk-vault-select-container">
    <!-- Closed Pill Button -->
    <button
      type="button"
      class="vk-select-pill"
      :class="{ 'is-open': isOpen }"
      @click="isOpen = true"
      :title="selectedOption?.label || title"
    >
      <span class="vk-select-pill-text">{{ selectedOption?.label || placeholder }}</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="vk-select-chevron"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>

    <!-- Custom Modal Sheet -->
    <ion-modal
      :is-open="isOpen"
      :initial-breakpoint="modalBreakpoint"
      :breakpoints="[0, modalBreakpoint]"
      class="vk-bottom-sheet"
      @didDismiss="isOpen = false"
    >
      <div class="vk-modal-sheet-content">
        <div class="vk-modal-sheet-header">
          <h3 class="vk-modal-sheet-title">{{ title }}</h3>
          <button type="button" class="vk-btn-icon-only" @click="isOpen = false">
            ✕
          </button>
        </div>

        <div class="vk-select-options-list">
          <button
            v-for="opt in options"
            :key="String(opt.value)"
            type="button"
            class="vk-select-option-item"
            :class="{ 'is-selected': opt.value === modelValue }"
            @click="selectOption(opt.value)"
          >
            <span class="vk-option-item-label">{{ opt.label }}</span>
            <svg
              v-if="opt.value === modelValue"
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--brand-red)"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="vk-check-icon"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </button>
        </div>
      </div>
    </ion-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { IonModal } from '@ionic/vue';

export interface SelectOption<T = any> {
  label: string;
  value: T;
}

const props = withDefaults(
  defineProps<{
    modelValue: any;
    options: SelectOption[];
    title?: string;
    placeholder?: string;
    breakpoint?: number;
  }>(),
  {
    title: 'Select Option',
    placeholder: 'Choose...',
    breakpoint: 0.45,
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void;
  (e: 'change', value: any): void;
}>();

const isOpen = ref(false);

const selectedOption = computed(() => {
  return props.options.find((o) => o.value === props.modelValue);
});

const modalBreakpoint = computed(() => {
  // Dynamically size sheet depending on option count
  if (props.options.length <= 3) return 0.32;
  if (props.options.length <= 5) return 0.42;
  return 0.55;
});

function selectOption(val: any) {
  emit('update:modelValue', val);
  emit('change', val);
  isOpen.value = false;
}
</script>

<style scoped>
.vk-vault-select-container {
  display: inline-block;
}

.vk-select-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 38px;
  padding: 0 14px;
  background: var(--vk-bg-surface-soft);
  border: 1px solid transparent;
  border-radius: var(--radius-pill);
  color: var(--text-primary);
  font-size: 0.825rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform var(--vk-motion-fast) var(--vk-ease-press),
              background-color var(--vk-motion-base) ease,
              border-color var(--vk-motion-base) ease;
  user-select: none;
}

.vk-select-pill:active {
  transform: scale(0.97);
}

.vk-select-pill:hover {
  background: #E5E4E0;
}

.dark .vk-select-pill {
  background: var(--vk-bg-surface-soft);
  color: var(--text-primary);
  border-color: var(--vk-border);
}

.dark .vk-select-pill:hover {
  background: var(--vk-bg-surface-elevated);
}

.vk-select-pill-text {
  white-space: nowrap;
  letter-spacing: -0.01em;
}

.vk-select-chevron {
  color: var(--text-secondary);
  flex-shrink: 0;
  transition: transform var(--vk-motion-fast) var(--vk-ease-standard);
}

.is-open .vk-select-chevron {
  transform: rotate(180deg);
}

.vk-select-options-list {
  display: flex;
  flex-direction: column;
  margin-top: 4px;
}

.vk-select-option-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 54px;
  padding: 0 14px;
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--vk-divider);
  color: var(--text-primary);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  text-align: left;
  transition: background-color var(--vk-motion-fast) ease, color var(--vk-motion-fast) ease;
  border-radius: var(--radius-md);
}

.vk-select-option-item:last-child {
  border-bottom: none;
}

.vk-select-option-item:hover {
  background: var(--vk-bg-surface-soft);
}

.vk-select-option-item:active {
  background: var(--vk-bg-surface-elevated);
}

.vk-select-option-item.is-selected {
  color: var(--brand-red);
  font-weight: 700;
}

.vk-check-icon {
  flex-shrink: 0;
  animation: vkCheckFadeIn var(--vk-motion-fast) var(--vk-ease-enter) forwards;
}

@keyframes vkCheckFadeIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
