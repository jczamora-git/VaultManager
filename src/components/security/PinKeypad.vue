<template>
  <div class="vk-pin-keypad" :class="{ 'is-disabled': disabled }">
    <!-- Row 1: 1, 2, 3 -->
    <div class="vk-keypad-row">
      <button
        type="button"
        class="vk-keypad-btn"
        :disabled="disabled"
        aria-label="Digit 1"
        @click="handlePress('1')"
      >
        <span>1</span>
      </button>

      <button
        type="button"
        class="vk-keypad-btn"
        :disabled="disabled"
        aria-label="Digit 2"
        @click="handlePress('2')"
      >
        <span>2</span>
      </button>

      <button
        type="button"
        class="vk-keypad-btn"
        :disabled="disabled"
        aria-label="Digit 3"
        @click="handlePress('3')"
      >
        <span>3</span>
      </button>
    </div>

    <!-- Row 2: 4, 5, 6 -->
    <div class="vk-keypad-row">
      <button
        type="button"
        class="vk-keypad-btn"
        :disabled="disabled"
        aria-label="Digit 4"
        @click="handlePress('4')"
      >
        <span>4</span>
      </button>

      <button
        type="button"
        class="vk-keypad-btn"
        :disabled="disabled"
        aria-label="Digit 5"
        @click="handlePress('5')"
      >
        <span>5</span>
      </button>

      <button
        type="button"
        class="vk-keypad-btn"
        :disabled="disabled"
        aria-label="Digit 6"
        @click="handlePress('6')"
      >
        <span>6</span>
      </button>
    </div>

    <!-- Row 3: 7, 8, 9 -->
    <div class="vk-keypad-row">
      <button
        type="button"
        class="vk-keypad-btn"
        :disabled="disabled"
        aria-label="Digit 7"
        @click="handlePress('7')"
      >
        <span>7</span>
      </button>

      <button
        type="button"
        class="vk-keypad-btn"
        :disabled="disabled"
        aria-label="Digit 8"
        @click="handlePress('8')"
      >
        <span>8</span>
      </button>

      <button
        type="button"
        class="vk-keypad-btn"
        :disabled="disabled"
        aria-label="Digit 9"
        @click="handlePress('9')"
      >
        <span>9</span>
      </button>
    </div>

    <!-- Row 4: Biometric / Spacer, 0, Backspace -->
    <div class="vk-keypad-row">
      <!-- Biometric Slot (Bottom-left) -->
      <button
        v-if="showBiometric"
        type="button"
        class="vk-keypad-btn vk-keypad-action-btn vk-biometric-btn"
        :disabled="disabled"
        :aria-label="biometricType === 'face' ? 'Unlock with Face ID' : 'Unlock with Fingerprint'"
        @click="handleBiometric"
      >
        <!-- Face Icon -->
        <svg
          v-if="biometricType === 'face'"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M3 7V5a2 2 0 0 1 2-2h2"></path>
          <path d="M17 3h2a2 2 0 0 1 2 2v2"></path>
          <path d="M21 17v2a2 2 0 0 1-2 2h-2"></path>
          <path d="M7 21H5a2 2 0 0 1-2-2v-2"></path>
          <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
          <line x1="9" y1="9" x2="9.01" y2="9"></line>
          <line x1="15" y1="9" x2="15.01" y2="9"></line>
        </svg>

        <!-- Fingerprint Icon -->
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"></path>
          <path d="M14 13.12c0 2.38 0 6.38-1 8.88"></path>
          <path d="M17.29 21.02c.12-.6.43-2.3.43-5.02 0-3.41-.9-5.11-2.02-6.52-1.3-1.63-2.67-2.48-3.7-2.48-1.5 0-3 1.09-3.7 2.48-.68 1.35-.97 2.87-1.07 4.29"></path>
          <path d="M2 12C2 6.5 6.5 2 12 2a10 10 0 0 1 8 4"></path>
          <path d="M7 20.7a1 1 0 0 0 .5-.28c2.4-2.22 3.5-4.22 3.5-7.42"></path>
          <path d="M22 12c0 3.25-.8 5.75-1.5 7.5"></path>
        </svg>
      </button>
      <div v-else class="vk-keypad-spacer"></div>

      <!-- Digit 0 -->
      <button
        type="button"
        class="vk-keypad-btn"
        :disabled="disabled"
        aria-label="Digit 0"
        @click="handlePress('0')"
      >
        <span>0</span>
      </button>

      <!-- Backspace Slot (Bottom-right) -->
      <button
        type="button"
        class="vk-keypad-btn vk-keypad-action-btn vk-backspace-btn"
        :disabled="disabled"
        aria-label="Delete last digit"
        @click="handleBackspace"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="m10 15 5-5m0 5-5-5"></path>
          <path d="M20 5H9l-7 7 7 7h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Z"></path>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

