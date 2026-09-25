<template>
  <div
    class="vk-pin-dots"
    :class="{ 'is-shaking': hasError }"
    role="status"
    :aria-label="`${filledCount} of ${length} digits entered`"
  >
    <div
      v-for="index in length"
      :key="index"
      class="vk-pin-circle"
      :class="{ 'is-filled': index <= filledCount }"
    >
      <div class="vk-pin-inner-dot"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    length?: number;
    filledCount: number;
    hasError?: boolean;
  }>(),
  {
    length: 6,
    hasError: false,
  }
);
</script>

<style scoped>
.vk-pin-dots {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(8px, 2.5vw, 12px);
  margin: 0 auto;
  user-select: none;
}

.vk-pin-circle {
  width: clamp(34px, 9vw, 40px);
  height: clamp(34px, 9vw, 40px);
  border-radius: 50%;
  background: #FFFFFF;
  border: 1.5px solid rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
  transition: transform 120ms var(--vk-ease-enter),
              box-shadow 120ms ease;
}

.vk-pin-inner-dot {
  width: clamp(8px, 2.2vw, 10px);
  height: clamp(8px, 2.2vw, 10px);
  border-radius: 50%;
  background: var(--brand-red, #B82825);
  transform: scale(0);
  opacity: 0;
  transition: transform 140ms var(--vk-ease-enter),
              opacity 140ms var(--vk-ease-enter);
}

.vk-pin-circle.is-filled .vk-pin-inner-dot {
  transform: scale(1);
  opacity: 1;
}

/* Shake animation (PIN indicators only) */
.is-shaking {
  animation: vk-dot-shake 320ms cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

@keyframes vk-dot-shake {
  0%, 100% { transform: translateX(0); }
  15% { transform: translateX(-9px); }
  30% { transform: translateX(8px); }
  45% { transform: translateX(-6px); }
  60% { transform: translateX(5px); }
  75% { transform: translateX(-2px); }
}

@media (max-height: 720px) {
  .vk-pin-circle {
    width: 32px;
    height: 32px;
  }
  .vk-pin-inner-dot {
    width: 9px;
    height: 9px;
  }
}
</style>
