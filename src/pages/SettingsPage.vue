<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <!-- HERO HEADER -->
      <div class="vk-hero-backdrop">
        <div class="vk-container">
          <h1 class="vk-hero-title">Settings</h1>
          <p class="vk-hero-subtitle">Control how Vaultify works.</p>
        </div>
      </div>

      <!-- MAIN CONTENT SHEET -->
      <div class="vk-sheet">
        <div class="vk-container">
          <!-- SECTION: LOCAL PROFILE -->
          <div class="vk-settings-profile-card" @click="openEditProfileModal">
            <div class="vk-settings-profile-avatar" :style="{ backgroundColor: profileStore.avatarColor }">
              {{ profileStore.initials }}
            </div>
            <div class="vk-settings-profile-meta">
              <div class="vk-settings-profile-name">{{ profileStore.displayName }}</div>
              <div class="vk-settings-profile-badge">Local Profile</div>
            </div>
            <div class="vk-settings-profile-arrow">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="vk-chevron">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </div>
          </div>

          <!-- SECTION: SECURITY -->
          <SettingsSection title="Security">
            <SettingsRow
              label="Change Master Password"
              sublabel="Re-encrypt vault with a new key"
              :clickable="true"
              @click="showChangePasswordModal = true"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="vk-chevron">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </SettingsRow>

            <SettingsRow
              label="Change Vault PIN"
              sublabel="Update your 6-digit quick unlock PIN"
              :clickable="true"
              @click="openChangePinModal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="vk-chevron">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </SettingsRow>

            <SettingsRow
              v-if="isBiometricAvailable"
              :label="biometricLabel"
              :sublabel="`Use ${biometricTypeLabel} to quickly unlock vault`"
            >
              <VaultToggle
                :model-value="settingsStore.settings.biometricsEnabled"
                @change="handleBiometricToggleChange"
              />
            </SettingsRow>

            <SettingsRow label="Auto-Lock Vault" sublabel="Lock when inactive">
              <VaultSelect
                :model-value="settingsStore.settings.autoLockTimeout"
                :options="autoLockOptions"
                title="Auto-Lock Vault"
                @change="updateAutoLock"
              />
            </SettingsRow>

            <SettingsRow label="Lock on Background" sublabel="Lock when switching apps or tabs">
              <VaultToggle
                :model-value="settingsStore.settings.lockOnBackground"
                @change="(val) => settingsStore.updateSettings({ lockOnBackground: val })"
              />
            </SettingsRow>

            <SettingsRow label="Clear Clipboard" sublabel="Erase copied credentials">
              <VaultSelect
                :model-value="settingsStore.settings.clipboardTimeout"
                :options="clipboardOptions"
                title="Clear Clipboard"
                @change="updateClipboard"
              />
            </SettingsRow>
          </SettingsSection>

          <!-- SECTION: APPEARANCE -->
          <SettingsSection title="Appearance">
            <SettingsRow label="Theme" sublabel="Interface appearance">
              <VaultSelect
                :model-value="settingsStore.settings.theme"
                :options="themeOptions"
                title="Theme"
                @change="(val) => settingsStore.updateSettings({ theme: val as ThemeMode })"
              />
            </SettingsRow>
          </SettingsSection>

          <!-- SECTION: VAULT & BACKUP -->
          <SettingsSection title="Vault & Backup">
            <SettingsRow
              label="Export Vaultify Backup"
              sublabel="Encrypted portable profile and credentials"
              :clickable="true"
              @click="openExportModal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="vk-chevron">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </SettingsRow>

            <SettingsRow
              label="Import Vaultify Backup"
              sublabel="Restore profile, credentials, and settings"
              :clickable="true"
              @click="triggerFileInput"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="vk-chevron">
                <path d="m9 18 6-6-6-6"/>
              </svg>
              <input
                type="file"
                ref="fileInputRef"
                accept=".json,application/json"
                style="display: none"
                @change="handleFileSelected"
              />
            </SettingsRow>
          </SettingsSection>

          <!-- SECTION: ABOUT -->
          <SettingsSection title="About">
            <SettingsRow
              label="About Vaultify"
              sublabel="Version, architecture, and offline design"
              :clickable="true"
              @click="router.push('/settings/about')"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="vk-chevron">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </SettingsRow>

            <SettingsRow
              label="Privacy"
              sublabel="Zero-knowledge principles & local encryption"
              :clickable="true"
              @click="router.push('/settings/privacy')"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="vk-chevron">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </SettingsRow>

            <SettingsRow
              label="Terms of Use"
              sublabel="Master Password & backup responsibility"
              :clickable="true"
              @click="router.push('/settings/terms')"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="vk-chevron">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </SettingsRow>
          </SettingsSection>

          <!-- SECTION: DANGER ZONE -->
          <SettingsSection title="Danger Zone" :danger="true">
            <SettingsRow
              label="Delete All Vaultify Data"
              sublabel="Permanently erase vault and reset"
              :clickable="true"
              :danger="true"
              @click="showWipeConfirm = true"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--brand-red)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="vk-chevron">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </SettingsRow>
          </SettingsSection>

          <!-- SETTINGS FOOTER -->
          <div class="vk-settings-footer">
            <div class="vk-version-badge">Vaultify v{{ APP_VERSION }}</div>
            <p class="vk-version-desc">Private. Local. Encrypted.</p>
          </div>
        </div>
      </div>

      <!-- Export Backup Re-auth Modal -->
      <ion-modal :is-open="showExportModal" @didDismiss="showExportModal = false" class="vk-fullscreen-modal">
        <VaultifyHeroSheetLayout
          title="Export Backup"
          subtitle="Create an encrypted Vaultify backup."
          :show-close="true"
          hero-size="compact"
          @close="showExportModal = false"
        >
          <div class="vk-export-sheet-content">
            <div class="vk-export-summary-box">
              <h4 class="vk-export-box-title">Create an encrypted backup containing:</h4>
              <ul class="vk-export-includes">
                <li><span class="vk-check-icon">✓</span> Local profile</li>
                <li><span class="vk-check-icon">✓</span> Saved credentials</li>
                <li><span class="vk-check-icon">✓</span> Categories</li>
                <li><span class="vk-check-icon">✓</span> Portable preferences</li>
              </ul>
              <div class="vk-export-divider"></div>
              <h5 class="vk-export-not-included-title">Not included:</h5>
              <ul class="vk-export-excludes">
                <li>• Quick-unlock PIN</li>
                <li>• Device biometric credentials</li>
              </ul>
            </div>

            <p class="vk-modal-desc vk-export-security-note">
              Your backup remains encrypted and requires your Master Password to restore.
            </p>

            <form @submit.prevent="handleConfirmExport" class="vk-modal-form">
              <div class="vk-input-group">
                <label class="vk-label">Confirm Master Password</label>
                <div class="vk-input-wrapper">
                  <input
                    type="password"
                    v-model="exportPasswordInput"
                    placeholder="Enter Master Password..."
                    class="vk-input"
                    required
                    autofocus
                  />
                </div>
              </div>

              <div class="vk-modal-form-actions">
                <button
                  type="submit"
                  class="vk-btn vk-btn-primary vk-btn-block"
                  :disabled="isExporting || !exportPasswordInput"
                >
                  {{ isExporting ? 'Encrypting & Exporting...' : 'Export Backup' }}
                </button>
              </div>
            </form>
          </div>
        </VaultifyHeroSheetLayout>
      </ion-modal>

      <!-- Import Modal -->
      <ion-modal :is-open="showImportModal" @didDismiss="showImportModal = false">
        <div class="vk-modal-page">
          <AppHeader title="Import Vaultify Backup" :show-back="false">
            <template #actions>
              <button type="button" class="vk-btn-icon-only" @click="showImportModal = false">✕</button>
            </template>
          </AppHeader>

          <div class="vk-container ion-padding">
            <!-- Stage 1: Enter Password -->
            <div v-if="!importDecryptedBundle">
              <div class="vk-import-meta-box" v-if="pendingEnvelopeMeta">
                <div class="vk-import-meta-label">Vaultify Backup</div>
                <div class="vk-import-meta-row" v-if="pendingEnvelopeMeta.exportedAt">
                  <span>Created:</span>
                  <strong>{{ formatDate(pendingEnvelopeMeta.exportedAt) }}</strong>
                </div>
                <div class="vk-import-meta-row" v-if="pendingEnvelopeMeta.appVersion">
                  <span>App Version:</span>
                  <strong>{{ pendingEnvelopeMeta.appVersion }}</strong>
                </div>
              </div>

              <p class="vk-modal-desc">
                Enter the Master Password for this backup to restore its contents.
              </p>

              <form @submit.prevent="handleDecryptImport">
                <div class="vk-input-group">
                  <label class="vk-label">Master Password</label>
                  <div class="vk-input-wrapper">
                    <input
                      type="password"
                      v-model="importPassword"
                      placeholder="Enter Master Password..."
                      class="vk-input"
                      required
                      autofocus
                    />
                  </div>
                </div>

                <div class="vk-modal-form-actions">
                  <button
                    type="submit"
                    class="vk-btn vk-btn-primary vk-btn-block"
                    :disabled="isImporting || !importPassword"
                  >
                    {{ isImporting ? 'Decrypting...' : 'Validate Backup' }}
                  </button>
                </div>
              </form>
            </div>

            <!-- Stage 2: Restore Summary Preview -->
            <div v-else class="vk-import-summary-view">
              <h3 class="vk-restore-title">Restore Summary</h3>

              <div class="vk-summary-card">
                <div class="vk-summary-row">
                  <span class="vk-summary-label">Profile:</span>
                  <span class="vk-summary-value">{{ importDecryptedBundle.profile.displayName }}</span>
                </div>
                <div class="vk-summary-row">
                  <span class="vk-summary-label">Credentials:</span>
                  <span class="vk-summary-value">{{ importDecryptedBundle.vault.credentials.length }}</span>
                </div>
                <div class="vk-summary-row">
                  <span class="vk-summary-label">Categories:</span>
                  <span class="vk-summary-value">{{ getCategoryCount(importDecryptedBundle.vault.credentials) }}</span>
                </div>
                <div class="vk-summary-row">
                  <span class="vk-summary-label">Preferences:</span>
                  <span class="vk-summary-value">Included</span>
                </div>
              </div>

              <p class="vk-import-note">
                Restoring this backup will replace current local vault items and profile data. You will need to reconfigure your quick unlock PIN and biometrics for this device.
              </p>

              <div class="vk-modal-form-actions">
                <button
                  type="button"
                  class="vk-btn vk-btn-primary vk-btn-block"
                  @click="handleApplyImport"
                >
                  Restore Vault
                </button>
              </div>
            </div>
          </div>
        </div>
      </ion-modal>

      <!-- Enable Biometrics Modal -->
      <ion-modal :is-open="showEnableBioModal" @didDismiss="showEnableBioModal = false">
        <div class="vk-modal-page">
          <AppHeader title="Enable Biometric Unlock" :show-back="false">
            <template #actions>
              <button type="button" class="vk-btn-icon-only" @click="showEnableBioModal = false">✕</button>
            </template>
          </AppHeader>

          <div class="vk-container ion-padding">
            <p class="vk-modal-desc">
              Use {{ biometricTypeLabel }} to unlock Vaultify without entering your Master Password or PIN each time.
              For your security, confirm your Master Password to enable this.
            </p>

            <form @submit.prevent="handleConfirmEnableBiometrics">
              <div class="vk-input-group">
                <label class="vk-label">Confirm Master Password</label>
                <div class="vk-input-wrapper">
                  <input
                    type="password"
                    v-model="bioMasterPasswordInput"
                    placeholder="Enter Master Password..."
                    class="vk-input"
                    required
                    autofocus
                  />
                </div>
              </div>

              <div class="vk-modal-form-actions">
                <button
                  type="submit"
                  class="vk-btn vk-btn-primary vk-btn-block"
                  :disabled="isEnablingBio || !bioMasterPasswordInput"
                >
                  {{ isEnablingBio ? 'Verifying & Enabling...' : 'Enable Biometrics' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </ion-modal>

      <!-- Change Vault PIN Modal -->
      <ion-modal :is-open="showChangePinModal" @didDismiss="closeChangePinModal" class="vk-fullscreen-modal">
        <!-- Step 1: Confirm Master Password -->
        <VaultifyHeroSheetLayout
          v-if="changePinStep === 1"
          title="Change Vault PIN"
          subtitle="Confirm your Master Password to continue."
          :show-close="true"
          hero-size="compact"
          @close="closeChangePinModal"
        >
          <div class="vk-modal-form-wrap">
            <p class="vk-modal-desc">
              For your security, confirm your Master Password before changing your 6-digit PIN.
            </p>
            <form @submit.prevent="handleConfirmChangePinAuth" class="vk-modal-form">
              <div class="vk-input-group">
                <label class="vk-label">Master Password</label>
                <div class="vk-input-wrapper">
                  <input
                    type="password"
                    v-model="changePinMasterPassword"
                    placeholder="Master Password..."
                    class="vk-input"
                    required
                    autofocus
                  />
                </div>
              </div>
              <div class="vk-modal-form-actions">
                <button
                  type="submit"
                  class="vk-btn vk-btn-primary vk-btn-block"
                  :disabled="isVerifyingMasterPass || !changePinMasterPassword"
                >
                  {{ isVerifyingMasterPass ? 'Verifying...' : 'Continue' }}
                </button>
              </div>
            </form>
          </div>
        </VaultifyHeroSheetLayout>

        <!-- Step 2: Enter New PIN -->
        <VaultifyHeroSheetLayout
          v-else-if="changePinStep === 2"
          title="Enter new PIN"
          subtitle="Use six digits for quick everyday access."
          :show-close="true"
          hero-size="pin"
          @close="closeChangePinModal"
        >
          <template #hero-bottom>
            <div class="vk-pin-hero-slot">
              <PinDots :filled-count="newPinInput.length" :has-error="hasNewPinError" />
              <div class="vk-pin-status-slot">
                <span v-if="newPinErrorText" class="vk-pin-error-text">{{ newPinErrorText }}</span>
              </div>
            </div>
          </template>

          <div class="vk-pin-keypad-container">
            <PinKeypad @digit="handleNewPinDigit" @backspace="handleNewPinBackspace" />
          </div>
        </VaultifyHeroSheetLayout>

        <!-- Step 3: Confirm New PIN -->
        <VaultifyHeroSheetLayout
          v-else-if="changePinStep === 3"
          title="Confirm new PIN"
          subtitle="Enter your six digits again to make sure."
          :show-close="true"
          hero-size="pin"
          @close="closeChangePinModal"
        >
          <template #hero-bottom>
            <div class="vk-pin-hero-slot">
              <PinDots :filled-count="confirmNewPinInput.length" :has-error="hasConfirmNewPinError" />
              <div class="vk-pin-status-slot">
                <span v-if="confirmNewPinErrorText" class="vk-pin-error-text">{{ confirmNewPinErrorText }}</span>
              </div>
            </div>
          </template>

          <div class="vk-pin-keypad-container">
            <PinKeypad @digit="handleConfirmNewPinDigit" @backspace="handleConfirmNewPinBackspace" />
          </div>
        </VaultifyHeroSheetLayout>
      </ion-modal>

      <!-- Change Master Password Modal -->
      <ion-modal :is-open="showChangePasswordModal" @didDismiss="showChangePasswordModal = false" class="vk-fullscreen-modal">
        <VaultifyHeroSheetLayout
          title="Change Password"
          subtitle="Update your Master Password securely."
          :show-close="true"
          hero-size="compact"
          @close="showChangePasswordModal = false"
        >
          <div class="vk-modal-form-wrap">
            <p class="vk-modal-desc">
              Your Master Password protects your encrypted vault. Make sure it is memorable and secure.
            </p>

            <form @submit.prevent="handleChangePassword" class="vk-modal-form">
              <div class="vk-input-group">
                <label class="vk-label">Current Master Password</label>
                <div class="vk-input-wrapper">
                  <input
                    type="password"
                    v-model="currentPasswordInput"
                    placeholder="Current password..."
                    class="vk-input"
                    required
                  />
                </div>
              </div>

              <div class="vk-input-group">
                <label class="vk-label">New Master Password</label>
                <div class="vk-input-wrapper">
                  <input
                    type="password"
                    v-model="newPasswordInput"
                    placeholder="New Master Password..."
                    class="vk-input"
                    required
                  />
                </div>
                <PasswordStrengthMeter :password="newPasswordInput" />
              </div>

              <div class="vk-input-group">
                <label class="vk-label">Confirm New Password</label>
                <div class="vk-input-wrapper">
                  <input
                    type="password"
                    v-model="confirmNewPasswordInput"
                    placeholder="Confirm new password..."
                    class="vk-input"
                    required
                  />
                </div>
              </div>

              <div class="vk-modal-form-actions">
                <button
                  type="submit"
                  class="vk-btn vk-btn-primary vk-btn-block"
                  :disabled="isChangingPassword"
                >
                  {{ isChangingPassword ? 'Re-encrypting...' : 'Update Master Password' }}
                </button>
              </div>
            </form>
          </div>
        </VaultifyHeroSheetLayout>
      </ion-modal>

      <!-- Wipe Confirmation Modal -->
      <ion-modal :is-open="showWipeConfirm" @didDismiss="showWipeConfirm = false" class="vk-modal">
        <div class="vk-modal-content">
          <div class="vk-modal-icon-brand">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--brand-red)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
            </svg>
          </div>
          <h3 class="vk-modal-title">Delete All Vaultify Data?</h3>
          <p class="vk-modal-desc">
            This will remove from this device:
          </p>
          <ul class="vk-wipe-list">
            <li>• Local Profile</li>
            <li>• Encrypted credentials & categories</li>
            <li>• PIN configuration</li>
            <li>• Biometric quick-unlock configuration</li>
            <li>• Vaultify preferences</li>
          </ul>
          <p class="vk-wipe-note">
            Previously exported backups stored elsewhere will not be deleted.
          </p>
          <div class="vk-modal-actions">
            <button type="button" class="vk-btn vk-btn-secondary" @click="showWipeConfirm = false">Cancel</button>
            <button type="button" class="vk-btn vk-btn-danger" @click="handleWipeVault">Permanently Delete</button>
          </div>
        </div>
      </ion-modal>

      <!-- Edit Profile Modal -->
      <ion-modal :is-open="showEditProfileModal" @didDismiss="showEditProfileModal = false">
        <div class="vk-modal-page">
          <AppHeader title="Local Profile" :show-back="false">
            <template #actions>
              <button type="button" class="vk-btn-icon-only" @click="showEditProfileModal = false">✕</button>
            </template>
          </AppHeader>

          <div class="vk-container ion-padding">
            <p class="vk-modal-desc">
              Your profile stays strictly on this device and is used for personalized greetings.
            </p>

            <form @submit.prevent="handleSaveProfile">
              <div class="vk-input-group">
                <label class="vk-label">Display Name</label>
                <div class="vk-input-wrapper">
                  <input
                    type="text"
                    v-model="editDisplayName"
                    placeholder="John"
                    maxlength="30"
                    class="vk-input"
                    required
                  />
                </div>
                <p class="vk-field-hint">2–30 characters</p>
              </div>

              <!-- Profile Appearance / Avatar Palette -->
              <div class="vk-avatar-picker-section">
                <label class="vk-label">Profile Look</label>
                <div class="vk-palette-row">
                  <button
                    v-for="item in AVATAR_PALETTES"
                    :key="item.id"
                    type="button"
                    class="vk-palette-btn"
                    :class="{ 'is-selected': editAvatarColor === item.color }"
                    :style="{ backgroundColor: item.color }"
                    @click="editAvatarColor = item.color"
                    :title="item.label"
                  >
                    <span class="vk-palette-initials">{{ editInitials }}</span>
                    <div v-if="editAvatarColor === item.color" class="vk-palette-check">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </div>
                  </button>
                </div>
              </div>

              <!-- Live Preview Card -->
              <div class="vk-profile-preview-card">
                <div class="vk-preview-avatar" :style="{ backgroundColor: editAvatarColor }">
                  {{ editInitials }}
                </div>
                <div class="vk-preview-info">
                  <div class="vk-preview-name">{{ editDisplayName.trim() || 'John' }}</div>
                  <div class="vk-preview-tag">Local Profile</div>
                </div>
              </div>

              <div class="vk-modal-form-actions">
                <button
                  type="submit"
                  class="vk-btn vk-btn-primary vk-btn-block"
                  :disabled="editDisplayName.trim().length < 2"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { IonPage, IonContent, IonModal } from '@ionic/vue';
import { useAuthStore } from '@/stores/auth.store';
import { useVaultStore } from '@/stores/vault.store';
import { useSettingsStore } from '@/stores/settings.store';
import { useProfileStore } from '@/stores/profile.store';
import { useToast } from '@/composables/useToast';
import { ExportService, PortableBackupBundle } from '@/services/export.service';
import { BiometricService, BiometricAvailability } from '@/services/biometric.service';
import { PinService } from '@/services/pin.service';
import { StorageService } from '@/services/storage.service';
import { CryptoService } from '@/services/crypto.service';
import { AVATAR_PALETTES, generateInitials } from '@/models/profile.model';
import { AutoLockTimeout, ClipboardTimeout, ThemeMode } from '@/models/settings.model';
import { APP_VERSION } from '@/constants/app';
import AppHeader from '@/components/common/AppHeader.vue';
import PasswordStrengthMeter from '@/components/common/PasswordStrengthMeter.vue';
import VaultSelect, { SelectOption } from '@/components/common/VaultSelect.vue';
import VaultToggle from '@/components/common/VaultToggle.vue';
import SettingsRow from '@/components/common/SettingsRow.vue';
import SettingsSection from '@/components/common/SettingsSection.vue';
import PinDots from '@/components/security/PinDots.vue';
import PinKeypad from '@/components/security/PinKeypad.vue';
import VaultifyHeroSheetLayout from '@/components/layout/VaultifyHeroSheetLayout.vue';

const router = useRouter();
const authStore = useAuthStore();
const vaultStore = useVaultStore();
const settingsStore = useSettingsStore();
const profileStore = useProfileStore();
const { showToast } = useToast();

const showEditProfileModal = ref(false);
const editDisplayName = ref('');
const editAvatarColor = ref('#B82825');

const editInitials = computed(() => {
  return generateInitials(editDisplayName.value || 'John');
});

function openEditProfileModal() {
  editDisplayName.value = profileStore.displayName;
  editAvatarColor.value = profileStore.avatarColor;
  showEditProfileModal.value = true;
}

async function handleSaveProfile() {
  const name = editDisplayName.value.trim();
  if (name.length < 2) return;

  await profileStore.updateProfile({
    displayName: name,
    avatarColor: editAvatarColor.value,
  });

  showEditProfileModal.value = false;
  showToast('Profile updated', 'success');
}

const isBiometricAvailable = ref(false);
const biometricAvailability = ref<BiometricAvailability>({ available: false, type: 'none', label: 'Biometrics' });
const biometricLabel = computed(() => `${biometricAvailability.value.label} Unlock`);
const biometricTypeLabel = computed(() => biometricAvailability.value.label);

const showEnableBioModal = ref(false);
const bioMasterPasswordInput = ref('');
const isEnablingBio = ref(false);

// Export Modal States
const showExportModal = ref(false);
const exportPasswordInput = ref('');
const isExporting = ref(false);

// Change PIN Modal States
const showChangePinModal = ref(false);
const changePinStep = ref(1);
const changePinMasterPassword = ref('');
const isVerifyingMasterPass = ref(false);
const newPinInput = ref('');
const hasNewPinError = ref(false);
const newPinErrorText = ref('');
const confirmNewPinInput = ref('');
const hasConfirmNewPinError = ref(false);
const confirmNewPinErrorText = ref('');

const autoLockOptions: SelectOption<AutoLockTimeout>[] = [
  { label: 'Immediately', value: 0 },
  { label: '30 seconds', value: 30 },
  { label: '1 minute', value: 60 },
  { label: '5 minutes', value: 300 },
  { label: '15 minutes', value: 900 },
  { label: 'Never', value: -1 },
];

const clipboardOptions: SelectOption<ClipboardTimeout>[] = [
  { label: '15 seconds', value: 15 },
  { label: '30 seconds', value: 30 },
  { label: '60 seconds', value: 60 },
  { label: 'Never', value: 0 },
];

const themeOptions: SelectOption<ThemeMode>[] = [
  { label: 'System', value: 'system' },
  { label: 'Dark Theme', value: 'dark' },
  { label: 'Light Theme', value: 'light' },
];

const showChangePasswordModal = ref(false);
const currentPasswordInput = ref('');
const newPasswordInput = ref('');
const confirmNewPasswordInput = ref('');
const isChangingPassword = ref(false);

const showImportModal = ref(false);
const pendingEnvelopeRaw = ref<any>(null);
const pendingEnvelopeMeta = ref<{ exportedAt?: string; appVersion?: string } | null>(null);
const importPassword = ref('');
const isImporting = ref(false);
const importDecryptedBundle = ref<PortableBackupBundle | null>(null);

const showWipeConfirm = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);

