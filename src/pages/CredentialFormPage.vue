<template>
  <ion-page class="vk-credential-form-page">
    <ion-content ref="contentRef" :fullscreen="true" class="vk-credential-form-content">
      <div class="vk-credential-form-layout">
        <!-- HERO HEADER -->
        <header class="vk-form-hero-header">
          <div class="vk-container">
            <div class="vk-form-top-nav">
              <button type="button" class="vk-hero-circle-btn" @click="handleCancel" title="Back">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m15 18-6-6 6-6"/>
                </svg>
              </button>
            </div>

            <div class="vk-form-hero-body">
              <h1 class="vk-hero-title">{{ isEditMode ? 'Edit Login' : 'New Login' }}</h1>
              <p class="vk-hero-subtitle">
                {{ isEditMode ? 'Update and re-encrypt account details.' : 'Save a new account to your secure vault.' }}
              </p>
            </div>
          </div>
        </header>

        <!-- MAIN WHITE / DARK FORM SHEET -->
        <div class="vk-sheet" :class="isEditMode ? 'vk-edit-credential-sheet' : 'vk-new-credential-sheet'">
          <div class="vk-container">
            <form @submit.prevent="handleSubmit" class="vk-clean-form">
              <!-- Account Section -->
              <div class="vk-form-group-section">
                <span class="vk-form-section-label">Account</span>

                <!-- Title -->
                <div class="vk-input-group">
                  <label class="vk-label">Title <span class="text-danger">*</span></label>
                  <div class="vk-input-wrapper" :class="{ 'is-invalid': errors.title }">
                    <input
                      type="text"
                      v-model="form.title"
                      placeholder="e.g. GitHub, Netflix, Work Email"
                      class="vk-input"
                      required
                    />
                  </div>
                  <div v-if="errors.title" class="vk-error-text">{{ errors.title }}</div>
                </div>

                <!-- Website -->
                <div class="vk-input-group">
                  <label class="vk-label">Website / URL</label>
                  <div class="vk-input-wrapper">
                    <input
                      type="text"
                      v-model="form.website"
                      placeholder="https://github.com/login"
                      class="vk-input"
                    />
                  </div>
                </div>

                <!-- Category -->
                <div class="vk-input-group">
                  <label class="vk-label">Category</label>
                  <CategorySelector v-model="form.category" :show-all-option="false" />
                </div>
              </div>

              <!-- Login Credentials Section -->
              <div class="vk-form-group-section">
                <span class="vk-form-section-label">Credentials</span>

                <!-- Email -->
                <div class="vk-input-group">
                  <label class="vk-label">Email Address</label>
                  <div class="vk-input-wrapper">
                    <input
                      type="email"
                      v-model="form.email"
                      placeholder="name@example.com"
                      class="vk-input"
                      autocomplete="off"
                    />
                  </div>
                </div>

                <!-- Username -->
                <div class="vk-input-group">
                  <label class="vk-label">Username</label>
                  <div class="vk-input-wrapper">
                    <input
                      type="text"
                      v-model="form.username"
                      placeholder="username123"
                      class="vk-input"
                      autocomplete="off"
                    />
                  </div>
                </div>

                <!-- Password -->
                <div class="vk-input-group">
                  <div class="vk-label-row">
                    <label class="vk-label">Password <span class="text-danger">*</span></label>
                    <button type="button" class="vk-btn-generate-inline" @click="generateRandomPassword">
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="m13 2-2 2.5h3L11 8h3l-5 8 2-5H8l2-4.5H7Z"/>
                      </svg>
                      <span>Generate Strong</span>
                    </button>
                  </div>

                  <div class="vk-input-wrapper" :class="{ 'is-invalid': errors.password }">
                    <input
                      :type="showPassword ? 'text' : 'password'"
                      v-model="form.password"
                      placeholder="Password..."
                      class="vk-input font-mono"
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
                  <PasswordStrengthMeter :password="form.password" :show-suggestions="false" />
                  <div v-if="errors.password" class="vk-error-text">{{ errors.password }}</div>
                </div>
              </div>

              <!-- Additional Section -->
              <div class="vk-form-group-section">
                <span class="vk-form-section-label">Additional</span>

                <!-- Notes -->
                <div class="vk-input-group">
                  <label class="vk-label">Notes</label>
                  <div class="vk-input-wrapper vk-textarea-wrapper">
                    <textarea
                      v-model="form.notes"
                      placeholder="Optional recovery keys, PINs, or hints..."
                      rows="3"
                      class="vk-input vk-textarea"
                    ></textarea>
                  </div>
                </div>

                <!-- Favorite Toggle -->
                <div class="vk-toggle-row">
                  <div>
                    <div class="vk-toggle-label">Favorite</div>
                    <div class="vk-toggle-sub">Pin this account to your favorites</div>
                  </div>
                  <VaultToggle v-model="form.favorite" />
                </div>
              </div>

              <!-- Form Action Buttons -->
              <div class="vk-form-submit-actions">
                <button type="submit" class="vk-btn vk-btn-primary vk-btn-block" :disabled="isSaving">
                  <span v-if="!isSaving">{{ isEditMode ? 'Save Changes' : 'Save Login' }}</span>
                  <span v-else>Encrypting...</span>
                </button>

                <button type="button" class="vk-btn vk-btn-secondary vk-btn-block" @click="handleCancel">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { IonPage, IonContent, onIonViewDidEnter, useBackButton } from '@ionic/vue';
