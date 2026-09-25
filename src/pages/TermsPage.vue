<template>
  <ion-page>
    <AppHeader title="Terms of Use" :show-back="true" />

    <ion-content :fullscreen="true">
      <div class="vk-container ion-padding">
        <div class="vk-terms-header">
          <div class="vk-terms-badge">LEGAL & RESPONSIBILITY</div>
          <h1 class="vk-terms-title">Terms of Use</h1>
          <p class="vk-terms-subtitle">
            Please review the terms governing the use of the Vaultify application.
          </p>
        </div>

        <div class="vk-info-card">
          <div class="vk-info-section">
            <h3 class="vk-info-heading">PURPOSE</h3>
            <p class="vk-info-text">
              Vaultify is a local credential-management and security utility designed to help users securely store and manage passwords and private notes.
            </p>
          </div>

          <div class="vk-info-section">
            <h3 class="vk-info-heading">MASTER PASSWORD RESPONSIBILITY</h3>
            <p class="vk-info-text">
              Users are strictly responsible for remembering their Master Password. Vaultify cannot recover, reset, or bypass forgotten Master Passwords.
            </p>
          </div>

          <div class="vk-info-section">
            <h3 class="vk-info-heading">BACKUP RESPONSIBILITY</h3>
            <p class="vk-info-text">
              Users are responsible for creating and maintaining encrypted backups if they want recovery after device loss, app removal, or system reset.
            </p>
          </div>

          <div class="vk-info-section">
            <h3 class="vk-info-heading">SECURITY</h3>
            <p class="vk-info-text">
              Vaultify uses industry-standard cryptography (AES-GCM-256 and PBKDF2) designed to protect local vault data, but no software can guarantee absolute security against all threat vectors.
            </p>
          </div>

          <div class="vk-info-section">
            <h3 class="vk-info-heading">DEVICE SECURITY</h3>
            <p class="vk-info-text">
              Application security also depends on factors outside Vaultify's control, including:
            </p>
            <ul class="vk-info-list">
              <li>Device operating system integrity and updates</li>
              <li>Screen lock and passcode strength</li>
              <li>Root / jailbreak status</li>
              <li>Malware exposure and hostile software</li>
              <li>Secure handling of exported backup files</li>
            </ul>
          </div>

          <div class="vk-info-section">
            <h3 class="vk-info-heading">DATA LOSS</h3>
            <p class="vk-info-text">
              Loss of the Master Password and all valid backups may permanently prevent access to stored vault contents. Vaultify is provided "as is" without warranty.
            </p>
          </div>

          <div class="vk-info-section">
            <h3 class="vk-info-heading">VERSION</h3>
            <p class="vk-info-text">
              Vaultify {{ APP_VERSION }}<br />
              Last updated: {{ APP_RELEASE_DATE }}
            </p>
          </div>
        </div>

        <div class="vk-terms-footer">
          <div class="vk-footer-brand">{{ APP_NAME }} • v{{ APP_VERSION }}</div>
          <div class="vk-footer-copy">Private. Local. Encrypted.</div>
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
.vk-terms-header {
  padding: 16px 8px 24px 8px;
}

.vk-terms-badge {
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

.vk-terms-title {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 8px 0;
  letter-spacing: -0.01em;
}

.vk-terms-subtitle {
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

.vk-info-list {
  margin: 4px 0 0 18px;
  padding: 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.vk-info-list li {
  margin-bottom: 4px;
}

.vk-terms-footer {
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
