<template>
  <div class="vk-settings-row" :class="{ 'is-clickable': clickable }" @click="handleClick">
    <div class="vk-settings-row-left">
      <span class="vk-settings-row-title" :class="{ 'text-danger': danger }">{{ label }}</span>
      <span v-if="sublabel" class="vk-settings-row-sub">{{ sublabel }}</span>
    </div>
    <div class="vk-settings-row-right">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    label: string;
    sublabel?: string;
    clickable?: boolean;
    danger?: boolean;
  }>(),
  {
    clickable: false,
    danger: false,
  }
);

const emit = defineEmits<{
  (e: 'click'): void;
}>();

function handleClick() {
  if (props.clickable) {
    emit('click');
  }
}
</script>

<style scoped>
.vk-settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 58px;
  padding: 14px 4px;
  border-bottom: 1px solid var(--vk-divider);
  gap: 16px;
}

.vk-settings-row:last-child {
  border-bottom: none;
}

.vk-settings-row.is-clickable {
  cursor: pointer;
}

.vk-settings-row.is-clickable:hover {
  opacity: 0.85;
}

.vk-settings-row-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.vk-settings-row-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.01em;
}

.vk-settings-row-sub {
  font-size: 0.775rem;
  color: var(--text-secondary);
}

.vk-settings-row-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.text-danger {
  color: var(--brand-red) !important;
}
</style>
