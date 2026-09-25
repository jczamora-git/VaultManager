<template>
  <ion-page>
    <ion-content :fullscreen="true" :scroll-y="false" class="vk-setup-page vaultify-onboarding">
      <!-- Top Progress Indicator (Active numbered steps) -->
      <div v-if="typeof step === 'number' && step > 1 && step < 8" class="vk-onboarding-progress-bar">
        <div class="vk-progress-track">
          <div
            class="vk-progress-fill"
            :style="{ width: `${((step - 1) / 7) * 100}%` }"
          ></div>
        </div>
      </div>

      <transition name="vk-slide-fade" mode="out-in">
        <!-- ========================================== -->
        <!-- STEP 1: WELCOME HERO (Preserved Exactly)   -->
        <!-- ========================================== -->
        <div v-if="step === 1" key="step1" class="vk-onboarding-fullscreen vk-hero-backdrop">
          <div class="vk-container vk-onboarding-container">
            <div class="vk-onboarding-top">
              <div class="vk-brand-tag">
                <VaultifyLogo variant="alt" :size="32" class="vk-hero-logo" />
                <span>Vaultify</span>
              </div>
            </div>

            <div class="vk-onboarding-hero">
              <h1 class="vk-onboarding-headline">
                Your passwords.<br/>
                Your device.<br/>
                <span class="vk-headline-accent">Your vault.</span>
              </h1>
              <p class="vk-onboarding-body">
                Keep your credentials encrypted and available only to you. Everything stays on this device.
              </p>
            </div>

            <div class="vk-onboarding-footer">
              <button type="button" class="vk-btn vk-btn-white vk-btn-block" @click="goToStep('choice')">
                <span>Get Started</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </button>

              <div class="vk-onboarding-disclaimer">
                <span>No account required.</span>
                <span>•</span>
                <span>No cloud required.</span>
              </div>
            </div>
          </div>
        </div>

        <!-- ========================================== -->
        <!-- STEP CHOICE: CREATE OR IMPORT              -->
        <!-- ========================================== -->
        <OnboardingLayout
          v-else-if="step === 'choice'"
          key="stepChoice"
          title="Let's get started."
          subtitle="Choose how you want to set up Vaultify."
          step="Setup"
          hero-size="large"
          content-position="center"
          @back="goToStep(1)"
        >
          <div class="vk-choice-cluster">
            <button type="button" class="vk-choice-card" @click="goToStep(2)">
              <div class="vk-choice-icon-wrap">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--brand-red)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
                </svg>
              </div>
              <div class="vk-choice-text">
                <div class="vk-choice-title">Create New Vault</div>
                <div class="vk-choice-desc">Set up a new local profile & Master Password</div>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="vk-choice-chevron">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </button>

            <button type="button" class="vk-choice-card" @click="triggerOnboardingImport">
              <div class="vk-choice-icon-wrap">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--brand-red)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              </div>
              <div class="vk-choice-text">
                <div class="vk-choice-title">Import Existing Vault</div>
                <div class="vk-choice-desc">Restore an encrypted backup from a file</div>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="vk-choice-chevron">
                <path d="m9 18 6-6-6-6"/>
              </svg>
              <input
                type="file"
                ref="onboardingFileInputRef"
                accept=".json,application/json"
                style="display: none"
                @change="handleOnboardingFileSelected"
              />
            </button>

            <p class="vk-choice-footer-desc">
              Create a new local Vaultify profile or restore an encrypted Vaultify backup.
            </p>
          </div>
        </OnboardingLayout>

        <!-- ========================================== -->
        <!-- STEP IMPORT AUTH: ENTER BACKUP PASSWORD    -->
        <!-- ========================================== -->
        <OnboardingLayout
          v-else-if="step === 'import_auth'"
          key="stepImportAuth"
          title="Validate backup"
          subtitle="Enter the Master Password for this backup."
          step="Import"
          hero-size="medium"
          content-position="center"
          @back="goToStep('choice')"
        >
          <div class="vk-import-auth-cluster">
            <div class="vk-import-meta-box" v-if="importMeta">
              <div class="vk-import-meta-label">Vaultify Backup</div>
              <div class="vk-import-meta-row" v-if="importMeta.exportedAt">
                <span>Created:</span>
                <strong>{{ formatDate(importMeta.exportedAt) }}</strong>
              </div>
              <div class="vk-import-meta-row" v-if="importMeta.appVersion">
                <span>App Version:</span>
                <strong>{{ importMeta.appVersion }}</strong>
              </div>
            </div>

            <form @submit.prevent="handleOnboardingDecryptImport" class="vk-setup-form">
              <div class="vk-input-group">
                <label class="vk-label">Master Password</label>
                <div class="vk-input-wrapper" :class="{ 'is-invalid': importMasterPassword && isImportDecrypting }">
                  <input
                    type="password"
                    v-model="importMasterPassword"
                    placeholder="Enter Master Password..."
                    class="vk-input"
                    autofocus
                    required
                  />
                </div>
              </div>

              <div class="vk-setup-actions">
                <button
                  type="submit"
                  class="vk-btn vk-btn-primary vk-btn-block"
                  :disabled="isImportDecrypting || !importMasterPassword"
                >
                  <span v-if="!isImportDecrypting">Validate & Decrypt</span>
                  <span v-else>Decrypting Backup...</span>
                </button>
              </div>
            </form>
          </div>
        </OnboardingLayout>

        <!-- ========================================== -->
        <!-- STEP IMPORT SUMMARY: REVIEW & RESTORE      -->
        <!-- ========================================== -->
        <OnboardingLayout
          v-else-if="step === 'import_summary'"
          key="stepImportSummary"
          title="Restore Summary"
          subtitle="Review details before importing to this device."
          step="Import"
          hero-size="medium"
          content-position="center"
          @back="goToStep('import_auth')"
        >
          <div class="vk-import-summary-cluster" v-if="importedBundle">
            <div class="vk-summary-card">
              <div class="vk-summary-row">
                <span class="vk-summary-label">Profile:</span>
                <span class="vk-summary-value">{{ importedBundle.profile.displayName }}</span>
              </div>
              <div class="vk-summary-row">
                <span class="vk-summary-label">Credentials:</span>
                <span class="vk-summary-value">{{ importedBundle.vault.credentials.length }}</span>
              </div>
              <div class="vk-summary-row">
                <span class="vk-summary-label">Categories:</span>
                <span class="vk-summary-value">{{ getCategoryCount(importedBundle.vault.credentials) }}</span>
              </div>
              <div class="vk-summary-row">
                <span class="vk-summary-label">Preferences:</span>
                <span class="vk-summary-value">Included</span>
              </div>
            </div>

            <p class="vk-field-hint" style="margin-bottom: 20px;">
              Your profile and credentials will be imported. Next, you'll set a new quick-unlock PIN for this device.
            </p>

            <div class="vk-setup-actions">
              <button
                type="button"
                class="vk-btn vk-btn-primary vk-btn-block"
                @click="handleApplyImportOnboarding"
              >
                <span>Restore Vault</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </button>
            </div>
          </div>
        </OnboardingLayout>

        <!-- ========================================== -->
        <!-- STEP 2: CREATE LOCAL PROFILE               -->
        <!-- ========================================== -->
        <OnboardingLayout
          v-else-if="step === 2"
          key="step2"
          title="Let's make it yours."
          subtitle="Create a local profile for your Vaultify experience."
          step="Step 1 of 6"
          hero-size="large"
          content-position="center"
          @back="goToStep('choice')"
        >
          <form @submit.prevent="handleProfileContinue" class="vk-setup-form">
            <!-- Display Name Input -->
            <div class="vk-input-group">
              <label class="vk-label" for="displayNameInput">Display Name</label>
              <div class="vk-input-wrapper" :class="{ 'is-invalid': profileError }">
                <input
                  id="displayNameInput"
                  type="text"
                  v-model="displayNameInput"
                  placeholder="John"
                  maxlength="30"
                  class="vk-input"
                  autofocus
                  required
                />
              </div>
              <div v-if="profileError" class="vk-error-text">{{ profileError }}</div>
              <p class="vk-field-hint">This name stays on this device and is used for greetings.</p>
            </div>

            <!-- Choose Profile Look (Avatar Color Palette) -->
            <div class="vk-avatar-picker-section">
              <label class="vk-label">Choose your profile look</label>
              <div class="vk-palette-row">
                <button
                  v-for="item in AVATAR_PALETTES"
                  :key="item.id"
                  type="button"
                  class="vk-palette-btn"
                  :class="{ 'is-selected': selectedAvatarColor === item.color }"
                  :style="{ backgroundColor: item.color }"
                  @click="selectedAvatarColor = item.color"
                  :title="item.label"
                >
                  <span class="vk-palette-initials">{{ previewInitials }}</span>
                  <div v-if="selectedAvatarColor === item.color" class="vk-palette-check">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                </button>
              </div>
            </div>

            <!-- Profile Preview Card -->
            <div class="vk-profile-preview-card">
              <div class="vk-preview-avatar" :style="{ backgroundColor: selectedAvatarColor }">
                {{ previewInitials }}
              </div>
              <div class="vk-preview-info">
                <div class="vk-preview-name">{{ displayNameInput.trim() || 'John' }}</div>
                <div class="vk-preview-tag">Local Profile</div>
              </div>
            </div>

            <div class="vk-setup-actions">
              <button
                type="submit"
                class="vk-btn vk-btn-primary vk-btn-block"
                :disabled="displayNameInput.trim().length < 2"
              >
                <span>Continue</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </button>
            </div>
          </form>
        </OnboardingLayout>

        <!-- ========================================== -->
        <!-- STEP 3: CREATE MASTER PASSWORD             -->
        <!-- ========================================== -->
        <OnboardingLayout
          v-else-if="step === 3"
          key="step3"
          title="Protect your vault."
          subtitle="Your Master Password protects the encrypted key to your Vaultify data."
          step="Step 2 of 6"
          hero-size="large"
          content-position="center"
          @back="goToStep(2)"
        >
          <form @submit.prevent="handleMasterPasswordContinue" class="vk-setup-form">
            <div class="vk-input-group">
              <label class="vk-label">Master Password</label>
              <div class="vk-input-wrapper" :class="{ 'is-invalid': errors.password }">
                <input
                  :type="showPassword ? 'text' : 'password'"
                  v-model="password"
                  placeholder="Enter strong Master Password..."
                  class="vk-input"
                  autocomplete="new-password"
                  required
                />
                <button type="button" class="vk-btn-icon-only" @click="showPassword = !showPassword" tabindex="-1" title="Toggle password visibility">
                  <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/>
                  </svg>
                </button>
              </div>
              <PasswordStrengthMeter :password="password" />
              <div v-if="errors.password" class="vk-error-text">{{ errors.password }}</div>
            </div>

            <div class="vk-input-group">
              <label class="vk-label">Confirm Master Password</label>
              <div class="vk-input-wrapper" :class="{ 'is-invalid': errors.confirmPassword }">
                <input
                  :type="showConfirmPassword ? 'text' : 'password'"
                  v-model="confirmPassword"
                  placeholder="Repeat Master Password..."
                  class="vk-input"
                  autocomplete="new-password"
                  required
                />
                <button type="button" class="vk-btn-icon-only" @click="showConfirmPassword = !showConfirmPassword" tabindex="-1" title="Toggle password visibility">
                  <svg v-if="!showConfirmPassword" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/>
                  </svg>
                </button>
              </div>
              <div v-if="errors.confirmPassword" class="vk-error-text">{{ errors.confirmPassword }}</div>
            </div>

            <p class="vk-form-helper-note">
              Your Master Password <strong>cannot be recovered</strong>. Keep it somewhere memorable.
            </p>

            <div class="vk-setup-actions">
              <button type="submit" class="vk-btn vk-btn-primary vk-btn-block" :disabled="isLoading">
                <span v-if="!isLoading">Continue</span>
                <span v-else>Creating Secure Vault...</span>
              </button>
            </div>
          </form>
        </OnboardingLayout>

        <!-- ========================================== -->
        <!-- STEP 4: CREATE 6-DIGIT PIN                 -->
        <!-- ========================================== -->
        <OnboardingLayout
          v-else-if="step === 4"
          key="step4"
          title="Create your PIN"
          subtitle="Use six digits for quick everyday access."
          :step="isImportFlow ? 'Security Setup' : 'Step 3 of 6'"
          hero-size="pin"
          content-position="center"
          @back="handleStep4Back"
        >
          <template #hero-bottom>
            <div class="vk-pin-hero-slot">
              <PinDots :filled-count="createdPin.length" :has-error="hasPinError" />
              <div class="vk-pin-status-slot">
                <span v-if="pinErrorText" class="vk-pin-error-text">{{ pinErrorText }}</span>
              </div>
            </div>
          </template>

          <div class="vk-pin-keypad-container">
            <PinKeypad
              @digit="handleCreatedPinDigit"
              @backspace="handleCreatedPinBackspace"
            />
          </div>
        </OnboardingLayout>

        <!-- ========================================== -->
        <!-- STEP 5: CONFIRM PIN                        -->
        <!-- ========================================== -->
        <OnboardingLayout
          v-else-if="step === 5"
          key="step5"
          title="Confirm your PIN"
          subtitle="Enter your six digits again to make sure."
          :step="isImportFlow ? 'Security Setup' : 'Step 4 of 6'"
          hero-size="pin"
          content-position="center"
          @back="resetToCreatePin"
        >
          <template #hero-bottom>
            <div class="vk-pin-hero-slot">
              <PinDots :filled-count="confirmedPin.length" :has-error="hasConfirmPinError" />
              <div class="vk-pin-status-slot">
                <span v-if="confirmPinErrorText" class="vk-pin-error-text">{{ confirmPinErrorText }}</span>
              </div>
            </div>
          </template>

          <div class="vk-pin-keypad-container">
            <PinKeypad
              @digit="handleConfirmedPinDigit"
              @backspace="handleConfirmedPinBackspace"
            />
          </div>
        </OnboardingLayout>

        <!-- ========================================== -->
        <!-- STEP 6: ENABLE BIOMETRICS                  -->
        <!-- ========================================== -->
        <OnboardingLayout
          v-else-if="step === 6"
          key="step6"
          :title="`Enable ${biometricAvailability.label}`"
          subtitle="Unlock Vaultify without typing your PIN each time."
          :step="isImportFlow ? 'Security Setup' : 'Step 5 of 6'"
          hero-size="medium"
          content-position="center"
          @back="goToStep(5)"
        >
          <div class="vk-bio-setup-cluster">
            <div class="vk-bio-icon-ring">
              <!-- Face ID Icon -->
              <svg v-if="biometricAvailability.type === 'face'" xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--brand-red)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 7V5a2 2 0 0 1 2-2h2"></path>
                <path d="M17 3h2a2 2 0 0 1 2 2v2"></path>
                <path d="M21 17v2a2 2 0 0 1-2 2h-2"></path>
                <path d="M7 21H5a2 2 0 0 1-2-2v-2"></path>
                <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                <line x1="9" y1="9" x2="9.01" y2="9"></line>
                <line x1="15" y1="9" x2="15.01" y2="9"></line>
              </svg>

              <!-- Fingerprint Icon -->
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--brand-red)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"></path>
                <path d="M14 13.12c0 2.38 0 6.38-1 8.88"></path>
                <path d="M17.29 21.02c.12-.6.43-2.3.43-5.02 0-3.41-.9-5.11-2.02-6.52-1.3-1.63-2.67-2.48-3.7-2.48-1.5 0-3 1.09-3.7 2.48-.68 1.35-.97 2.87-1.07 4.29"></path>
                <path d="M2 12C2 6.5 6.5 2 12 2a10 10 0 0 1 8 4"></path>
                <path d="M7 20.7a1 1 0 0 0 .5-.28c2.4-2.22 3.5-4.22 3.5-7.42"></path>
                <path d="M22 12c0 3.25-.8 5.75-1.5 7.5"></path>
              </svg>
            </div>

            <p class="vk-bio-setup-text">
              Your device's biometric sensor securely authorizes access to your encrypted vault key.
            </p>

            <div class="vk-bio-setup-actions">
              <button
                type="button"
                class="vk-btn vk-btn-primary vk-btn-block"
                @click="handleEnableBiometrics"
              >
                Enable {{ biometricAvailability.label }}
              </button>

              <button
                type="button"
                class="vk-btn vk-btn-secondary vk-btn-block"
                @click="handleSkipBiometrics"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </OnboardingLayout>

        <!-- ========================================== -->
        <!-- STEP 7: SECURITY PREFERENCES               -->
        <!-- ========================================== -->
        <OnboardingLayout
          v-else-if="step === 7"
          key="step7"
          title="Security preferences"
          subtitle="You can change these anytime in Settings."
          step="Step 6 of 6"
          hero-size="medium"
          content-position="center"
          @back="goToStep(biometricAvailability.available ? 6 : 5)"
        >
          <div class="vk-sec-pref-cluster">
            <div class="vk-sec-pref-list">
              <!-- Auto-Lock Timeout -->
              <div class="vk-pref-item">
                <div class="vk-pref-info">
                  <div class="vk-pref-label">Auto-Lock Vault</div>
                  <div class="vk-pref-desc">Lock after inactivity</div>
                </div>
                <div class="vk-pref-control">
                  <VaultSelect
                    :model-value="secAutoLock"
                    :options="autoLockOptions"
                    title="Auto-Lock Vault"
                    @change="(val) => secAutoLock = val as AutoLockTimeout"
                  />
                </div>
              </div>

              <!-- Lock on Background -->
              <div class="vk-pref-item">
                <div class="vk-pref-info">
                  <div class="vk-pref-label">Lock When App Closes</div>
                  <div class="vk-pref-desc">Lock when switching apps or backgrounding</div>
                </div>
                <div class="vk-pref-control">
                  <VaultToggle
                    :model-value="secLockOnBackground"
                    @change="(val) => secLockOnBackground = val"
                  />
                </div>
              </div>

              <!-- Clear Copied Passwords -->
              <div class="vk-pref-item">
                <div class="vk-pref-info">
                  <div class="vk-pref-label">Clear Copied Passwords</div>
                  <div class="vk-pref-desc">Erase sensitive clipboard entries</div>
                </div>
                <div class="vk-pref-control">
                  <VaultSelect
                    :model-value="secClipboardTimeout"
                    :options="clipboardOptions"
                    title="Clear Clipboard"
                    @change="(val) => secClipboardTimeout = val as ClipboardTimeout"
                  />
                </div>
              </div>
            </div>

            <div class="vk-setup-actions">
              <button
                type="button"
                class="vk-btn vk-btn-primary vk-btn-block"
                @click="handleSecurityContinue"
              >
                <span>Continue</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </button>
            </div>
          </div>
        </OnboardingLayout>

        <!-- ========================================== -->
        <!-- STEP 8: YOU'RE READY / COMPLETE            -->
        <!-- ========================================== -->
        <div v-else-if="step === 8" key="step8" class="vk-onboarding-fullscreen vk-hero-backdrop vk-completion-screen">
          <div class="vk-container vk-onboarding-container vk-completion-container">
            <!-- Flexible Top Breathing Room -->
            <div class="vk-completion-top-spacer"></div>

            <!-- Main Completion Cluster -->
            <div class="vk-completion-cluster">
              <h1 class="vk-completion-headline">
                <template v-if="userDisplayName">
                  You're ready,<br/>
                  <span class="vk-headline-accent">{{ userDisplayName }}.</span>
                </template>
                <template v-else>
                  You're ready.
                </template>
              </h1>
              <p class="vk-completion-body">
                Your encrypted vault is set up and ready to use.
              </p>

              <!-- Minimal Inline Completion Checklist -->
              <div class="vk-completion-checklist">
                <div class="vk-completion-item">
                  <span class="vk-check-icon" aria-hidden="true">✓</span>
                  <span>Local profile {{ isImportFlow ? 'restored' : 'ready' }}</span>
                </div>
                <div class="vk-completion-item">
                  <span class="vk-check-icon" aria-hidden="true">✓</span>
                  <span>Master Password configured</span>
                </div>
                <div class="vk-completion-item">
                  <span class="vk-check-icon" aria-hidden="true">✓</span>
                  <span>6-digit PIN configured</span>
                </div>
                <div class="vk-completion-item" v-if="biometricEnabled">
                  <span class="vk-check-icon" aria-hidden="true">✓</span>
                  <span>{{ biometricSuccessLabel }} enabled</span>
                </div>
              </div>
            </div>

            <!-- Flexible Bottom Breathing Room -->
            <div class="vk-completion-bottom-spacer"></div>

            <!-- Single Primary CTA -->
            <div class="vk-onboarding-footer vk-completion-footer">
              <button type="button" class="vk-btn vk-btn-white vk-btn-block" @click="handleFinishOnboarding">
                <span>Open My Vault</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </transition>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { IonPage, IonContent } from '@ionic/vue';
