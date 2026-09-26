<template>
  <div class="vk-credential-row-card" @click="$emit('select', credential.id)">
    <!-- 44px Logo Avatar -->
    <CredentialIcon
      :title="credential.title"
      :domain="credential.domain"
      :website="credential.website"
      :size="44"
      :radius="13"
    />

    <!-- Main Credential Info -->
    <div class="vk-card-info">
      <div class="vk-card-title-row">
        <span class="vk-card-title">{{ credential.title }}</span>
      </div>

      <div class="vk-card-secondary-row">
        <span v-if="credential.email" class="vk-card-subtext">{{ credential.email }}</span>
        <span v-else-if="credential.username" class="vk-card-subtext">{{ credential.username }}</span>
        <span v-else-if="credential.domain" class="vk-card-subtext">{{ credential.domain }}</span>
        <span v-else class="vk-card-subtext vk-card-muted">Password account</span>
      </div>
    </div>

    <!-- Actions & Indicators -->
    <div class="vk-card-trailing-actions" @click.stop>
      <button
        type="button"
        class="vk-card-star-btn"
        :class="{ 'is-favorite': credential.favorite }"
        :title="credential.favorite ? 'Remove from favorites' : 'Mark as favorite'"
        @click="$emit('toggle-favorite', credential.id)"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          :fill="credential.favorite ? 'var(--brand-red, #D3332F)' : 'none'"
          :stroke="credential.favorite ? 'var(--brand-red, #D3332F)' : 'currentColor'"
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
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="vk-card-chevron"
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
.vk-credential-row-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  min-height: 64px;
  width: 100%;
  background: #FFFFFF;
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.025);
  margin-bottom: 9px;
  cursor: pointer;
  transition: transform var(--vk-motion-fast) var(--vk-ease-press),
              background-color 140ms ease,
              border-color 140ms ease;
  user-select: none;
}

@media (hover: hover) {
  .vk-credential-row-card:hover {
    background: #F8F8F6;
  }
}

.vk-credential-row-card:active {
  transform: scale(0.99);
  background: #EFEFEA;
}

:global(.dark) .vk-credential-row-card,
:global(.ion-palette-dark) .vk-credential-row-card,
:global(body.dark-theme) .vk-credential-row-card,
:global([data-theme="dark"]) .vk-credential-row-card {
  background: #181818 !important;
  border-color: rgba(255, 255, 255, 0.06) !important;
  box-shadow: none !important;
}

@media (hover: hover) {
  :global(.dark) .vk-credential-row-card:hover,
  :global(.ion-palette-dark) .vk-credential-row-card:hover,
  :global(body.dark-theme) .vk-credential-row-card:hover,
  :global([data-theme="dark"]) .vk-credential-row-card:hover {
    background: #202020 !important;
  }
}

:global(.dark) .vk-credential-row-card:active,
:global(.ion-palette-dark) .vk-credential-row-card:active,
:global(body.dark-theme) .vk-credential-row-card:active,
:global([data-theme="dark"]) .vk-credential-row-card:active {
  background: #252525 !important;
}

.vk-card-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.vk-card-title-row {
  display: flex;
  align-items: center;
}

.vk-card-title {
  font-weight: 700;
  font-size: 0.95rem; /* ~15px */
  color: var(--text-primary, #151515);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.01em;
}

:global(.dark) .vk-card-title,
:global(.ion-palette-dark) .vk-card-title,
:global(body.dark-theme) .vk-card-title,
:global([data-theme="dark"]) .vk-card-title {
  color: #F5F5F5 !important;
}

.vk-card-secondary-row {
  display: flex;
  align-items: center;
}

.vk-card-subtext {
  font-size: 0.775rem; /* ~12px */
  color: var(--text-secondary, #777777);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 400;
}

:global(.dark) .vk-card-subtext,
:global(.ion-palette-dark) .vk-card-subtext,
:global(body.dark-theme) .vk-card-subtext,
:global([data-theme="dark"]) .vk-card-subtext {
  color: #8F8F8F !important;
}

.vk-card-muted {
  color: var(--text-muted, #9A9A9A);
}

.vk-card-trailing-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.vk-card-star-btn {
  background: transparent;
  border: none;
  padding: 6px;
  border-radius: 50%;
  color: var(--text-muted, #9A9A9A);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform var(--vk-motion-fast) var(--vk-ease-press),
              color var(--vk-motion-fast) ease;
}

:global(.dark) .vk-card-star-btn,
:global(.ion-palette-dark) .vk-card-star-btn,
:global(body.dark-theme) .vk-card-star-btn,
:global([data-theme="dark"]) .vk-card-star-btn {
  color: rgba(255, 255, 255, 0.42) !important;
}

.vk-card-star-btn:hover {
  color: var(--text-primary);
}

.vk-card-star-btn:active {
  transform: scale(1.18);
}

.vk-card-star-btn.is-favorite,
:global(.dark) .vk-card-star-btn.is-favorite,
:global(.ion-palette-dark) .vk-card-star-btn.is-favorite,
:global(body.dark-theme) .vk-card-star-btn.is-favorite,
:global([data-theme="dark"]) .vk-card-star-btn.is-favorite {
  color: var(--brand-red, #D3332F) !important;
}

.vk-card-chevron {
  color: var(--text-muted, #B0B0B0);
  transition: transform var(--vk-motion-fast) ease, color var(--vk-motion-fast) ease;
}

:global(.dark) .vk-card-chevron,
:global(.ion-palette-dark) .vk-card-chevron,
:global(body.dark-theme) .vk-card-chevron,
:global([data-theme="dark"]) .vk-card-chevron {
  color: rgba(255, 255, 255, 0.45) !important;
}

.vk-credential-row-card:hover .vk-card-chevron {
  transform: translateX(2px);
  color: var(--text-primary);
}

:global(.dark) .vk-credential-row-card:hover .vk-card-chevron,
:global(.ion-palette-dark) .vk-credential-row-card:hover .vk-card-chevron,
:global(body.dark-theme) .vk-credential-row-card:hover .vk-card-chevron,
:global([data-theme="dark"]) .vk-credential-row-card:hover .vk-card-chevron {
  color: #FFFFFF !important;
}
</style>
