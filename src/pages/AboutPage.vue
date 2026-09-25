<template>
  <ion-page>
    <AppHeader title="About Vaultify" :show-back="true" />

    <ion-content :fullscreen="true">
      <div class="vk-container ion-padding">
        <!-- APP BRANDING HEADER -->
        <div class="vk-about-hero">
          <div class="vk-about-logo-wrapper">
            <VaultifyLogo :size="72" class="vk-about-logo" />
          </div>
          <h1 class="vk-about-title">{{ APP_NAME }}</h1>
          <div class="vk-about-version">Version {{ APP_VERSION }}</div>
          <p class="vk-about-desc">
            Vaultify is a privacy-first local password manager designed to keep your credentials encrypted on your own device.
          </p>
        </div>

        <!-- INFO SECTIONS -->
        <div class="vk-info-card">
          <div class="vk-info-section">
            <h3 class="vk-info-heading">PRIVACY FIRST</h3>
            <p class="vk-info-text">
              Your vault is stored locally and encrypted before it is written to device storage.
            </p>
          </div>

          <div class="vk-info-section">
            <h3 class="vk-info-heading">OFFLINE BY DESIGN</h3>
            <p class="vk-info-text">
              Vaultify does not require an account, cloud service, or internet connection for its core password-management features.
            </p>
          </div>

          <div class="vk-info-section">
            <h3 class="vk-info-heading">YOUR DATA, YOUR CONTROL</h3>
            <p class="vk-info-text">
              Your local profile, saved credentials, categories, and portable preferences can be exported into an encrypted Vaultify backup.
            </p>
          </div>

          <div class="vk-info-section">
            <h3 class="vk-info-heading">SECURITY</h3>
            <p class="vk-info-text">
              Vaultify supports:
            </p>
            <ul class="vk-info-list">
              <li>Master Password encryption (AES-GCM-256 / PBKDF2)</li>
              <li>6-digit quick unlock PIN</li>
              <li>Supported device biometrics (Face ID / Fingerprint)</li>
              <li>Automatic vault locking</li>
              <li>Configurable clipboard clearing</li>
            </ul>
          </div>

          <div class="vk-info-section">
            <h3 class="vk-info-heading">NO ONLINE ACCOUNT</h3>
            <p class="vk-info-text">
              No Vaultify account is required. Everything stays on this device.
            </p>
          </div>

          <div class="vk-info-section">
            <h3 class="vk-info-heading">NETWORK ACCESS</h3>
            <p class="vk-info-text">
              Vaultify does not require an internet connection for its core features. Optional website icon retrieval may access website domains when available, without transmitting any credentials or personal data.
            </p>
          </div>
        </div>

        <div class="vk-about-footer">
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
import VaultifyLogo from '@/components/common/VaultifyLogo.vue';
import { APP_NAME, APP_VERSION } from '@/constants/app';
</script>

<style scoped>
.vk-about-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 24px 16px 28px 16px;
}

.vk-about-logo-wrapper {
  width: 88px;
  height: 88px;
  border-radius: 22px;
  background: var(--vk-bg-surface);
  border: 1px solid var(--vk-border);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  padding: 12px;
}

.vk-about-logo {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.vk-about-title {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 4px 0;
  letter-spacing: -0.02em;
}

.vk-about-version {
  font-size: 0.825rem;
  font-weight: 700;
  color: var(--brand-red);
  background: var(--brand-red-subtle);
  padding: 4px 12px;
  border-radius: var(--radius-pill);
  margin-bottom: 16px;
}

.vk-about-desc {
  font-size: 0.95rem;
  line-height: 1.5;
  color: var(--text-secondary);
  max-width: 380px;
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
  font-size: 0.9rem;
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

.vk-about-footer {
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
