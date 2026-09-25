<template>
  <ion-page>
    <ion-content :fullscreen="true" :scroll-y="false" class="vk-unlock-page">
      <!-- RED / DARK HERO TOP -->
      <div class="vk-hero-backdrop vk-unlock-hero">
        <div class="vk-container">
          <div class="vk-unlock-brand-pill">
            <VaultifyLogo variant="alt" :size="24" class="vk-unlock-brand-logo" />
            <span>Vaultify</span>
          </div>

          <div class="vk-unlock-hero-content">
            <h1 class="vk-hero-title">{{ greetingTitle }}</h1>
            <p class="vk-hero-subtitle">
              {{ lockoutInfo.isLocked ? 'Too many failed attempts.' : 'Enter your PIN to unlock your vault.' }}
            </p>
          </div>
        </div>
      </div>

      <!-- WHITE / DARK INPUT SHEET -->
      <div class="vk-sheet vk-unlock-sheet">
        <div class="vk-container vk-unlock-container">
          <!-- Flexible Top Breathing Room (Natural thumb-zone pusher) -->
          <div class="vk-unlock-top-spacer"></div>

          <!-- Unified PIN Interaction Group -->
          <div class="vk-pin-interaction-group">
            <!-- 6-Digit PIN Dots Indicator -->
            <PinDots
              :filled-count="enteredPin.length"
              :has-error="hasError"
            />

            <!-- Fixed-Height Status / Error Message Banner (Prevents layout jumping) -->
            <div class="vk-unlock-status-slot">
              <span v-if="statusMessage" class="vk-unlock-status" :class="{ 'is-lockout': lockoutInfo.isLocked }">
                {{ statusMessage }}
              </span>
            </div>

            <!-- Custom Numeric Keypad -->
            <PinKeypad
              :disabled="isLoading || lockoutInfo.isLocked"
              :show-biometric="isBiometricEnabledAndAvailable"
              :biometric-type="biometricAvailability.type"
              @digit="handleDigit"
              @backspace="handleBackspace"
              @biometric="handleBiometricClick"
            />

            <!-- Secondary Quiet "Use master password" fallback -->
            <div class="vk-unlock-footer">
              <button
                type="button"
                class="vk-btn-master-fallback"
                @click="goToMasterPasswordFallback"
              >
                Use master password
              </button>
            </div>
          </div>
        </div>
      </div>
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
  if (!name || name === 'User') return 'Welcome back.';
  return `Welcome back, ${name}.`;
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

.vk-unlock-hero {
  padding-top: calc(env(safe-area-inset-top, 0px) + 16px);
  padding-bottom: 24px;
}

.vk-unlock-brand-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  font-weight: 800;
  letter-spacing: -0.01em;
  margin-bottom: 12px;
}

.vk-unlock-brand-logo {
  width: 18px;
  height: 18px;
  object-fit: contain;
}

.vk-unlock-hero-content {
  margin-top: 2px;
}

.vk-hero-title {
  font-size: 1.85rem;
  font-weight: 800;
  color: #FFFFFF;
  margin: 0 0 6px 0;
  letter-spacing: -0.03em;
}

.dark .vk-hero-title {
  color: var(--text-primary);
}

.vk-hero-subtitle {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
  line-height: 1.4;
}

.dark .vk-hero-subtitle {
  color: var(--text-secondary);
}

/* White / Dark Sheet Flex Layout */
.vk-unlock-sheet {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: calc(100dvh - 160px);
  background: var(--vk-bg-sheet);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
}

.vk-unlock-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 360px;
  margin: 0 auto;
  padding-top: 8px;
  padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 24px);
}

/* Natural thumb-zone vertical pusher */
.vk-unlock-top-spacer {
  flex: 1;
  min-height: 16px;
  max-height: 100px;
}

/* Unified Interaction Group */
.vk-pin-interaction-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 320px;
}

/* Fixed-height error/status slot prevents keypad jumping */
.vk-unlock-status-slot {
  min-height: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 6px 0 16px 0;
}

.vk-unlock-status {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--brand-red);
  text-align: center;
  line-height: 1.2;
}

.vk-unlock-status.is-lockout {
  color: #F59E0B;
}

.vk-unlock-footer {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}

.vk-unlock-hero-content {
  animation: vkFadeUp var(--vk-motion-base) var(--vk-ease-enter) forwards;
}

.vk-btn-master-fallback {
  background: transparent;
  border: none;
  color: var(--brand-red);
  font-size: 0.885rem;
  font-weight: 600;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: var(--radius-pill);
  transition: transform var(--vk-motion-instant) var(--vk-ease-press), opacity var(--vk-motion-fast) ease;
  user-select: none;
}

.vk-btn-master-fallback:hover {
  opacity: 0.85;
}

.vk-btn-master-fallback:active {
  transform: scale(0.97);
}

/* Short screens (<= 720px) */
@media (max-height: 720px) {
  .vk-unlock-hero {
    padding-bottom: 16px;
  }
  .vk-unlock-top-spacer {
    min-height: 8px;
    max-height: 32px;
  }
  .vk-unlock-status-slot {
    margin: 4px 0 12px 0;
  }
  .vk-unlock-footer {
    margin-top: 16px;
  }
}

/* Tall screens (>= 850px) */
@media (min-height: 850px) {
  .vk-unlock-top-spacer {
    min-height: 32px;
    max-height: 120px;
  }
}

/* Dark mode fallback link */
:global(.dark) .vk-btn-master-fallback,
:global(.ion-palette-dark) .vk-btn-master-fallback,
:global(body.dark-theme) .vk-btn-master-fallback {
  color: #D3332F;
}
</style>
