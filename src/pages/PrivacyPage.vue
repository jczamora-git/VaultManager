<template>
  <ion-page>
    <AppHeader title="Privacy Policy" :show-back="true" />

    <ion-content :fullscreen="true">
      <div class="vk-container ion-padding">
        <div class="vk-policy-header">
          <div class="vk-policy-badge">PRIVACY COMMITMENT</div>
          <h1 class="vk-policy-title">Your Privacy in Vaultify</h1>
          <p class="vk-policy-subtitle">
            Vaultify is designed around zero-knowledge principles. Your credentials belong to you and remain encrypted on your device.
          </p>
        </div>

        <div class="vk-info-card">
          <div class="vk-info-section">
            <h3 class="vk-info-heading">LOCAL STORAGE</h3>
            <p class="vk-info-text">
              Vaultify stores your vault locally on your device. No cloud synchronization or external servers are used for storing credentials.
            </p>
          </div>

          <div class="vk-info-section">
            <h3 class="vk-info-heading">NO VAULTIFY ACCOUNT</h3>
            <p class="vk-info-text">
              No Vaultify account is required to create or use a vault. We do not collect emails, phone numbers, or user identities.
            </p>
          </div>

          <div class="vk-info-section">
            <h3 class="vk-info-heading">ENCRYPTED VAULT</h3>
            <p class="vk-info-text">
              Credential data is encrypted before it is stored using authenticated AES-GCM-256 encryption.
            </p>
          </div>

          <div class="vk-info-section">
            <h3 class="vk-info-heading">MASTER PASSWORD</h3>
            <p class="vk-info-text">
              Your Master Password is never stored as plaintext and cannot be recovered by Vaultify. It is used with PBKDF2 key derivation to decrypt your vault key.
            </p>
          </div>

          <div class="vk-info-section">
            <h3 class="vk-info-heading">PIN</h3>
            <p class="vk-info-text">
              Your 6-digit PIN is used for device-local quick unlock and is never stored as plaintext.
            </p>
          </div>

          <div class="vk-info-section">
            <h3 class="vk-info-heading">BIOMETRICS</h3>
            <p class="vk-info-text">
              Biometric authentication is handled through supported operating-system security functionality. Vaultify never receives biometric fingerprints, face scans, or biometric templates.
            </p>
          </div>

          <div class="vk-info-section">
            <h3 class="vk-info-heading">NETWORK ACCESS</h3>
            <p class="vk-info-text">
              Core Vaultify functionality works offline. Optional website icon retrieval may require network access to fetch public website favicons. No credentials, usernames, notes, or vault secrets are ever transmitted.
            </p>
          </div>

          <div class="vk-info-section">
            <h3 class="vk-info-heading">BACKUPS</h3>
            <p class="vk-info-text">
              Exported Vaultify backups remain encrypted. The correct Master Password is required to restore them.
            </p>
          </div>

          <div class="vk-info-section">
            <h3 class="vk-info-heading">CLIPBOARD</h3>
            <p class="vk-info-text">
              Copied passwords may temporarily exist in the operating-system clipboard until cleared according to Vaultify settings.
            </p>
          </div>

          <div class="vk-info-section">
            <h3 class="vk-info-heading">DATA REMOVAL</h3>
            <p class="vk-info-text">
              Deleting Vaultify data removes the app-controlled local profile, encrypted vault, security configuration, and preferences from this device.
            </p>
          </div>
        </div>

        <div class="vk-policy-footer">
          <div class="vk-footer-brand">{{ APP_NAME }} • Version {{ APP_VERSION }}</div>
          <div class="vk-footer-copy">Last updated: {{ APP_RELEASE_DATE }}</div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent } from '@ionic/vue';
import AppHeader from '@/components/common/AppHeader.vue';
import { APP_NAME, APP_VERSION, APP_RELEASE_DATE } from '@/constants/app';
</script>

<style scoped>
.vk-policy-header {
  padding: 16px 8px 24px 8px;
}

.vk-policy-badge {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 800;
  color: var(--brand-red);
  background: var(--brand-red-subtle);
  padding: 3px 10px;
  border-radius: var(--radius-pill);
  margin-bottom: 8px;
  letter-spacing: 0.04em;
}

.vk-policy-title {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 8px 0;
  letter-spacing: -0.01em;
}

.vk-policy-subtitle {
  font-size: 0.9rem;
  line-height: 1.5;
  color: var(--text-secondary);
  margin: 0;
}

.vk-info-card {
  background: var(--vk-bg-surface-soft);
  border: 1px solid var(--vk-border);
  border-radius: var(--radius-lg);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.vk-info-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.vk-info-heading {
  font-size: 0.775rem;
  font-weight: 800;
  color: var(--brand-red);
  letter-spacing: 0.05em;
  margin: 0;
  text-transform: uppercase;
}

.vk-info-text {
  font-size: 0.885rem;
  line-height: 1.5;
  color: var(--text-primary);
  margin: 0;
}

.vk-policy-footer {
  text-align: center;
  padding: 32px 16px 24px 16px;
}

.vk-footer-brand {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.vk-footer-copy {
  font-size: 0.775rem;
  color: var(--text-muted);
}
</style>