onMounted(async () => {
  const avail = await BiometricService.checkAvailability();
  biometricAvailability.value = avail;
  isBiometricAvailable.value = avail.available;
});

function openExportModal() {
  exportPasswordInput.value = '';
  showExportModal.value = true;
}

async function handleConfirmExport() {
  if (!exportPasswordInput.value) return;

  isExporting.value = true;
  try {
    const envelope = await StorageService.getEncryptedVault();
    if (!envelope) throw new Error('No local vault found to export.');

    // Verify master password
    const { vaultKeyBase64 } = await CryptoService.decryptVaultAndExtractKey(envelope, exportPasswordInput.value);

    // Create full portable backup package
    const payload = vaultStore.getPayloadSnapshot();
    const activeProfile = profileStore.profile || {
      id: 'profile_default',
      displayName: profileStore.displayName,
      avatarType: 'initials',
      avatarColor: profileStore.avatarColor,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const backupEnvelope = await ExportService.createBackupPackage(
      payload,
      activeProfile,
      settingsStore.settings,
      exportPasswordInput.value,
      vaultKeyBase64
    );

    ExportService.exportBackupFile(backupEnvelope);
    showExportModal.value = false;
    exportPasswordInput.value = '';
    showToast('Vaultify backup exported successfully', 'success');
  } catch {
    showToast('Incorrect Master Password', 'danger');
  } finally {
    isExporting.value = false;
  }
}

function openChangePinModal() {
  changePinStep.value = 1;
  changePinMasterPassword.value = '';
  newPinInput.value = '';
  confirmNewPinInput.value = '';
  hasNewPinError.value = false;
  hasConfirmNewPinError.value = false;
  newPinErrorText.value = '';
  confirmNewPinErrorText.value = '';
  showChangePinModal.value = true;
}

function closeChangePinModal() {
  showChangePinModal.value = false;
  changePinMasterPassword.value = '';
  newPinInput.value = '';
  confirmNewPinInput.value = '';
}

async function handleConfirmChangePinAuth() {
  if (!changePinMasterPassword.value) return;

  isVerifyingMasterPass.value = true;
  try {
    const envelope = await StorageService.getEncryptedVault();
    if (!envelope) throw new Error('No vault found.');

    const { vaultKeyBase64 } = await CryptoService.decryptVaultAndExtractKey(envelope, changePinMasterPassword.value);
    authStore.cachedVaultKey = vaultKeyBase64;
    changePinStep.value = 2; // Move to enter new PIN
  } catch {
    showToast('Current Master Password incorrect', 'danger');
  } finally {
    isVerifyingMasterPass.value = false;
  }
}

function handleNewPinDigit(digit: string) {
  if (newPinInput.value.length < 6) {
    newPinInput.value += digit;
    hasNewPinError.value = false;
    newPinErrorText.value = '';

    if (newPinInput.value.length === 6) {
      const validation = PinService.validatePinStrength(newPinInput.value);
      if (!validation.valid) {
        hasNewPinError.value = true;
        newPinErrorText.value = validation.error || 'This PIN is easy to guess.';
        window.setTimeout(() => {
          newPinInput.value = '';
        }, 400);
        return;
      }

      window.setTimeout(() => {
        confirmNewPinInput.value = '';
        changePinStep.value = 3;
      }, 150);
    }
  }
}

function handleNewPinBackspace() {
  if (newPinInput.value.length > 0) {
    newPinInput.value = newPinInput.value.slice(0, -1);
    hasNewPinError.value = false;
    newPinErrorText.value = '';
  }
}

async function handleConfirmNewPinDigit(digit: string) {
  if (confirmNewPinInput.value.length < 6) {
    confirmNewPinInput.value += digit;
    hasConfirmNewPinError.value = false;
    confirmNewPinErrorText.value = '';

    if (confirmNewPinInput.value.length === 6) {
      if (confirmNewPinInput.value !== newPinInput.value) {
        hasConfirmNewPinError.value = true;
        confirmNewPinErrorText.value = "PINs don't match. Try again.";
        window.setTimeout(() => {
          confirmNewPinInput.value = '';
        }, 400);
        return;
      }

      try {
        const vaultKey = authStore.cachedVaultKey;
        if (!vaultKey) throw new Error('Could not resolve active vault key.');

        await PinService.createPinProtection(confirmNewPinInput.value, vaultKey);
        closeChangePinModal();
        showToast('PIN updated', 'success');
      } catch (err: any) {
        showToast(err.message || 'Failed to update PIN.', 'danger');
      }
    }
  }
}

function handleConfirmNewPinBackspace() {
  if (confirmNewPinInput.value.length > 0) {
    confirmNewPinInput.value = confirmNewPinInput.value.slice(0, -1);
    hasConfirmNewPinError.value = false;
    confirmNewPinErrorText.value = '';
  }
}

async function handleBiometricToggleChange(enabled: boolean) {
  if (enabled) {
    bioMasterPasswordInput.value = '';
    showEnableBioModal.value = true;
  } else {
    await BiometricService.disableBiometricUnlock();
    await settingsStore.updateSettings({ biometricsEnabled: false });
    showToast('Biometric unlock disabled', 'info');
  }
}

async function handleConfirmEnableBiometrics() {
  if (!bioMasterPasswordInput.value) return;

  isEnablingBio.value = true;
  try {
    await BiometricService.enableBiometricUnlock(bioMasterPasswordInput.value);
    await settingsStore.updateSettings({ biometricsEnabled: true });
    showEnableBioModal.value = false;
    bioMasterPasswordInput.value = '';
    showToast('Biometric unlock enabled', 'success');
  } catch (err: any) {
    showToast(err.message || 'Incorrect Master Password', 'danger');
  } finally {
    isEnablingBio.value = false;
  }
}

function updateAutoLock(val: any) {
  settingsStore.updateSettings({ autoLockTimeout: val as AutoLockTimeout });
  showToast('Auto-lock updated', 'primary', 1200);
}

function updateClipboard(val: any) {
  settingsStore.updateSettings({ clipboardTimeout: val as ClipboardTimeout });
  showToast('Clipboard timer updated', 'primary', 1200);
}

async function handleChangePassword() {
  if (newPasswordInput.value !== confirmNewPasswordInput.value) {
    showToast('New passwords do not match', 'danger');
    return;
  }
  if (newPasswordInput.value.length < 6) {
    showToast('New password must be at least 6 characters', 'danger');
    return;
  }

  isChangingPassword.value = true;
  try {
    const payload = vaultStore.getPayloadSnapshot();
    await authStore.changeMasterPassword(currentPasswordInput.value, newPasswordInput.value, payload);
    
    // Invalidate PIN and biometric unlock on master password change
    await PinService.clearPinProtection();
    await BiometricService.disableBiometricUnlock();
    await settingsStore.updateSettings({ biometricsEnabled: false });

    showToast('Master Password updated. Please update your PIN.', 'warning', 4000);

    showChangePasswordModal.value = false;
    currentPasswordInput.value = '';
    newPasswordInput.value = '';
    confirmNewPasswordInput.value = '';
  } catch {
    showToast('Current Master Password incorrect', 'danger');
  } finally {
    isChangingPassword.value = false;
  }
}

function triggerFileInput() {
  fileInputRef.value?.click();
}

function handleFileSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;

  const file = input.files[0];
  const reader = new FileReader();

  reader.onload = (e) => {
    const content = e.target?.result as string;
    const result = ExportService.validateBackupFile(content);

    if (!result.valid || !result.envelope) {
      showToast(result.error || 'Invalid backup file', 'danger');
      return;
    }

    pendingEnvelopeRaw.value = result.envelope;
    pendingEnvelopeMeta.value = {
      exportedAt: result.exportedAt,
      appVersion: result.appVersion,
    };
    importPassword.value = '';
    importDecryptedBundle.value = null;
    showImportModal.value = true;
  };

  reader.readAsText(file);
  input.value = '';
}

