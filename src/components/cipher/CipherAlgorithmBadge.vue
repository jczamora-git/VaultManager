<template>
  <div class="vk-cipher-info-box">
    <div class="vk-cipher-badge-row">
      <span class="vk-cipher-name">{{ algorithm.name }}</span>
      <span class="vk-badge" :class="`vk-badge-${algorithm.badgeColor}`">
        {{ algorithm.badge }}
      </span>
    </div>
    <p class="vk-cipher-desc">{{ algorithm.description }}</p>
  </div>
</template>

<script setup lang="ts">
import { CipherAlgorithmInfo } from '@/models/cipher.model';

defineProps<{
  algorithm: CipherAlgorithmInfo;
}>();
</script>

<style scoped>
.vk-cipher-info-box {
  background: var(--surface-light);
  border-radius: var(--radius-md);
  padding: 14px 16px;
  margin-bottom: 20px;
}

.vk-cipher-badge-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.vk-cipher-name {
  font-weight: 800;
  font-size: 0.95rem;
  color: var(--text-primary);
  letter-spacing: -0.01em;
}

.vk-cipher-desc {
  font-size: 0.8rem;
  color: var(--text-secondary);
  line-height: 1.45;
  margin: 0;
}
</style>
