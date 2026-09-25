<template>
  <div class="vk-empty-state">
    <div class="vk-empty-icon-wrap">
      <slot name="icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.75"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </slot>
    </div>

    <h3 class="vk-empty-title">{{ title }}</h3>
    <p class="vk-empty-description" v-if="description">{{ description }}</p>

    <div class="vk-empty-actions" v-if="$slots.action || actionLabel">
      <slot name="action">
        <button v-if="actionLabel" type="button" class="vk-btn vk-btn-primary" @click="$emit('action')">
          {{ actionLabel }}
        </button>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  description?: string;
  actionLabel?: string;
}>();

defineEmits<{
  (e: 'action'): void;
}>();
</script>

<style scoped>
.vk-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px 16px;
  max-width: 380px;
  margin: 0 auto;
}

.vk-empty-icon-wrap {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--surface-light);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  color: var(--text-secondary);
}

.vk-empty-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 6px 0;
  letter-spacing: -0.01em;
}

.vk-empty-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0 0 20px 0;
}

.vk-empty-actions {
  display: flex;
  gap: 10px;
}
</style>