async function handleDecryptImport() {
  if (!pendingEnvelopeRaw.value || !importPassword.value) return;

  isImporting.value = true;
  try {
    const result = await ExportService.decryptAndExtractBackup(pendingEnvelopeRaw.value, importPassword.value);
    if (!result.valid || !result.bundle) {
      throw new Error(result.error || 'Unable to decrypt backup.');
    }

    importDecryptedBundle.value = result.bundle;
  } catch (err: any) {
    showToast(err.message || 'Incorrect password for backup', 'danger');
  } finally {
    isImporting.value = false;
  }
}

async function handleApplyImport() {
  if (!importDecryptedBundle.value || !pendingEnvelopeRaw.value || !importPassword.value) return;

  try {
    const bundle = importDecryptedBundle.value;
    
    // 1. Re-encrypt the restored payload and save with the backup's master password
    await authStore.createInitialVault(importPassword.value, bundle.vault);

    // 2. Restore Profile
    await profileStore.updateProfile(bundle.profile);

    // 3. Restore Preferences
    await settingsStore.updateSettings(bundle.preferences);

    // 4. Invalidate old device PIN & biometrics
    await PinService.clearPinProtection();
    await BiometricService.disableBiometricUnlock();
    await settingsStore.updateSettings({ biometricsEnabled: false });

    // 5. Update active memory state
    vaultStore.setDecryptedPayload(bundle.vault);

    showImportModal.value = false;
    showToast(`Restored vault for ${bundle.profile.displayName}! Please set up your PIN.`, 'success', 4000);
    router.replace('/tabs/vault');
  } catch (err: any) {
    showToast(err.message || 'Failed to restore vault.', 'danger');
  }
}

