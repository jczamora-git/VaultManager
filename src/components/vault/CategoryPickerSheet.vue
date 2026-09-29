<template>
  <ion-modal
    :is-open="isOpen"
    :initial-breakpoint="0.8"
    :breakpoints="[0, 0.8, 1]"
    class="vk-bottom-sheet vk-category-picker-modal"
    @didDismiss="$emit('dismiss')"
  >
    <div class="vk-modal-sheet-content vk-category-sheet-content">
      <!-- Drag Handle Indicator -->
      <div class="vk-sheet-handle-bar" aria-hidden="true">
        <span class="vk-sheet-handle"></span>
      </div>

      <!-- Header Section -->
      <div class="vk-category-sheet-header">
        <div class="vk-category-sheet-titles">
          <h3 class="vk-category-sheet-title">Choose a category</h3>
          <p class="vk-category-sheet-subtitle">What kind of login are you adding?</p>
        </div>
        <button
          type="button"
          class="vk-btn-icon-only vk-sheet-close-btn"
          @click="$emit('dismiss')"
          aria-label="Close category selector"
        >
          ✕
        </button>
      </div>

      <!-- Category Options List -->
      <div class="vk-category-sheet-list" role="list">
        <button
          v-for="cat in categories"
          :key="cat.id"
          type="button"
          class="vk-category-sheet-row"
          :class="{ 'is-selected': selectedCategory === cat.id }"
          @click="handleSelect(cat.id)"
          role="listitem"
        >
          <!-- Category Icon Badge -->
          <div
            class="vk-category-badge"
            :style="{
              color: cat.color,
              backgroundColor: `${cat.color}15`,
            }"
            aria-hidden="true"
          >
            <!-- Social -->
            <svg
              v-if="cat.id === 'Social'"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>

            <!-- Email -->
            <svg
              v-else-if="cat.id === 'Email'"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>

            <!-- Work -->
            <svg
              v-else-if="cat.id === 'Work'"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              <rect width="20" height="14" x="2" y="6" rx="2" />
            </svg>

            <!-- School -->
            <svg
              v-else-if="cat.id === 'School'"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" />
              <path d="M22 10v6" />
              <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
            </svg>

            <!-- Developer / Development -->
            <svg
              v-else-if="cat.id === 'Development'"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>

            <!-- Banking -->
            <svg
              v-else-if="cat.id === 'Banking'"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="3" x2="21" y1="22" y2="22" />
              <line x1="6" x2="6" y1="18" y2="11" />
              <line x1="10" x2="10" y1="18" y2="11" />
              <line x1="14" x2="14" y1="18" y2="11" />
              <line x1="18" x2="18" y1="18" y2="11" />
              <polygon points="12 2 20 7 4 7" />
            </svg>

            <!-- Shopping -->
            <svg
              v-else-if="cat.id === 'Shopping'"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>

            <!-- Entertainment -->
            <svg
              v-else-if="cat.id === 'Entertainment'"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect width="20" height="15" x="2" y="7" rx="2" />
              <polyline points="17 2 12 7 7 2" />
            </svg>

            <!-- Gaming -->
            <svg
              v-else-if="cat.id === 'Gaming'"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="6" x2="10" y1="12" y2="12" />
              <line x1="8" x2="8" y1="10" y2="14" />
              <line x1="15" x2="15.01" y1="13" y2="13" />
              <line x1="18" x2="18.01" y1="11" y2="11" />
              <rect width="20" height="12" x="2" y="6" rx="2" />
            </svg>

            <!-- Other / Default -->
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="7.5" cy="15.5" r="5.5" />
              <path d="m21 2-9.6 9.6" />
              <path d="m15.5 7.5 3 3L22 7l-3-3" />
            </svg>
          </div>

          <!-- Category Texts -->
          <div class="vk-category-info">
            <span class="vk-category-name">{{ cat.name }}</span>
            <span class="vk-category-desc">{{ cat.description }}</span>
          </div>

          <!-- Trailing Selection Indicator / Chevron -->
          <div class="vk-category-trailing">
            <svg
              v-if="selectedCategory === cat.id"
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--vk-accent)"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="vk-chevron-icon"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </div>
        </button>
      </div>

      <!-- Action Footer -->
      <div class="vk-category-sheet-footer">
        <button
          type="button"
          class="vk-btn vk-btn-secondary vk-btn-block"
          @click="$emit('dismiss')"
        >
          Cancel
        </button>
      </div>
    </div>
  </ion-modal>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { IonModal } from '@ionic/vue';