import { useAuthStore } from '@/stores/auth.store';
import { useVaultStore } from '@/stores/vault.store';
import { useSettingsStore } from '@/stores/settings.store';
import { useProfileStore } from '@/stores/profile.store';
import { useToast } from '@/composables/useToast';
import { ExportService, PortableBackupBundle } from '@/services/export.service';
import { PinService } from '@/services/pin.service';
import { BiometricService, BiometricAvailability } from '@/services/biometric.service';
import { AVATAR_PALETTES, generateInitials } from '@/models/profile.model';
import { AutoLockTimeout, ClipboardTimeout } from '@/models/settings.model';
import OnboardingLayout from '@/components/onboarding/OnboardingLayout.vue';
import PasswordStrengthMeter from '@/components/common/PasswordStrengthMeter.vue';
import PinDots from '@/components/security/PinDots.vue';
import PinKeypad from '@/components/security/PinKeypad.vue';
import VaultSelect, { SelectOption } from '@/components/common/VaultSelect.vue';
import VaultToggle from '@/components/common/VaultToggle.vue';
import VaultifyLogo from '@/components/common/VaultifyLogo.vue';

const router = useRouter();
const authStore = useAuthStore();
const vaultStore = useVaultStore();
const settingsStore = useSettingsStore();
const profileStore = useProfileStore();
const { showToast } = useToast();

