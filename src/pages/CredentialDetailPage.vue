<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <!-- HERO TOP BACKDROP -->
      <div class="vk-hero-backdrop vk-detail-hero" v-if="credential">
        <div class="vk-container">
          <!-- Top Navigation Row -->
          <div class="vk-detail-top-nav">
            <button type="button" class="vk-hero-circle-btn" @click="handleBack" title="Back">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="m15 18-6-6 6-6"/>
              </svg>
            </button>

            <button type="button" class="vk-hero-circle-btn" @click="handleToggleFavorite" :title="credential.favorite ? 'Remove from favorites' : 'Add to favorites'">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                :fill="credential.favorite ? '#FFFFFF' : 'none'"
                :stroke="'#FFFFFF'"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </button>
          </div>

          <!-- Hero Account Card Profile -->
          <div class="vk-hero-account-profile">
            <CredentialIcon
              :title="credential.title"
              :domain="credential.domain"
              :website="credential.website"
              :size="68"
              :radius="20"
            />
            <h1 class="vk-hero-account-title">{{ credential.title }}</h1>
            <span class="vk-hero-account-sub" v-if="credential.domain">{{ credential.domain }}</span>
            <span class="vk-hero-account-sub" v-else>{{ credential.category }}</span>
          </div>
        </div>
      </div>

      <!-- MAIN WHITE / DARK SHEET -->
      <div class="vk-sheet" v-if="credential">
        <div class="vk-container">
          <!-- Information Rows -->
          <div class="vk-detail-fields">
            <!-- Email -->
            <div class="vk-detail-row" v-if="credential.email">
              <div class="vk-detail-info">
                <span class="vk-detail-label">Email Address</span>
                <span class="vk-detail-value">{{ credential.email }}</span>
              </div>
              <CopyButton :text="credential.email" toast-message="Email copied" />
            </div>

            <!-- Username -->
            <div class="vk-detail-row" v-if="credential.username">
              <div class="vk-detail-info">
                <span class="vk-detail-label">Username</span>
                <span class="vk-detail-value">{{ credential.username }}</span>
              </div>
              <CopyButton :text="credential.username" toast-message="Username copied" />
            </div>

            <!-- Password -->
            <div class="vk-detail-row vk-password-detail-row">
              <div class="vk-detail-info">
                <div class="vk-pw-label-row">
                  <span class="vk-detail-label">Password</span>
                  <span v-if="isPasswordRevealed" class="vk-revealed-timer">Hiding in {{ autoHideCountdown }}s</span>
                </div>
                <div class="vk-detail-value font-mono">
                  <span v-if="isPasswordRevealed">{{ credential.password }}</span>
                  <span v-else class="vk-masked-dots">••••••••••••••••</span>
                </div>
              </div>

              <div class="vk-detail-actions-cluster">
                <button
                  type="button"
                  class="vk-btn vk-btn-secondary vk-btn-sm"
                  @click="togglePasswordReveal"
                >
                  <svg v-if="!isPasswordRevealed" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/>
                  </svg>
                  <span>{{ isPasswordRevealed ? 'Hide' : 'Reveal' }}</span>
                </button>

                <CopyButton :text="credential.password" toast-message="Password copied" />
              </div>
            </div>

            <!-- Strength Meter inside detail -->
            <div class="vk-detail-row vk-strength-detail-row">
              <PasswordStrengthMeter :password="credential.password" :show-suggestions="true" />
            </div>

            <!-- Website -->
            <div class="vk-detail-row" v-if="credential.website">
              <div class="vk-detail-info">
                <span class="vk-detail-label">Website</span>
                <a :href="formattedWebsiteUrl" target="_blank" rel="noopener noreferrer" class="vk-detail-link">
                  {{ credential.website }}
                </a>
              </div>
              <a :href="formattedWebsiteUrl" target="_blank" rel="noopener noreferrer" class="vk-btn vk-btn-secondary vk-btn-sm" title="Open website">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
                <span>Open</span>
              </a>
            </div>

            <!-- Notes -->
            <div class="vk-detail-row vk-notes-row" v-if="credential.notes">
              <span class="vk-detail-label">Notes</span>
              <div class="vk-notes-content">{{ credential.notes }}</div>
            </div>
          </div>

          <!-- Bottom Action Buttons -->
          <div class="vk-detail-page-actions">
            <button type="button" class="vk-btn vk-btn-primary vk-btn-block" @click="goToEdit">
              Edit Login
            </button>

            <button type="button" class="vk-btn vk-btn-danger vk-btn-block" @click="showDeleteConfirm = true">
              Delete Login
            </button>
          </div>
        </div>
      </div>

      <!-- Genuine Not Found Fallback (Only shown when genuinely missing and not navigating away) -->
      <div v-else-if="isNotFound && !isLeaving" class="vk-sheet">
        <div class="vk-container">
          <EmptyState
            title="Account not found"
            description="The requested credential does not exist or was deleted."
            action-label="Back to Vault"
            @action="router.replace('/tabs/vault')"
          />
        </div>
      </div>

      <!-- Delete Confirmation Modal (Shared Swipe-to-Delete Modal) -->
      <DeleteCredentialModal
        :is-open="showDeleteConfirm"
        :credential="credential"
        @close="showDeleteConfirm = false"
        @confirm="handleDelete"
      />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, shallowRef, watch, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router';