import { useVaultStore } from '@/stores/vault.store';
import { useToast } from '@/composables/useToast';
import { CredentialCategory, CredentialFormData } from '@/models/credential.model';
import { PasswordGeneratorService } from '@/services/password-generator.service';
import { DEFAULT_GENERATOR_OPTIONS } from '@/models/generator.model';
import CategorySelector from '@/components/vault/CategorySelector.vue';
import PasswordStrengthMeter from '@/components/common/PasswordStrengthMeter.vue';
import VaultToggle from '@/components/common/VaultToggle.vue';

const route = useRoute();
const router = useRouter();
const vaultStore = useVaultStore();
const { showToast } = useToast();

const contentRef = ref<any>(null);

const credentialId = computed(() => route.params.id as string | undefined);
const isEditMode = computed(() => !!credentialId.value);

const showPassword = ref(false);
const isSaving = ref(false);

const form = reactive<CredentialFormData>({
  title: '',
  website: '',
  email: '',
  username: '',
  password: '',
  notes: '',
  category: 'Other' as CredentialCategory,
  favorite: false,
});

const errors = reactive({
  title: '',
  password: '',
});

onMounted(() => {
  if (route.query.prefillPassword) {
    form.password = String(route.query.prefillPassword);
  }

  if (isEditMode.value && credentialId.value) {
    const existing = vaultStore.getCredentialById(credentialId.value);
    if (existing) {
      form.title = existing.title;
      form.website = existing.website || '';
      form.email = existing.email || '';
      form.username = existing.username || '';
      form.password = existing.password;
      form.notes = existing.notes || '';
      form.category = existing.category;
      form.favorite = existing.favorite;
    } else {
      showToast('Credential not found', 'danger');
      router.replace('/tabs/vault');
    }
  }
});

onIonViewDidEnter(() => {
  contentRef.value?.$el?.scrollToTop?.(0);
});

useBackButton(10, () => {
  handleCancel();
});

function generateRandomPassword() {
  form.password = PasswordGeneratorService.generate(DEFAULT_GENERATOR_OPTIONS);
  showPassword.value = true;
  showToast('Strong password generated', 'success', 1800);
}

async function handleSubmit() {
  errors.title = '';
  errors.password = '';

  if (!form.title.trim()) {
    errors.title = 'Account title is required.';
    return;
  }

  if (!form.password) {
    errors.password = 'Password is required.';
    return;
  }

  isSaving.value = true;
  try {
    if (isEditMode.value && credentialId.value) {
      await vaultStore.updateCredential(credentialId.value, form);
      showToast('Login updated', 'success');
      router.replace('/tabs/vault');
    } else {
      const created = await vaultStore.addCredential(form);
      showToast('Login saved', 'success');
      router.replace(`/credential/${created.id}`);
    }
  } catch (err: any) {
    showToast(err.message || 'Failed to save credential', 'danger');
  } finally {
    isSaving.value = false;
  }
}