type SetupStep = number | 'choice' | 'import_auth' | 'import_summary';
const step = ref<SetupStep>(1);
const isImportFlow = ref(false);

// Import States
const onboardingFileInputRef = ref<HTMLInputElement | null>(null);
const pendingImportEnvelope = ref<any>(null);
const importMeta = ref<{ exportedAt?: string; appVersion?: string } | null>(null);
const importMasterPassword = ref('');
const isImportDecrypting = ref(false);
const importedBundle = ref<PortableBackupBundle | null>(null);

// STEP 2: PROFILE STATE
const displayNameInput = ref('');
const selectedAvatarColor = ref('#B82825');
const profileError = ref('');

const userDisplayName = computed(() => {
  return displayNameInput.value.trim() || profileStore.displayName?.trim() || '';
});

const biometricSuccessLabel = computed(() => {
  if (biometricAvailability.value.type === 'face') return 'Face ID';
  if (biometricAvailability.value.type === 'fingerprint') return 'Fingerprint';
  return biometricAvailability.value.label || 'Biometrics';
});

const previewInitials = computed(() => {
  return generateInitials(displayNameInput.value || 'John');
});

// STEP 3: MASTER PASSWORD STATE
const password = ref('');
const confirmPassword = ref('');
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const isLoading = ref(false);
const generatedVaultKey = ref('');