const props = withDefaults(
  defineProps<{
    disabled?: boolean;
    showBiometric?: boolean;
    biometricType?: 'face' | 'fingerprint' | 'iris' | 'multiple' | 'none';
  }>(),
  {
    disabled: false,
    showBiometric: false,
    biometricType: 'fingerprint',
  }
);

const emit = defineEmits<{
  (e: 'digit', digit: string): void;
  (e: 'backspace'): void;
  (e: 'biometric'): void;
  (e: 'clear'): void;
}>();

async function triggerHaptic() {
  try {
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch {
    // Web / Desktop fallback
  }
}

function handlePress(digit: string) {
  if (props.disabled) return;
  triggerHaptic();
  emit('digit', digit);
}

function handleBackspace() {
  if (props.disabled) return;
  triggerHaptic();
  emit('backspace');
}

function handleBiometric() {
  if (props.disabled) return;
  triggerHaptic();
  emit('biometric');
}

function handleKeyDown(e: KeyboardEvent) {
  if (props.disabled) return;
  if (/^[0-9]$/.test(e.key)) {
    e.preventDefault();
    handlePress(e.key);
  } else if (e.key === 'Backspace') {
    e.preventDefault();
    handleBackspace();
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<style scoped>
.vk-pin-keypad {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(14px, 2.2dvh, 18px);
  width: 100%;
  max-width: 244px;
  margin: 0 auto;
  user-select: none;
}

.vk-pin-keypad.is-disabled {
  opacity: 0.45;
  pointer-events: none;
}

.vk-keypad-row {
  display: flex;
  justify-content: space-between;
  width: 100%;
  gap: clamp(18px, 4.5vw, 24px);
}

.vk-keypad-btn {
  width: clamp(54px, 15vw, 62px);
  height: clamp(54px, 15vw, 62px);
  min-width: 52px;
  min-height: 52px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.03);
  background: #F1EFEC;
  color: #151515;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(1.5rem, 4.5vw, 1.7rem);
  font-weight: 500;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: transform 90ms var(--vk-ease-press),
              background-color 100ms ease,
              color 100ms ease;
  outline: none;
  -webkit-tap-highlight-color: transparent;
}

.vk-keypad-btn:active {
  transform: scale(0.94);
  background: #E5E2DC;
}

.vk-keypad-action-btn {
  background: transparent;
  border-color: transparent;
  box-shadow: none;
  color: #151515;
  transition: transform 90ms var(--vk-ease-press),
              color 100ms ease;
}

.vk-keypad-action-btn:active {
  transform: scale(0.92);
  background: transparent;
}

.vk-biometric-btn {
  color: var(--brand-red);
}

.vk-keypad-spacer {
  width: clamp(54px, 15vw, 62px);
  height: clamp(54px, 15vw, 62px);
  min-width: 52px;
  min-height: 52px;
}

/* Responsive adjustment for short devices (<= 720px) */
@media (max-height: 720px) {
  .vk-pin-keypad {
    gap: 12px;
    max-width: 236px;
  }
  .vk-keypad-row {
    gap: 18px;
  }
}

/* Dark Theme Keypad - Scoped strictly to non-onboarding screens */
:global(.dark:not(.vaultify-onboarding)) .vk-keypad-btn:not(.vaultify-onboarding *),
:global(.ion-palette-dark:not(.vaultify-onboarding)) .vk-keypad-btn:not(.vaultify-onboarding *),
:global(body.dark-theme:not(.vaultify-onboarding)) .vk-keypad-btn:not(.vaultify-onboarding *) {
  background: #1E1E1E;
  color: #F5F5F5;
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.28);
}

:global(.dark:not(.vaultify-onboarding)) .vk-keypad-btn:not(.vaultify-onboarding *):active,
:global(.ion-palette-dark:not(.vaultify-onboarding)) .vk-keypad-btn:not(.vaultify-onboarding *):active,
:global(body.dark-theme:not(.vaultify-onboarding)) .vk-keypad-btn:not(.vaultify-onboarding *):active {
  background: #282828;
}

:global(.dark:not(.vaultify-onboarding)) .vk-keypad-action-btn:not(.vaultify-onboarding *),
:global(.ion-palette-dark:not(.vaultify-onboarding)) .vk-keypad-action-btn:not(.vaultify-onboarding *),
:global(body.dark-theme:not(.vaultify-onboarding)) .vk-keypad-action-btn:not(.vaultify-onboarding *) {
  background: transparent;
  border-color: transparent;
  box-shadow: none;
  color: #F5F5F5;
}

:global(.dark:not(.vaultify-onboarding)) .vk-biometric-btn:not(.vaultify-onboarding *),
:global(.ion-palette-dark:not(.vaultify-onboarding)) .vk-biometric-btn:not(.vaultify-onboarding *),
:global(body.dark-theme:not(.vaultify-onboarding)) .vk-biometric-btn:not(.vaultify-onboarding *) {
  color: #D3332F;
}
</style>