import { IonPage, IonContent, IonModal, onIonViewWillEnter, onIonViewWillLeave } from '@ionic/vue';
import { Credential } from '@/models/credential.model';
import { useVaultStore } from '@/stores/vault.store';
import { useToast } from '@/composables/useToast';
import CredentialIcon from '@/components/common/CredentialIcon.vue';
import CopyButton from '@/components/common/CopyButton.vue';
import PasswordStrengthMeter from '@/components/common/PasswordStrengthMeter.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import DeleteCredentialModal from '@/components/vault/DeleteCredentialModal.vue';

const route = useRoute();
const router = useRouter();
const vaultStore = useVaultStore();
const { showToast } = useToast();

const credential = shallowRef<Credential | null>(null);
const isNotFound = ref(false);
const isLeaving = ref(false);

const isPasswordRevealed = ref(false);
const autoHideCountdown = ref(30);
let countdownInterval: number | null = null;
const showDeleteConfirm = ref(false);

function resolveCredential() {
  if (isLeaving.value) return;
  const id = (route.params.id as string) || '';
  if (!id) {
    if (!credential.value) {
      isNotFound.value = true;
    }
    return;
  }
  const found = vaultStore.getCredentialById(id);
  if (found) {
    credential.value = found;
    isNotFound.value = false;
    vaultStore.recordView(found.id);
  } else {
    if (!credential.value) {
      isNotFound.value = true;
    }
  }
}

watch(
  () => route.params.id,
  (newId, oldId) => {
    if (newId && newId !== oldId && !isLeaving.value) {
      credential.value = null;
      isNotFound.value = false;
      resolveCredential();
    }
  }
);

onMounted(() => {
  resolveCredential();
});

onIonViewWillEnter(() => {
  isLeaving.value = false;
  resolveCredential();
});

onIonViewWillLeave(() => {
  isLeaving.value = true;
});

onBeforeRouteLeave(() => {
  isLeaving.value = true;
});

function handleBack() {
  isLeaving.value = true;
  if (window.history.length > 1) {
    router.back();
  } else {
    router.replace('/tabs/vault');
  }
}

const formattedWebsiteUrl = computed(() => {
  if (!credential.value?.website) return '';
  const url = credential.value.website.trim();
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
});

function togglePasswordReveal() {
  isPasswordRevealed.value = !isPasswordRevealed.value;
  if (isPasswordRevealed.value) {
    startAutoHideTimer();
  } else {
    stopAutoHideTimer();
  }
}

function startAutoHideTimer() {
  stopAutoHideTimer();
  autoHideCountdown.value = 30;
  countdownInterval = window.setInterval(() => {
    autoHideCountdown.value--;
    if (autoHideCountdown.value <= 0) {
      isPasswordRevealed.value = false;
      stopAutoHideTimer();
    }
  }, 1000);
}

function stopAutoHideTimer() {
  if (countdownInterval) {
    window.clearInterval(countdownInterval);
    countdownInterval = null;
  }
}

async function handleToggleFavorite() {
  if (!credential.value) return;
  const isFav = await vaultStore.toggleFavorite(credential.value.id);
  if (credential.value) {
    credential.value = { ...credential.value, favorite: isFav };
  }
  showToast(isFav ? 'Added to favorites' : 'Removed from favorites', 'primary', 1200);
}

function goToEdit() {
  if (!credential.value) return;
  router.push(`/credential/${credential.value.id}/edit`);
}

async function handleDelete() {
  if (!credential.value) return;
  const title = credential.value.title;
  isLeaving.value = true;
  await vaultStore.deleteCredential(credential.value.id);
  showDeleteConfirm.value = false;
  showToast(`"${title}" deleted`, 'success');
  router.replace('/tabs/vault');
}

onUnmounted(() => {
  stopAutoHideTimer();
});
</script>

<style scoped>
ion-content {
  --background: var(--vk-brand-gradient, linear-gradient(180deg, #D02724 0%, #C12320 45%, #B8201E 100%));
  background: var(--vk-brand-gradient, linear-gradient(180deg, #D02724 0%, #C12320 45%, #B8201E 100%));
}

.vk-detail-hero {
  text-align: center;
  padding-bottom: 28px;
}

.vk-detail-top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.vk-hero-circle-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.vk-hero-circle-btn:hover {
  background: rgba(255, 255, 255, 0.25);
}

.vk-hero-account-profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.vk-hero-account-title {
  font-size: 1.8rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin: 4px 0 0 0;
  color: var(--vk-bg-hero-text);
}

.vk-hero-account-sub {
  font-size: 0.9rem;
  color: var(--vk-bg-hero-subtitle);
  font-weight: 400;
}

.vk-detail-fields {
  display: flex;
  flex-direction: column;
  margin-bottom: 32px;
}

.vk-detail-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 4px;
  border-bottom: 1px solid var(--vk-divider);
  gap: 12px;
}

.vk-detail-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.vk-detail-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.vk-detail-value {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  word-break: break-all;
}

.vk-detail-link {
  font-size: 1rem;
  font-weight: 700;
  color: var(--brand-red);
  text-decoration: none;
  word-break: break-all;
}

.vk-pw-label-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.vk-revealed-timer {
  font-size: 0.7rem;
  color: #b45309;
  font-weight: 600;
}

.vk-masked-dots {
  letter-spacing: 3px;
  color: var(--text-secondary);
}

.vk-detail-actions-cluster {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.vk-strength-detail-row {
  padding: 12px 4px;
  display: block;
}

.vk-notes-row {
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.vk-notes-content {
  font-size: 0.95rem;
  color: var(--text-primary);
  white-space: pre-wrap;
  line-height: 1.5;
}

.vk-detail-page-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 36px;
}

.font-mono {
  font-family: var(--vk-font-mono);
}
</style>