const errors = reactive({
  password: '',
  confirmPassword: '',
});

// STEP 4 & 5: PIN STATE
const createdPin = ref('');
const hasPinError = ref(false);
const pinErrorText = ref('');

const confirmedPin = ref('');
const hasConfirmPinError = ref(false);
const confirmPinErrorText = ref('');

// STEP 6: BIOMETRICS STATE
const biometricAvailability = ref<BiometricAvailability>({ available: false, type: 'none', label: 'Biometrics' });
const biometricEnabled = ref(false);

// STEP 7: SECURITY PREFERENCES STATE
const secAutoLock = ref<AutoLockTimeout>(300); // 5 minutes
const secLockOnBackground = ref<boolean>(true);
const secClipboardTimeout = ref<ClipboardTimeout>(30); // 30 seconds

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

onMounted(async () => {
  biometricAvailability.value = await BiometricService.checkAvailability();
});

function goToStep(targetStep: SetupStep) {
  step.value = targetStep;
}

// CHOICE & IMPORT FLOW HANDLERS
function triggerOnboardingImport() {
  onboardingFileInputRef.value?.click();
}

function handleOnboardingFileSelected(event: Event) {
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

    pendingImportEnvelope.value = result.envelope;
    importMeta.value = {
      exportedAt: result.exportedAt,
      appVersion: result.appVersion,
    };
    importMasterPassword.value = '';
    importedBundle.value = null;
    isImportFlow.value = true;
    goToStep('import_auth');
  };

  reader.readAsText(file);
  input.value = '';
}

