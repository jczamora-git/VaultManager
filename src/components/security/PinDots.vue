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
      class="vk-pin-dot"
      :class="{ 'is-filled': index <= filledCount }"
    ></div>
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
  gap: 16px;
  margin: 0 auto;
  user-select: none;
}

.vk-pin-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #E2DED9;
  transition: all 0.16s ease;
  transform: scale(1);
}

.vk-pin-dot.is-filled {
  background: #B82825;
  transform: scale(1.15);
}

/* Dark theme dots */
:global(.dark) .vk-pin-dot,
:global(.ion-palette-dark) .vk-pin-dot,
:global(body.dark-theme) .vk-pin-dot {
  background: #333333;
}

:global(.dark) .vk-pin-dot.is-filled,
:global(.ion-palette-dark) .vk-pin-dot.is-filled,
:global(body.dark-theme) .vk-pin-dot.is-filled {
  background: #D3332F;
}

/* Subtle horizontal shake animation */
.is-shaking {
  animation: vk-dot-shake 0.38s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

@keyframes vk-dot-shake {
  10%, 90% { transform: translate3d(-3px, 0, 0); }
  20%, 80% { transform: translate3d(5px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-6px, 0, 0); }
  40%, 60% { transform: translate3d(6px, 0, 0); }
}
</style>
