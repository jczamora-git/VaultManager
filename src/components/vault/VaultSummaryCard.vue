<template>
  <div class="vk-kpi-card" role="region" aria-label="Vault Summary">
    <!-- Top Row: My Vault Heading -->
    <div class="vk-kpi-header">
      <span class="vk-kpi-title">My Vault</span>
    </div>

    <!-- Primary Metric: Large Count + Label -->
    <div class="vk-kpi-metric">
      <span class="vk-kpi-count">{{ count }}</span>
      <span class="vk-kpi-label">Saved accounts</span>
    </div>

    <!-- Action Buttons Grid -->
    <div class="vk-kpi-actions">
      <button
        type="button"
        class="vk-kpi-btn vk-kpi-btn-primary"
        @click="$emit('add-login')"
        aria-label="Add new login"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M5 12h14"/><path d="M12 5v14"/>
        </svg>
        <span>Add Login</span>
      </button>

      <button
        type="button"
        class="vk-kpi-btn vk-kpi-btn-secondary"
        @click="$emit('generate')"
        aria-label="Generate strong password"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="m13 2-2 2.5h3L11 8h3l-5 8 2-5H8l2-4.5H7Z"/>
        </svg>
        <span>Generate</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  count: number;
}>();

defineEmits<{
  (e: 'add-login'): void;
  (e: 'generate'): void;
}>();
</script>

<style scoped>
.vk-kpi-card {
  width: 100%;
  background: linear-gradient(145deg, #A8201E 0%, #8F1918 100%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 26px;
  box-shadow: 0 10px 24px rgba(90, 0, 0, 0.14);
  padding: 20px 22px;
  display: flex;
  flex-direction: column;
  user-select: none;
  animation: vkKpiFadeIn 200ms var(--vk-ease-enter, cubic-bezier(0.16, 1, 0.3, 1)) forwards;
  transition: background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

@keyframes vkKpiFadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.vk-kpi-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.vk-kpi-title {
  font-size: 0.875rem; /* 14px */
  font-weight: 600;
  color: rgba(255, 255, 255, 0.88);
  letter-spacing: -0.01em;
  text-transform: none;
}

.vk-kpi-metric {
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
}

.vk-kpi-count {
  font-size: clamp(2.5rem, 9vw, 2.85rem); /* ~40px-46px */
  font-weight: 800;
  color: #FFFFFF;
  line-height: 1;
  letter-spacing: -0.04em;
  transition: transform 120ms ease;
}

.vk-kpi-label {
  font-size: 0.8125rem; /* ~13px */
  font-weight: 500;
  color: rgba(255, 255, 255, 0.82);
  margin-top: 4px;
}

.vk-kpi-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  width: 100%;
}

.vk-kpi-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  height: 48px;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  cursor: pointer;
  outline: none;
  transition: transform var(--vk-motion-instant, 90ms) var(--vk-ease-press, ease),
              opacity var(--vk-motion-fast, 120ms) ease,
              background-color 120ms ease;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  white-space: nowrap;
}

.vk-kpi-btn:active {
  transform: scale(0.96);
}

.vk-kpi-btn-primary {
  background: #FFFFFF;
  color: #151515;
  border: none;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
}

.vk-kpi-btn-primary:hover {
  opacity: 0.94;
}

.vk-kpi-btn-secondary {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.22);
  color: #FFFFFF;
}

.vk-kpi-btn-secondary:hover {
  background: rgba(255, 255, 255, 0.14);
}

/* Dark Mode Appearance */
:global(.dark) .vk-kpi-card,
:global(.ion-palette-dark) .vk-kpi-card,
:global(body.dark-theme) .vk-kpi-card {
  background: #1B1B1B;
  border-color: rgba(255, 255, 255, 0.08);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.35);
}

:global(.dark) .vk-kpi-title,
:global(.ion-palette-dark) .vk-kpi-title,
:global(body.dark-theme) .vk-kpi-title {
  color: rgba(255, 255, 255, 0.75);
}

:global(.dark) .vk-kpi-label,
:global(.ion-palette-dark) .vk-kpi-label,
:global(body.dark-theme) .vk-kpi-label {
  color: rgba(255, 255, 255, 0.7);
}

:global(.dark) .vk-kpi-btn-primary,
:global(.ion-palette-dark) .vk-kpi-btn-primary,
:global(body.dark-theme) .vk-kpi-btn-primary {
  background: #F4F4F2;
  color: #101010;
}

:global(.dark) .vk-kpi-btn-secondary,
:global(.ion-palette-dark) .vk-kpi-btn-secondary,
:global(body.dark-theme) .vk-kpi-btn-secondary {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.14);
  color: #F5F5F5;
}
</style>