async function handleOnboardingDecryptImport() {
  if (!pendingImportEnvelope.value || !importMasterPassword.value) return;

  isImportDecrypting.value = true;
  try {
    const result = await ExportService.decryptAndExtractBackup(pendingImportEnvelope.value, importMasterPassword.value);
    if (!result.valid || !result.bundle) {
      throw new Error(result.error || 'Could not decrypt backup.');
    }

    importedBundle.value = result.bundle;
    displayNameInput.value = result.bundle.profile.displayName;
    selectedAvatarColor.value = result.bundle.profile.avatarColor;
    goToStep('import_summary');
  } catch (err: any) {
    showToast(err.message || 'Incorrect Master Password for backup', 'danger');
  } finally {
    isImportDecrypting.value = false;
  }
}

async function handleApplyImportOnboarding() {
  if (!importedBundle.value || !pendingImportEnvelope.value || !importMasterPassword.value) return;

  try {
    const bundle = importedBundle.value;
    
    // 1. Setup vault from restored payload
    const key = await authStore.createInitialVault(importMasterPassword.value, bundle.vault);
    generatedVaultKey.value = key;

    // 2. Set profile
    await profileStore.setProfile(bundle.profile);

    // 3. Set preferences
    await settingsStore.updateSettings(bundle.preferences);

    // 4. Update memory cache
    vaultStore.setDecryptedPayload(bundle.vault);

    // 5. Proceed directly to PIN setup for this device
    goToStep(4);
  } catch (err: any) {
    showToast(err.message || 'Failed to restore vault.', 'danger');
  }
}

