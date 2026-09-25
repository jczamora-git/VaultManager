<template>
  <div class="vk-toast-container">
    <transition name="vk-toast-anim">
      <div
        v-if="currentToast"
        :key="currentToast.id"
        class="vk-toast"
        :class="[`is-${currentToast.type}`]"
        role="status"
        aria-live="polite"
      >
        <div class="vk-toast-icon">
          <!-- SUCCESS ICON (Checkmark) -->
          <svg
            v-if="currentToast.type === 'success'"
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="vk-icon-success"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>

          <!-- ERROR ICON (Alert circle / Exclamation) -->
          <svg
            v-else-if="currentToast.type === 'error'"
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="vk-icon-error"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>

          <!-- WARNING ICON (Triangle) -->
          <svg
            v-else-if="currentToast.type === 'warning'"
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="vk-icon-warning"
          >
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>

          <!-- INFO / NEUTRAL ICON -->
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="vk-icon-info"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        </div>

        <span class="vk-toast-message">{{ currentToast.message }}</span>

        <button
          v-if="currentToast.showClose"
          type="button"
          class="vk-toast-close"
          aria-label="Close notification"
          @click="dismissToast"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { useToast } from '@/composables/useToast';

const { currentToast, dismissToast } = useToast();
</script>

<style scoped>
.vk-toast-container {
  position: fixed;
  top: calc(env(safe-area-inset-top, 0px) + 12px);
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
  z-index: 99999;
  padding: 0 16px;
}

.vk-toast {
  pointer-events: auto;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 48px;
  width: 100%;
  max-width: 420px;
  padding: 12px 16px;
  border-radius: 18px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.22);
  user-select: none;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

/* Light Theme Defaults */
.vk-toast {
  background: #161616;
  color: #FFFFFF;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.vk-toast.is-success .vk-icon-success {
  color: #28A978;
}

.vk-toast.is-error {
  background: #1C1515;
  border: 1px solid rgba(239, 68, 68, 0.25);
  color: #FFFFFF;
}

.vk-toast.is-error .vk-icon-error {
  color: #EF4444;
}

.vk-toast.is-warning {
  background: #1C1914;
  border: 1px solid rgba(245, 158, 11, 0.25);
  color: #FFFFFF;
}

.vk-toast.is-warning .vk-icon-warning {
  color: #F59E0B;
}

.vk-toast.is-info .vk-icon-info {
  color: #A5A5A5;
}

/* Dark Mode Adaptations */
:global(.dark) .vk-toast,
:global(.ion-palette-dark) .vk-toast,
:global(body.dark-theme) .vk-toast {
  background: #F4F2EE;
  color: #101010;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45);
}

:global(.dark) .vk-toast.is-success .vk-icon-success,
:global(.ion-palette-dark) .vk-toast.is-success .vk-icon-success,
:global(body.dark-theme) .vk-toast.is-success .vk-icon-success {
  color: #219B70;
}

:global(.dark) .vk-toast.is-error,
:global(.ion-palette-dark) .vk-toast.is-error,
:global(body.dark-theme) .vk-toast.is-error {
  background: #241414;
  border: 1px solid rgba(239, 68, 68, 0.35);
  color: #FFFFFF;
}

:global(.dark) .vk-toast.is-error .vk-icon-error,
:global(.ion-palette-dark) .vk-toast.is-error .vk-icon-error,
:global(body.dark-theme) .vk-toast.is-error .vk-icon-error {
  color: #EF4444;
}

:global(.dark) .vk-toast.is-warning,
:global(.ion-palette-dark) .vk-toast.is-warning,
:global(body.dark-theme) .vk-toast.is-warning {
  background: #262118;
  border: 1px solid rgba(245, 158, 11, 0.35);
  color: #FFFFFF;
}

:global(.dark) .vk-toast.is-warning .vk-icon-warning,
:global(.ion-palette-dark) .vk-toast.is-warning .vk-icon-warning,
:global(body.dark-theme) .vk-toast.is-warning .vk-icon-warning {
  color: #F59E0B;
}

:global(.dark) .vk-toast.is-info .vk-icon-info,
:global(.ion-palette-dark) .vk-toast.is-info .vk-icon-info,
:global(body.dark-theme) .vk-toast.is-info .vk-icon-info {
  color: #666666;
}

.vk-toast-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.vk-toast-message {
  flex: 1;
  font-size: 0.885rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  line-height: 1.35;
}

.vk-toast-close {
  background: transparent;
  border: none;
  color: inherit;
  opacity: 0.6;
  padding: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: opacity 0.15s ease;
}

.vk-toast-close:hover {
  opacity: 1;
}

/* Subtle Motion Animation (180-220ms) */
.vk-toast-anim-enter-active {
  transition: opacity var(--vk-motion-base) var(--vk-ease-enter),
              transform var(--vk-motion-base) var(--vk-ease-enter);
}

.vk-toast-anim-leave-active {
  transition: opacity var(--vk-motion-base) var(--vk-ease-exit),
              transform var(--vk-motion-base) var(--vk-ease-exit);
}

.vk-toast-anim-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}

.vk-toast-anim-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