function handleCancel() {
  router.replace('/tabs/vault');
}
</script>

<style scoped>
.vk-credential-form-page {
  --background: #FFFFFF;
  background: #FFFFFF;
}

.vk-credential-form-content {
  --background: #FFFFFF;
  background: #FFFFFF;
}

:global(.dark) .vk-credential-form-page,
:global(.ion-palette-dark) .vk-credential-form-page,
:global(body.dark-theme) .vk-credential-form-page,
:global([data-theme="dark"]) .vk-credential-form-page {
  --background: #151515;
  background: #151515;
}

:global(.dark) .vk-credential-form-content,
:global(.ion-palette-dark) .vk-credential-form-content,
:global(body.dark-theme) .vk-credential-form-content,
:global([data-theme="dark"]) .vk-credential-form-content {
  --background: #151515;
  background: #151515;
}

.vk-credential-form-layout {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  width: 100%;
  background: #FFFFFF;
}

:global(.dark) .vk-credential-form-layout,
:global(.ion-palette-dark) .vk-credential-form-layout,
:global(body.dark-theme) .vk-credential-form-layout,
:global([data-theme="dark"]) .vk-credential-form-layout {
  background: #151515;
}

/* Red Hero Header */
.vk-form-hero-header {
  background: var(--vk-brand-gradient, linear-gradient(180deg, #D02724 0%, #C12320 45%, #B8201E 100%));
  color: var(--vk-bg-hero-text, #FFFFFF);
  padding-top: var(--vk-safe-top, calc(env(safe-area-inset-top, 0px) + 12px));
  padding-bottom: 28px;
  position: relative;
  z-index: 1;
  flex-shrink: 0;
}

:global(.dark) .vk-form-hero-header,
:global(.ion-palette-dark) .vk-form-hero-header,
:global(body.dark-theme) .vk-form-hero-header,
:global([data-theme="dark"]) .vk-form-hero-header {
  background: #0D0D0D;
}

.vk-form-top-nav {
  margin-bottom: 12px;
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
}

:global(.dark) .vk-hero-circle-btn,
:global(.ion-palette-dark) .vk-hero-circle-btn,
:global(body.dark-theme) .vk-hero-circle-btn,
:global([data-theme="dark"]) .vk-hero-circle-btn {
  background: #202020;
  color: #F5F5F5;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.vk-form-hero-body {
  display: flex;
  flex-direction: column;
}

/* Main Form Sheet */
.vk-sheet {
  flex: 1;
  width: 100%;
  min-height: auto;
  border-radius: 26px 26px 0 0;
  margin-top: -12px;
  position: relative;
  z-index: 2;
  box-sizing: border-box;
}

.vk-new-credential-sheet,
.vk-edit-credential-sheet {
  padding-bottom: calc(28px + env(safe-area-inset-bottom, 0px));
}

/* Specific Top Breathing Room for New Login */
.vk-new-credential-sheet > .vk-container {
  padding-top: 24px;
}

/* Specific Top Breathing Room for Edit Login */
.vk-edit-credential-sheet > .vk-container {
  padding-top: 24px;
}

.vk-form-group-section {
  margin-bottom: 24px;
}

.vk-form-section-label {
  display: block;
  font-size: 0.8rem;
  font-weight: 800;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 14px;
}

:global(.dark) .vk-form-section-label,
:global(.ion-palette-dark) .vk-form-section-label,
:global(body.dark-theme) .vk-form-section-label,
:global([data-theme="dark"]) .vk-form-section-label {
  color: #8E8E8E;
}

.vk-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.vk-btn-generate-inline {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: var(--brand-red-subtle);
  color: var(--brand-red);
  border: none;
  padding: 4px 10px;
  border-radius: var(--radius-pill);
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
}

.font-mono {
  font-family: var(--vk-font-mono);
}

.text-danger {
  color: var(--brand-red);
}

.vk-textarea-wrapper {
  padding: 10px 16px;
  min-height: 80px;
}

.vk-textarea {
  resize: vertical;
}

.vk-toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 4px;
}

.vk-toggle-label {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-primary);
}

.vk-toggle-sub {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.vk-form-submit-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 16px;
  margin-bottom: 0;
}
</style>
