<template>
  <ion-page>
    <ion-content :fullscreen="true" :scroll-y="false" class="vk-unlock-page">
      <OnboardingLayout
        :title="greetingTitle"
        :subtitle="greetingSubtitle"
        :show-back="false"
        hero-size="pin"
        content-position="center"
      >
        <!-- Top Branding Row -->
        <template #top-brand>
          <div class="vk-unlock-brand-pill">
            <VaultifyLogo variant="alt" :size="20" class="vk-unlock-brand-logo" />
            <span>Vaultify</span>
          </div>
        </template>

        <!-- PIN Dots & Status inside Red Hero -->
        <template #hero-bottom>
          <div class="vk-pin-hero-slot">
            <PinDots
              :filled-count="enteredPin.length"
              :has-error="hasError"
            />
            <div class="vk-pin-status-slot">
              <span
                v-if="statusMessage"
                class="vk-pin-status-text"
                :class="{ 'is-lockout': lockoutInfo.isLocked }"
              >
                {{ statusMessage }}
              </span>
            </div>
          </div>
        </template>

        <!-- White Sheet: Use Master Password + Keypad -->
        <div class="vk-unlock-sheet-content">
          <!-- Fallback Link positioned above keypad -->
          <div class="vk-unlock-fallback-row">
            <button
              type="button"
              class="vk-btn-master-fallback"
              @click="goToMasterPasswordFallback"
            >
              Use Master Password
            </button>
          </div>

          <!-- Numeric Keypad -->
          <div class="vk-pin-keypad-container">
            <PinKeypad
              :disabled="isLoading || lockoutInfo.isLocked"
              :show-biometric="isBiometricEnabledAndAvailable"
              :biometric-type="biometricAvailability.type"
              @digit="handleDigit"
              @backspace="handleBackspace"
              @biometric="handleBiometricClick"
            />
          </div>
        </div>
      </OnboardingLayout>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { IonPage, IonContent } from '@ionic/vue';
import { useAuthStore } from '@/stores/auth.store';
import { useVaultStore } from '@/stores/vault.store';
import { useSettingsStore } from '@/stores/settings.store';
import { useProfileStore } from '@/stores/profile.store';
import { useToast } from '@/composables/useToast';
import { PinService } from '@/services/pin.service';
import {
  BiometricService,
  BiometricAvailability,
  BiometricUserCancelledError,
  BiometricLockoutError,
} from '@/services/biometric.service';
import { PinLockoutInfo } from '@/models/pin.model';
import OnboardingLayout from '@/components/onboarding/OnboardingLayout.vue';
import PinDots from '@/components/security/PinDots.vue';
import PinKeypad from '@/components/security/PinKeypad.vue';
import VaultifyLogo from '@/components/common/VaultifyLogo.vue';

const router = useRouter();
const authStore = useAuthStore();
const vaultStore = useVaultStore();
const settingsStore = useSettingsStore();
const profileStore = useProfileStore();
const { showToast } = useToast();

const enteredPin = ref('');
const isLoading = ref(false);
const hasError = ref(false);
const statusMessage = ref('');

const greetingTitle = computed(() => {
  const name = profileStore.displayName;
  if (!name || name === 'User' || name.trim() === '') return 'Welcome back.';
  return `Welcome back, ${name.trim()}.`;
});

const greetingSubtitle = computed(() => {
  if (lockoutInfo.value.isLocked) {
    return `Too many failed attempts. Try again in ${lockoutInfo.value.remainingSeconds}s.`;
  }
  return 'Enter your PIN to unlock your vault.';
});

const lockoutInfo = ref<PinLockoutInfo>({ isLocked: false, remainingSeconds: 0, failedAttempts: 0 });
let lockoutTimer: number | null = null;

const biometricAvailability = ref<BiometricAvailability>({ available: false, type: 'none', label: 'Biometrics' });

const isBiometricEnabledAndAvailable = computed(() => {
  return settingsStore.settings.biometricsEnabled && biometricAvailability.value.available;
});

onMounted(async () => {
  // Check lockout status
  await updateLockoutStatus();

  // Check biometric availability
  biometricAvailability.value = await BiometricService.checkAvailability();

  // Check if PIN exists on device; if not configured, route to Master password fallback
  const hasPin = await PinService.hasConfiguredPin();
  if (!hasPin) {
    router.replace('/unlock/master');
    return;
  }

  // Auto prompt biometrics once on native app if enabled and not locked out
  if (isBiometricEnabledAndAvailable.value && !lockoutInfo.value.isLocked && !authStore.isUnlocked) {
    window.setTimeout(() => {
      if (!authStore.isUnlocked && !isLoading.value) {
        attemptBiometricUnlock(true);
      }
    }, 320);
  }
});

onUnmounted(() => {
  if (lockoutTimer) {
    window.clearInterval(lockoutTimer);
    lockoutTimer = null;
  }
  enteredPin.value = '';
});

async function updateLockoutStatus() {
  const status = await PinService.getLockoutStatus();
  lockoutInfo.value = status;

  if (status.isLocked) {
    startLockoutCountdown(status.remainingSeconds);
  }
}

function startLockoutCountdown(seconds: number) {
  if (lockoutTimer) window.clearInterval(lockoutTimer);

  let remaining = seconds;
  statusMessage.value = `Try again in ${remaining}s`;

  lockoutTimer = window.setInterval(() => {
    remaining--;
    if (remaining <= 0) {
      if (lockoutTimer) window.clearInterval(lockoutTimer);
      lockoutTimer = null;
      lockoutInfo.value.isLocked = false;
      statusMessage.value = '';
      enteredPin.value = '';
    } else {
      statusMessage.value = `Try again in ${remaining}s`;
    }
  }, 1000);
}

