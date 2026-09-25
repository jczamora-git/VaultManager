<template>
  <ion-page>
    <ion-content :fullscreen="true" :scroll-y="false" class="vk-master-unlock-page">
      <OnboardingLayout
        title="Use master password"
        subtitle="Enter your Master Password to unlock Vaultify or recover PIN access."
        :show-back="true"
        hero-size="medium"
        content-position="center-lower"
        @back="goBackToPin"
      >
        <form @submit.prevent="handleMasterUnlock" class="vk-master-form" :class="{ 'is-shaking': hasError }">
          <div class="vk-input-group">
            <label class="vk-label">Master Password</label>
            <div class="vk-input-wrapper" :class="{ 'is-invalid': errorMessage }">
              <input
                :type="showPassword ? 'text' : 'password'"
                v-model="password"
                placeholder="Master password..."
                class="vk-input"
                autocomplete="current-password"
                autofocus
                required
              />
              <button type="button" class="vk-btn-icon-only" @click="showPassword = !showPassword" tabindex="-1">
                <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/>
                </svg>
              </button>
            </div>
            <div v-if="errorMessage" class="vk-error-text">{{ errorMessage }}</div>
          </div>

          <div class="vk-master-actions">
            <button type="submit" class="vk-btn vk-btn-primary vk-btn-block" :disabled="isLoading">
              <span v-if="!isLoading">Unlock Vault</span>
              <span v-else>Verifying Key...</span>
            </button>

            <button
              type="button"
              class="vk-btn vk-btn-secondary vk-btn-block"
              @click="goBackToPin"
            >
              Back to PIN
            </button>
          </div>
        </form>
      </OnboardingLayout>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { IonPage, IonContent } from '@ionic/vue';
import { useAuthStore } from '@/stores/auth.store';
import { useVaultStore } from '@/stores/vault.store';
import { useToast } from '@/composables/useToast';
import { PinService } from '@/services/pin.service';
import OnboardingLayout from '@/components/onboarding/OnboardingLayout.vue';

const router = useRouter();
const authStore = useAuthStore();
const vaultStore = useVaultStore();
const { showToast } = useToast();

const password = ref('');
const showPassword = ref(false);
const isLoading = ref(false);
const errorMessage = ref('');
const hasError = ref(false);

function goBackToPin() {
  router.replace('/unlock');
}

async function handleMasterUnlock() {
  errorMessage.value = '';
  hasError.value = false;

  if (!password.value) {
    errorMessage.value = 'Please enter your master password.';
    return;
  }

  isLoading.value = true;
  try {
    const payload = await authStore.unlockWithMasterPassword(password.value);
    vaultStore.setDecryptedPayload(payload);

    // Reset failed PIN attempts upon master password verification
    await PinService.recordSuccessfulUnlock();

    showToast('Vault unlocked', 'success', 1500);
    router.replace('/tabs/vault');
  } catch {
    hasError.value = true;
    errorMessage.value = 'Incorrect master password. Check your password and try again.';
    password.value = '';
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
.vk-master-unlock-page {
  --background: linear-gradient(
    180deg,
    #C62A27 0%,
    #B82825 45%,
    #A92220 100%
  );
  background: linear-gradient(
    180deg,
    #C62A27 0%,
    #B82825 45%,
    #A92220 100%
  );
}

.dark .vk-master-unlock-page {
  --background: linear-gradient(
    180deg,
    #181818 0%,
    #121212 45%,
    #0D0D0D 100%
  );
  background: linear-gradient(
    180deg,
    #181818 0%,
    #121212 45%,
    #0D0D0D 100%
  );
}

.vk-master-form {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.vk-master-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 20px;
}

.is-shaking {
  animation: shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

@keyframes shake {
  10%, 90% { transform: translate3d(-2px, 0, 0); }
  20%, 80% { transform: translate3d(4px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-6px, 0, 0); }
  40%, 60% { transform: translate3d(6px, 0, 0); }
}
</style>