function handleStep4Back() {
  if (isImportFlow.value) {
    goToStep('import_summary');
  } else {
    goToStep(3);
  }
}

// STEP 2: PROFILE SUBMIT
function handleProfileContinue() {
  const trimmed = displayNameInput.value.trim();
  if (trimmed.length < 2) {
    profileError.value = 'Display name must be at least 2 characters.';
    return;
  }
  if (trimmed.length > 30) {
    profileError.value = 'Display name must be 30 characters or fewer.';
    return;
  }

  profileError.value = '';
  goToStep(3);
}

// STEP 3: MASTER PASSWORD SUBMIT
async function handleMasterPasswordContinue() {
  errors.password = '';
  errors.confirmPassword = '';

  if (!password.value || password.value.length < 6) {
    errors.password = 'Master Password must be at least 6 characters.';
    return;
  }

  if (password.value !== confirmPassword.value) {
    errors.confirmPassword = 'Passwords do not match.';
    return;
  }

  isLoading.value = true;
  try {
    const key = await authStore.createInitialVault(password.value);
    generatedVaultKey.value = key;
    vaultStore.clearInMemoryData();
    goToStep(4);
  } catch (err: any) {
    showToast(err.message || 'Failed to create vault.', 'danger');
  } finally {
    isLoading.value = false;
  }
}

// STEP 4: PIN CREATION
function handleCreatedPinDigit(digit: string) {
  if (createdPin.value.length < 6) {
    createdPin.value += digit;
    hasPinError.value = false;
    pinErrorText.value = '';

    if (createdPin.value.length === 6) {
      const validation = PinService.validatePinStrength(createdPin.value);
      if (!validation.valid) {
        hasPinError.value = true;
        pinErrorText.value = validation.error || 'Choose a less predictable PIN.';
        window.setTimeout(() => {
          createdPin.value = '';
        }, 450);
        return;
      }

      window.setTimeout(() => {
        confirmedPin.value = '';
        hasConfirmPinError.value = false;
        confirmPinErrorText.value = '';
        goToStep(5);
      }, 150);
    }
  }
}

function handleCreatedPinBackspace() {
  if (createdPin.value.length > 0) {
    createdPin.value = createdPin.value.slice(0, -1);
    hasPinError.value = false;
    pinErrorText.value = '';
  }
}

function resetToCreatePin() {
  createdPin.value = '';
  confirmedPin.value = '';
  hasPinError.value = false;
  hasConfirmPinError.value = false;
  pinErrorText.value = '';
  confirmPinErrorText.value = '';
  goToStep(4);
}

// STEP 5: PIN CONFIRMATION
async function handleConfirmedPinDigit(digit: string) {
  if (confirmedPin.value.length < 6) {
    confirmedPin.value += digit;
    hasConfirmPinError.value = false;
    confirmPinErrorText.value = '';

    if (confirmedPin.value.length === 6) {
      if (confirmedPin.value !== createdPin.value) {
        hasConfirmPinError.value = true;
        confirmPinErrorText.value = "PINs don't match. Try again.";
        window.setTimeout(() => {
          confirmedPin.value = '';
        }, 450);
        return;
      }

      try {
        await PinService.createPinProtection(confirmedPin.value, generatedVaultKey.value);

        if (biometricAvailability.value.available) {
          goToStep(6);
        } else if (isImportFlow.value) {
          goToStep(8);
        } else {
          goToStep(7);
        }
      } catch (err: any) {
        showToast(err.message || 'Failed to save PIN protection.', 'danger');
      }
    }
  }
}

function handleConfirmedPinBackspace() {
  if (confirmedPin.value.length > 0) {
    confirmedPin.value = confirmedPin.value.slice(0, -1);
    hasConfirmPinError.value = false;
    confirmPinErrorText.value = '';
  }
}

// STEP 6: BIOMETRICS ENROLLMENT
async function handleEnableBiometrics() {
  try {
    await BiometricService.enableBiometricUnlock(generatedVaultKey.value);
    biometricEnabled.value = true;
    showToast('Biometric unlock enabled', 'success');
  } catch {
    // Graceful skip
  }
  if (isImportFlow.value) {
    goToStep(8);
  } else {
    goToStep(7);
  }
}

function handleSkipBiometrics() {
  if (isImportFlow.value) {
    goToStep(8);
  } else {
    goToStep(7);
  }
}

// STEP 7: SECURITY PREFERENCES SUBMIT
function handleSecurityContinue() {
  goToStep(8);
}