function handleDigit(digit: string) {
  if (lockoutInfo.value.isLocked || isLoading.value) return;

  if (enteredPin.value.length < 6) {
    enteredPin.value += digit;
    hasError.value = false;
    statusMessage.value = '';

    if (enteredPin.value.length === 6) {
      // Automatic submission upon 6th digit
      window.setTimeout(() => {
        submitPin();
      }, 120);
    }
  }
}

function handleBackspace() {
  if (lockoutInfo.value.isLocked || isLoading.value) return;

  if (enteredPin.value.length > 0) {
    enteredPin.value = enteredPin.value.slice(0, -1);
    hasError.value = false;
    statusMessage.value = '';
  }
}

async function submitPin() {
  if (enteredPin.value.length !== 6 || isLoading.value) return;

  isLoading.value = true;
  hasError.value = false;

  try {
    const payload = await authStore.unlockWithPin(enteredPin.value);
    vaultStore.setDecryptedPayload(payload);
    showToast('Vault unlocked', 'success', 1500);
    router.replace('/tabs/vault');
  } catch (err: any) {
    hasError.value = true;
    const msg = err.message || 'Incorrect PIN';
    statusMessage.value = msg;

    // Check updated lockout status
    await updateLockoutStatus();

    window.setTimeout(() => {
      enteredPin.value = '';
    }, 400);
  } finally {
    isLoading.value = false;
  }
}

function handleBiometricClick() {
  if (lockoutInfo.value.isLocked || isLoading.value) return;
  attemptBiometricUnlock(false);
}

async function attemptBiometricUnlock(isAutoPrompt: boolean) {
  if (isLoading.value) return;

  isLoading.value = true;
  try {
    const payload = await authStore.unlockWithBiometrics();
    vaultStore.setDecryptedPayload(payload);
    showToast('Vault unlocked', 'success', 1500);
    router.replace('/tabs/vault');
  } catch (err: any) {
    if (err instanceof BiometricUserCancelledError) {
      // User cancelled prompt - stay quietly on PIN screen
      return;
    }

    if (err instanceof BiometricLockoutError) {
      showToast('Biometric unlock is temporarily unavailable. Use your PIN or master password.', 'warning', 4000);
      return;
    }

    if (!isAutoPrompt) {
      showToast('Biometric authentication failed', 'danger', 2500);
    }
  } finally {
    isLoading.value = false;
  }
}

function goToMasterPasswordFallback() {
  router.push('/unlock/master');
}
</script>

<style scoped>
.vk-unlock-page {
  --background: var(--canvas);
}

/* Subtle Top Brand Header */
.vk-unlock-brand-pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 0.85rem;
  font-weight: 800;
  color: #FFFFFF;
  letter-spacing: -0.01em;
  padding: 5px 14px;
  background: rgba(255, 255, 255, 0.14);
  border-radius: var(--radius-pill, 999px);
  user-select: none;
  margin: 0 auto;
}

.vk-unlock-brand-logo {
  width: 18px;
  height: 18px;
  object-fit: contain;
}

/* PIN Hero Slot (Positioned inside Red Hero below Subtitle) */
.vk-pin-hero-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: clamp(20px, 3.2dvh, 28px);
  width: 100%;
}

.vk-pin-status-slot {
  min-height: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 6px;
}

.vk-pin-status-text {
  font-size: 0.775rem;
  font-weight: 700;
  color: #FFFFFF;
  background: rgba(0, 0, 0, 0.28);
  padding: 3px 12px;
  border-radius: var(--radius-pill, 999px);
  letter-spacing: -0.01em;
  text-align: center;
  line-height: 1.2;
}

.vk-pin-status-text.is-lockout {
  background: rgba(245, 158, 11, 0.35);
  color: #FFFBEB;
}

/* White / Dark Sheet Content */
.vk-unlock-sheet-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin: 0 auto;
}

/* Fallback Link positioned above keypad */
.vk-unlock-fallback-row {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: clamp(20px, 3dvh, 26px);
  width: 100%;
}

.vk-btn-master-fallback {
  background: transparent;
  border: none;
  color: var(--brand-red, #B82825);
  font-size: 0.8125rem; /* ~13px */
  font-weight: 600;
  cursor: pointer;
  padding: 6px 14px;
  border-radius: var(--radius-pill, 999px);
  letter-spacing: -0.01em;
  transition: transform var(--vk-motion-instant, 90ms) var(--vk-ease-press, ease),
              opacity var(--vk-motion-fast, 120ms) ease;
  user-select: none;
  outline: none;
  -webkit-tap-highlight-color: transparent;
}

.vk-btn-master-fallback:hover {
  opacity: 0.85;
}

.vk-btn-master-fallback:active {
  transform: scale(0.95);
  background: rgba(184, 40, 37, 0.08);
}

/* Keypad Container */
.vk-pin-keypad-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin: 0 auto;
}

/* Responsive adjustment for short devices (<= 720px) */
@media (max-height: 720px) {
  .vk-pin-hero-slot {
    margin-top: 14px;
  }
  .vk-unlock-fallback-row {
    margin-bottom: 14px;
  }
}

/* Dark mode overrides for fallback button */
:global(.dark) .vk-btn-master-fallback,
:global(.ion-palette-dark) .vk-btn-master-fallback,
:global(body.dark-theme) .vk-btn-master-fallback {
  color: #D3332F;
}

:global(.dark) .vk-btn-master-fallback:active,
:global(.ion-palette-dark) .vk-btn-master-fallback:active,
:global(body.dark-theme) .vk-btn-master-fallback:active {
  background: rgba(211, 51, 47, 0.15);
}
</style>