async function handleWipeVault() {
  await authStore.wipeAllData();
  await profileStore.resetProfile();
  vaultStore.clearInMemoryData();
  showWipeConfirm.value = false;
  showToast('All Vaultify data removed', 'medium');
  router.replace('/onboarding');
}

function formatDate(isoString?: string): string {
  if (!isoString) return 'Unknown date';
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return isoString;
  }
}

function getCategoryCount(credentials?: any[]): number {
  if (!credentials || credentials.length === 0) return 0;
  const cats = new Set(credentials.map(c => c.category || 'General'));
  return cats.size;
}
</script>

<style scoped>
/* Local Profile Card */
.vk-settings-profile-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--vk-bg-surface-soft);
  border: 1px solid var(--vk-border);
  border-radius: var(--radius-lg);
  padding: 16px 18px;
  margin-bottom: 24px;
  cursor: pointer;
  transition: transform 0.15s ease, background-color 0.15s ease;
}

.vk-settings-profile-card:active {
  transform: scale(0.985);
}

.vk-settings-profile-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.15rem;
  font-weight: 800;
  color: #FFFFFF;
  flex-shrink: 0;
}

.vk-settings-profile-meta {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.vk-settings-profile-name {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1.2;
}

.vk-settings-profile-badge {
  font-size: 0.775rem;
  font-weight: 600;
  color: var(--brand-red);
  margin-top: 3px;
}

.vk-settings-profile-arrow {
  color: var(--text-muted);
}

/* Avatar Palette Styles */
.vk-avatar-picker-section {
  margin-bottom: 20px;
}

.vk-palette-row {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.vk-palette-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 3px solid transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  transition: transform 0.15s ease;
}

.vk-palette-btn.is-selected {
  border-color: var(--text-primary);
  transform: scale(1.08);
}

.vk-palette-initials {
  font-size: 0.9rem;
  font-weight: 800;
  color: #FFFFFF;
}

.vk-palette-check {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #000000;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid #FFFFFF;
}

.vk-profile-preview-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: var(--vk-bg-surface-soft);
  border: 1px solid var(--vk-border);
  border-radius: var(--radius-md);
  padding: 12px 16px;
  margin-bottom: 24px;
}

