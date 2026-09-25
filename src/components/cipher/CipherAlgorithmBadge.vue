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
  background: #F1EFEC;
  border-radius: 18px;
  padding: 14px 16px;
  margin-bottom: 20px;
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.dark .vk-cipher-info-box {
  background: #1E1E1E;
  border-color: rgba(255, 255, 255, 0.06);
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