// STEP 8: FINAL COMPLETION
async function handleFinishOnboarding() {
  const now = new Date().toISOString();
  const name = displayNameInput.value.trim() || 'John';

  // 1. Save local profile if not import flow (already set in import)
  if (!isImportFlow.value) {
    await profileStore.setProfile({
      id: crypto.randomUUID ? crypto.randomUUID() : `profile_${Date.now()}`,
      displayName: name,
      avatarType: 'initials',
      avatarColor: selectedAvatarColor.value,
      createdAt: now,
      updatedAt: now,
    });

    // 2. Save security settings
    await settingsStore.updateSettings({
      autoLockTimeout: secAutoLock.value,
      lockOnBackground: secLockOnBackground.value,
      clipboardTimeout: secClipboardTimeout.value,
      biometricsEnabled: biometricEnabled.value,
    });
  } else {
    await settingsStore.updateSettings({
      biometricsEnabled: biometricEnabled.value,
    });
  }

  // 3. Mark onboarding complete
  await profileStore.completeOnboarding();

  showToast('Setup complete! Welcome to Vaultify.', 'success');
  router.replace('/tabs/vault');
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
.vaultify-onboarding {
  color-scheme: light;
}

.vk-setup-page {
  --background: linear-gradient(
    180deg,
    #D02724 0%,
    #B8201E 100%
  );
  background: linear-gradient(
    180deg,
    #D02724 0%,
    #B8201E 100%
  );
}

/* Thin Top Progress Indicator */
.vk-onboarding-progress-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  z-index: 100;
  background: rgba(0, 0, 0, 0.1);
}

.vk-progress-track {
  width: 100%;
  height: 100%;
}

.vk-progress-fill {
  height: 100%;
  background: #FFFFFF;
  transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Fullscreen Hero (Steps 1 & 8) */
.vk-onboarding-fullscreen {
  min-height: 100dvh;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: linear-gradient(
    180deg,
    #D02724 0%,
    #B8201E 100%
  );
}

.vk-onboarding-container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: calc(100dvh - 20px);
  padding: calc(env(safe-area-inset-top, 0px) + 24px) 16px calc(env(safe-area-inset-bottom, 0px) + 24px) 16px;
}

.vk-brand-tag {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #FFFFFF;
}