.vk-preview-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 800;
  color: #FFFFFF;
  flex-shrink: 0;
}

.vk-preview-info {
  display: flex;
  flex-direction: column;
}

.vk-preview-name {
  font-size: 1rem;
  font-weight: 800;
  color: var(--text-primary);
}

.vk-preview-tag {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--brand-red);
}

.vk-field-hint {
  font-size: 0.775rem;
  color: var(--text-muted);
  margin-top: 4px;
}

.vk-chevron {
  color: var(--text-muted);
}

.vk-settings-footer {
  text-align: center;
  padding: 32px 16px 16px 16px;
}

.vk-version-badge {
  display: inline-block;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-secondary);
  background: var(--vk-bg-surface-soft);
  padding: 5px 14px;
  border-radius: var(--radius-pill);
  margin-bottom: 8px;
  letter-spacing: -0.01em;
}

.vk-version-desc {
  font-size: 0.775rem;
  color: var(--text-muted);
  margin: 0;
}

.vk-modal-page {
  height: 100%;
  background: var(--vk-bg-sheet);
  overflow-y: auto;
}

.vk-modal-desc {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 20px;
  line-height: 1.5;
}

.vk-modal-step-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--text-primary);
  text-align: center;
  margin: 4px 0 16px 0;
}

.vk-pin-step-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 10px;
  padding-bottom: 24px;
}

