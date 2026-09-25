<template>
  <div class="vk-settings-section">
    <div class="vk-settings-section-header" :class="{ 'text-danger': danger }">
      {{ title }}
    </div>
    <div class="vk-settings-section-body">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  danger?: boolean;
}>();
</script>

<style scoped>
.vk-settings-section {
  margin-bottom: 24px;
}

.vk-settings-section-header {
  font-size: 0.725rem;
  font-weight: 800;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 8px;
  padding: 0 4px;
}

.vk-settings-section-body {
  display: flex;
  flex-direction: column;
}

.text-danger {
  color: var(--brand-red) !important;
}
</style>
