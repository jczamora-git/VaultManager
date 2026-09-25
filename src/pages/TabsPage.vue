<template>
  <ion-page>
    <ion-router-outlet></ion-router-outlet>
    <!-- Floating Navigation Dock -->
    <FloatingDock />
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonRouterOutlet } from '@ionic/vue';
import FloatingDock from '@/components/navigation/FloatingDock.vue';
</script>