.vk-hero-logo {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.vk-onboarding-hero {
  margin: auto 0;
}

.vk-onboarding-headline {
  font-size: 3rem;
  font-weight: 800;
  line-height: 1.08;
  letter-spacing: -0.04em;
  margin: 0 0 16px 0;
  color: #FFFFFF;
}

.vk-headline-accent {
  opacity: 0.94;
}

.vk-onboarding-body {
  font-size: 1.1rem;
  opacity: 0.88;
  line-height: 1.45;
  max-width: 330px;
  margin: 0;
  color: #FFFFFF;
}

.vk-onboarding-footer {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.vk-onboarding-disclaimer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: -0.01em;
}

/* Choice Step */
.vk-choice-cluster {
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
  max-width: 330px;
  margin: 0 auto;
  padding-top: clamp(28px, 4.5dvh, 48px);
}

.vk-choice-card {
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: 60px;
  background: #F1F0ED;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 18px;
  padding: 10px 16px;
  text-align: left;
  cursor: pointer;
  width: 100%;
  transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
}

.dark .vk-choice-card {
  background: var(--vk-bg-surface-soft);
  border-color: var(--vk-border);
}

.vk-choice-card:active {
  transform: scale(0.985);
  border-color: var(--brand-red);
}

.vk-choice-icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(184, 40, 37, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.dark .vk-choice-icon-wrap {
  background: rgba(229, 62, 62, 0.18);
}

.vk-choice-text {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.vk-choice-title {
  font-size: 0.98rem;
  font-weight: 750;
  color: #111827;
  letter-spacing: -0.01em;
}

.dark .vk-choice-title {
  color: var(--text-primary);
}

.vk-choice-desc {
  font-size: 0.775rem;
  color: #6B7280;
  margin-top: 1px;
}

.dark .vk-choice-desc {
  color: var(--text-secondary);
}

.vk-choice-chevron {
  color: #9CA3AF;
  flex-shrink: 0;
}

.dark .vk-choice-chevron {
  color: var(--text-muted);
}

.vk-choice-footer-desc {
  font-size: 0.75rem;
  line-height: 1.45;
  color: var(--text-muted);
  text-align: center;
  margin-top: 20px;
  margin-bottom: 0;
  max-width: 290px;
  margin-inline: auto;
}

/* Import Meta and Summary */
.vk-import-auth-cluster,
.vk-import-summary-cluster {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.vk-import-meta-box {
  background: var(--vk-bg-surface-soft);
  border: 1px solid var(--vk-border);
  border-radius: var(--radius-md);
  padding: 14px 16px;
  margin-bottom: 20px;
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

/* Minimal Completion Screen Styles */
.vk-completion-screen {
  background: linear-gradient(
    180deg,
    #C92A27 0%,
    #B82825 55%,
    #A8211F 100%
  ) !important;
}

.vk-completion-container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: calc(100dvh - 20px);
  padding: calc(env(safe-area-inset-top, 0px) + 20px) 24px calc(env(safe-area-inset-bottom, 0px) + 18px) 24px;
}

.vk-completion-top-spacer {
  flex: 1;
  min-height: 20px;
}

.vk-completion-bottom-spacer {
  flex: 1.2;
  min-height: 20px;
}

.vk-completion-cluster {
  display: flex;
  flex-direction: column;
  animation: vkFadeUp var(--vk-motion-base) var(--vk-ease-enter) forwards;
}

.vk-completion-headline {
  font-size: clamp(2.1rem, 7vw, 2.5rem);
  font-weight: 800;
  line-height: 1.08;
  letter-spacing: -0.035em;
  margin: 0 0 14px 0;
  color: #FFFFFF;
}

.vk-completion-body {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.45;
  margin: 0 0 28px 0;
  max-width: 330px;
}

.vk-completion-checklist {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.vk-completion-item {
  display: flex;
  align-items: center;
  gap: 12px;
  color: rgba(255, 255, 255, 0.95);
  font-size: 0.925rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.vk-check-icon {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.22);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.725rem;
  font-weight: 800;
  color: #FFFFFF;
  flex-shrink: 0;
}

.vk-completion-footer {
  width: 100%;
}

/* Setup Form */
.vk-setup-form {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.vk-setup-form .vk-input-group {
  margin-bottom: 16px;
}

.vk-setup-form .vk-label {
  margin-bottom: 6px;
}

.vk-field-hint {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-top: 6px;
  line-height: 1.4;
}

/* Avatar Palette Picker */
.vk-avatar-picker-section {
  margin-bottom: 20px;
}

.vk-palette-row {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.vk-palette-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 3px solid transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  transition: transform var(--vk-motion-base) var(--vk-ease-enter),
              border-color var(--vk-motion-base) ease;
}

.vk-palette-btn:active {
  transform: scale(0.96);
}

.vk-palette-btn.is-selected {
  border-color: var(--text-primary);
  transform: scale(1.08);
}

.vk-palette-initials {
  font-size: 0.95rem;
  font-weight: 800;
  color: #FFFFFF;
}

.vk-palette-check {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #000000;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid #FFFFFF;
  animation: vkCheckFadeIn var(--vk-motion-fast) var(--vk-ease-enter) forwards;
}

/* Profile Preview Card */
.vk-profile-preview-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--vk-bg-surface-soft);
  border: 1px solid var(--vk-border);
  border-radius: var(--radius-lg);
  padding: 14px 16px;
  margin-bottom: 22px;
}

.vk-preview-avatar {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.15rem;
  font-weight: 800;
  color: #FFFFFF;
  flex-shrink: 0;
}

.vk-preview-info {
  display: flex;
  flex-direction: column;
}

.vk-preview-name {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--text-primary);
}

.vk-preview-tag {
  font-size: 0.775rem;
  font-weight: 600;
  color: var(--brand-red);
}

/* Form Helper Note */
.vk-form-helper-note {
  font-size: 0.775rem;
  line-height: 1.45;
  color: #7A7A7A;
  margin-top: -4px;
  margin-bottom: 18px;
  font-weight: 400;
}

.dark .vk-form-helper-note {
  color: #9A9A9A;
}

.vk-form-helper-note strong {
  font-weight: 600;
  color: inherit;
}

.vk-setup-actions {
  margin-top: 0;
}

/* PIN Hero Slot (Placed below subtitle inside Red Hero) */
.vk-pin-hero-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: clamp(22px, 3.2dvh, 28px);
  width: 100%;
}

.vk-pin-status-slot {
  min-height: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 6px;
}

.vk-pin-error-text {
  font-size: 0.775rem;
  font-weight: 700;
  color: #FFFFFF;
  background: rgba(0, 0, 0, 0.28);
  padding: 3px 12px;
  border-radius: var(--radius-pill);
  letter-spacing: -0.01em;
  text-align: center;
  line-height: 1.2;
}

/* PIN White Sheet Keypad Container */
.vk-pin-keypad-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin: 0 auto;
}

/* Biometrics Step */
.vk-bio-setup-cluster {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 100%;
  max-width: 320px;
  margin: 0 auto;
}

.vk-bio-icon-ring {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: var(--brand-red-subtle);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.vk-bio-setup-title {
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 6px 0;
}

.vk-bio-setup-text {
  font-size: 0.885rem;
  color: var(--text-secondary);
  max-width: 290px;
  line-height: 1.45;
  margin: 0 0 24px 0;
}

.vk-bio-setup-actions {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Security Preferences */
.vk-sec-pref-cluster {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.vk-sec-pref-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 22px;
}

.vk-pref-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  background: var(--vk-bg-surface-soft);
  border: 1px solid var(--vk-border);
  border-radius: var(--radius-lg);
  padding: 14px 16px;
}

.vk-pref-info {
  display: flex;
  flex-direction: column;
}

.vk-pref-label {
  font-size: 0.925rem;
  font-weight: 800;
  color: var(--text-primary);
}

.vk-pref-desc {
  font-size: 0.775rem;
  color: var(--text-muted);
  margin-top: 2px;
}

.vk-pref-control {
  flex-shrink: 0;
}

/* Transitions */
.vk-slide-fade-enter-active,
.vk-slide-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.vk-slide-fade-enter-from {
  opacity: 0;
  transform: translateX(12px);
}

.vk-slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-12px);
}
</style>
