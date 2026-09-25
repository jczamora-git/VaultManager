<template>
  <div class="vk-section-header">
    <div class="vk-section-title-wrap">
      <h2 class="vk-section-title">{{ title }}</h2>
      <span v-if="count !== undefined" class="vk-section-count">
        {{ count }}
      </span>
    </div>
    <div class="vk-section-actions">
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  count?: number;
}>();
</script>

<style scoped>
.vk-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 20px 0 10px 0;
  padding: 0 2px;
}

.vk-section-title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.vk-section-title {
  font-size: 0.8rem;
  font-weight: 800;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin: 0;
}

.vk-section-count {
  font-size: 0.725rem;
  font-weight: 700;
  background: var(--surface-light);
  color: var(--text-secondary);
  padding: 1px 7px;
  border-radius: var(--radius-pill);
}

.vk-section-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