import { CredentialCategory, DEFAULT_CATEGORIES } from '@/models/credential.model';

defineProps<{
  isOpen: boolean;
  selectedCategory?: CredentialCategory;
}>();

const emit = defineEmits<{
  (e: 'select', category: CredentialCategory): void;
  (e: 'dismiss'): void;
}>();

const categories = computed(() => DEFAULT_CATEGORIES);

function handleSelect(category: CredentialCategory) {
  emit('select', category);
}
</script>

<style scoped>
/* Modal sheet customization */
.vk-category-sheet-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 85vh;
  box-sizing: border-box;
  background: var(--vk-surface);
  color: var(--vk-text);
  padding: 10px 18px 24px 18px;
}

/* Grab handle */
.vk-sheet-handle-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4px 0 10px 0;
  width: 100%;
}

.vk-sheet-handle {
  width: 36px;
  height: 4px;
  border-radius: var(--radius-pill, 9999px);
  background: var(--vk-border, rgba(0, 0, 0, 0.12));
}

/* Header */
.vk-category-sheet-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 4px 4px 14px 4px;
  border-bottom: 1px solid var(--vk-divider);
  gap: 12px;
}

.vk-category-sheet-titles {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.vk-category-sheet-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--vk-text);
  margin: 0;
  letter-spacing: -0.02em;
}

.vk-category-sheet-subtitle {
  font-size: 0.825rem;
  color: var(--vk-text-secondary);
  margin: 0;
  line-height: 1.35;
}

.vk-sheet-close-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--vk-control-bg);
  color: var(--vk-text-secondary);
  border: none;
  cursor: pointer;
  font-size: 0.85rem;
  flex-shrink: 0;
  transition: transform var(--vk-motion-instant, 90ms) ease,
              background-color var(--vk-motion-fast, 120ms) ease;
}

.vk-sheet-close-btn:active {
  transform: scale(0.92);
}

/* Scrollable category list */
.vk-category-sheet-list {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 10px 2px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
}

.vk-category-sheet-row {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 10px 14px;
  border-radius: 16px;
  background: var(--vk-surface-elevated);
  border: 1px solid var(--vk-border);
  gap: 14px;
  cursor: pointer;
  text-align: left;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  transition: transform var(--vk-motion-instant, 90ms) var(--vk-ease-press, ease),
              background-color var(--vk-motion-fast, 120ms) ease,
              border-color var(--vk-motion-fast, 120ms) ease,
              box-shadow var(--vk-motion-fast, 120ms) ease;
}

.vk-category-sheet-row:hover {
  background: var(--vk-surface-soft);
  border-color: var(--vk-accent-glow);
}

.vk-category-sheet-row:active {
  transform: scale(0.985);
  background: var(--vk-accent-soft);
}

.vk-category-sheet-row.is-selected {
  border-color: var(--vk-accent);
  background: var(--vk-accent-soft);
}

/* Badge Icon */
.vk-category-badge {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform 120ms ease;
}

.vk-category-sheet-row:active .vk-category-badge {
  transform: scale(0.94);
}

/* Info Texts */
.vk-category-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.vk-category-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--vk-text);
  letter-spacing: -0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.vk-category-desc {
  font-size: 0.775rem;
  color: var(--vk-text-secondary);
  line-height: 1.25;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Trailing Chevron */
.vk-category-trailing {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--vk-text-muted);
  flex-shrink: 0;
}

.vk-chevron-icon {
  opacity: 0.6;
}

/* Footer Cancel Button */
.vk-category-sheet-footer {
  padding-top: 12px;
  border-top: 1px solid var(--vk-divider);
  flex-shrink: 0;
}
</style>
