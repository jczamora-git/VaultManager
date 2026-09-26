<template>
  <ion-header class="ion-no-border vk-app-header" :class="{ 'is-contrast': isContrast }">
    <ion-toolbar>
      <ion-buttons slot="start" v-if="showBack">
        <ion-back-button :default-href="defaultBackHref" text="" class="vk-back-btn"></ion-back-button>
      </ion-buttons>

      <ion-title>
        <div class="vk-header-title-wrap">
          <slot name="title">
            <span class="vk-header-title">{{ title }}</span>
          </slot>
        </div>
      </ion-title>

      <ion-buttons slot="end">
        <slot name="actions"></slot>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
</template>

<script setup lang="ts">
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton } from '@ionic/vue';

defineProps<{
  title?: string;
  showBack?: boolean;
  defaultBackHref?: string;
  isContrast?: boolean;
}>();
</script>

<style scoped>
.vk-app-header {
  background: transparent;
}

ion-toolbar {
  --background: var(--canvas);
  --color: var(--text-primary);
  --border-width: 0;
}

.vk-header-title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.vk-header-title {
  font-weight: 800;
  font-size: 1.15rem;
  letter-spacing: -0.02em;
  color: var(--text-primary);
}

.vk-back-btn {
  --color: var(--text-primary);
}

.is-contrast {
  color: #ffffff;
}

.is-contrast .vk-header-title {
  color: #ffffff;
}

.is-contrast .vk-back-btn {
  --color: #ffffff;
}
</style>