.vk-pin-status-slot {
  min-height: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 6px 0 16px 0;
}

.vk-pin-error-text {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--brand-red);
  text-align: center;
  line-height: 1.2;
}

.vk-modal-form-actions {
  margin-top: 24px;
}

.vk-modal-icon-brand {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--brand-red-subtle);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px auto;
}

.vk-modal-title {
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 6px 0;
}

.vk-modal-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.vk-modal-actions button {
  flex: 1;
}

/* Fullscreen Hero Modals */
ion-modal.vk-fullscreen-modal {
  --height: 100%;
  --width: 100%;
  --border-radius: 0;
  --background: transparent;
  --box-shadow: none;
}

.vk-modal-form-wrap {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.vk-modal-form {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.vk-export-sheet-content {
  width: 100%;
  display: flex;
  flex-direction: column;
}

/* Export Summary Styles */
.vk-export-summary-box {
  background: #F1EFEC;
  border: 1px solid rgba(0, 0, 0, 0.04);
  border-radius: 20px;
  padding: 18px 20px;
  margin-bottom: 16px;
}

.dark .vk-export-summary-box {
  background: #1E1E1E;
  border-color: rgba(255, 255, 255, 0.06);
}

.vk-export-box-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 12px 0;
}

.vk-export-includes,
.vk-export-excludes {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 0.825rem;
  color: var(--text-secondary);
}

.vk-export-includes li,
.vk-export-excludes li {
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.vk-check-icon {
  color: #10B981;
  font-weight: 800;
}

.vk-export-divider {
  height: 1px;
  background: var(--vk-divider);
  margin: 12px 0;
}

.vk-export-not-included-title {
  font-size: 0.725rem;
  font-weight: 700;
  color: var(--text-muted);
  margin: 0 0 6px 0;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.vk-export-security-note {
  font-size: 0.8125rem;
  color: var(--text-muted);
  margin-bottom: 20px;
}

/* Import Meta & Summary */
.vk-import-meta-box {
  background: var(--vk-bg-surface-soft);
  border: 1px solid var(--vk-border);
  border-radius: var(--radius-md);
  padding: 14px 16px;
  margin-bottom: 16px;
}

.vk-import-meta-label {
  font-size: 0.75rem;
  font-weight: 800;
  color: var(--brand-red);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.vk-import-meta-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.vk-import-meta-row strong {
  color: var(--text-primary);
}

.vk-restore-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 16px 0;
}

.vk-summary-card {
  background: var(--vk-bg-surface-soft);
  border: 1px solid var(--vk-border);
  border-radius: var(--radius-md);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
}

.vk-summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
}

.vk-summary-label {
  color: var(--text-secondary);
}

.vk-summary-value {
  font-weight: 700;
  color: var(--text-primary);
}

.vk-import-note {
  font-size: 0.825rem;
  color: var(--text-muted);
  line-height: 1.4;
  margin: 0;
}

.vk-wipe-list {
  list-style: none;
  padding: 0;
  margin: 10px 0;
  font-size: 0.85rem;
  color: var(--text-secondary);
  text-align: left;
}

.vk-wipe-list li {
  margin-bottom: 4px;
}

.vk-wipe-note {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-top: 10px;
  font-style: italic;
  line-height: 1.4;
}
</style>
