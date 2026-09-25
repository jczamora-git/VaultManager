<template>
  <div class="vk-credential-row" @click="$emit('select', credential.id)">
    <!-- 46px Logo Avatar -->
    <CredentialIcon
      :title="credential.title"
      :domain="credential.domain"
      :website="credential.website"
      :size="46"
      :radius="14"
    />

    <!-- Main Credential Info -->
    <div class="vk-credential-info">
      <div class="vk-credential-title-row">
        <span class="vk-credential-title">{{ credential.title }}</span>
      </div>

      <div class="vk-credential-secondary">
        <span v-if="credential.email" class="vk-credential-subtext">{{ credential.email }}</span>
        <span v-else-if="credential.username" class="vk-credential-subtext">{{ credential.username }}</span>
        <span v-else-if="credential.domain" class="vk-credential-subtext">{{ credential.domain }}</span>
        <span v-else class="vk-credential-subtext vk-text-muted">Password account</span>
      </div>
    </div>

    <!-- Actions & Indicators -->
    <div class="vk-credential-actions" @click.stop>
      <button
        type="button"
        class="vk-star-btn"
        :class="{ 'is-favorite': credential.favorite }"
        :title="credential.favorite ? 'Remove from favorites' : 'Mark as favorite'"
        @click="$emit('toggle-favorite', credential.id)"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          :fill="credential.favorite ? 'var(--brand-red)' : 'none'"
          :stroke="credential.favorite ? 'var(--brand-red)' : 'currentColor'"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      </button>

      <!-- Chevron -->
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
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
  </div>
</template>

<script setup lang="ts">
import { Credential } from '@/models/credential.model';
import CredentialIcon from '@/components/common/CredentialIcon.vue';

defineProps<{
  credential: Credential;
}>();

defineEmits<{
  (e: 'select', id: string): void;
  (e: 'toggle-favorite', id: string): void;
}>();
</script>

<style scoped>
.vk-credential-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 4px;
  min-height: 70px;
  border-bottom: 1px solid var(--border-light);
  cursor: pointer;
  transition: transform var(--vk-motion-fast) var(--vk-ease-press),
              background-color var(--vk-motion-base) ease;
  user-select: none;
}

.vk-credential-row:active {
  transform: scale(0.99);
}

.vk-credential-row:last-child {
  border-bottom: none;
}

.vk-credential-row:hover {
  background: rgba(0, 0, 0, 0.02);
}

.vk-credential-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.vk-credential-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.vk-credential-title {
  font-weight: 700;
  font-size: 1.02rem;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.01em;
}

.vk-credential-secondary {
  display: flex;
  align-items: center;
}

.vk-credential-subtext {
  font-size: 0.85rem;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 400;
}

.vk-credential-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.vk-star-btn {
  background: transparent;
  border: none;
  padding: 6px;
  border-radius: 50%;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform var(--vk-motion-fast) var(--vk-ease-press),
              color var(--vk-motion-fast) ease,
              background-color var(--vk-motion-fast) ease;
}

.vk-star-btn:hover {
  background: var(--surface-light);
  color: var(--text-primary);
}

.vk-star-btn:active {
  transform: scale(1.15);
}

.vk-star-btn.is-favorite {
  color: var(--brand-red);
}

.vk-chevron-icon {
  color: var(--text-muted);
  transition: transform var(--vk-motion-fast) var(--vk-ease-standard), color var(--vk-motion-fast) ease;
}

.vk-credential-row:hover .vk-chevron-icon {
  transform: translateX(3px);
  color: var(--text-primary);
}
</style>
