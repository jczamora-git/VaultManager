<template>
  <button
    type="button"
    role="switch"
    :aria-checked="modelValue"
    class="vk-vault-toggle"
    :class="{ 'is-checked': modelValue }"
    @click="toggle"
  >
    <span class="vk-toggle-thumb"></span>
  </button>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void;
  (e: 'change', val: boolean): void;
}>();

function toggle() {
  const newVal = !props.modelValue;
  emit('update:modelValue', newVal);
  emit('change', newVal);
}
</script>

<style scoped>
.vk-vault-toggle {
  width: 48px;
  height: 28px;
  background-color: var(--vk-toggle-off-track);
  border-radius: 9999px;
  border: none;
  padding: 2px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  position: relative;
  transition: background-color 0.25s ease;
  user-select: none;
  flex-shrink: 0;
}

.vk-vault-toggle.is-checked {
  background-color: var(--vk-toggle-on-track);
}

.vk-toggle-thumb {
  width: 24px;
  height: 24px;
  background-color: #FFFFFF;
  border-radius: 50%;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  transform: translateX(0);
}

.vk-vault-toggle.is-checked .vk-toggle-thumb {
  transform: translateX(20px);
}
</style>
