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
  opacity: 0.45;
  transform: scale(0.75);
  transition: transform var(--vk-motion-base) var(--vk-ease-enter),
              opacity var(--vk-motion-base) var(--vk-ease-enter),
              background-color var(--vk-motion-base) ease;
}

.vk-pin-dot.is-filled {
  background: #B82825;
  opacity: 1;
  transform: scale(1);
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

/* Precise horizontal shake animation */
.is-shaking {
  animation: vk-dot-shake 280ms cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

@keyframes vk-dot-shake {
  0% { transform: translateX(0); }
  20% { transform: translateX(-7px); }
  40% { transform: translateX(6px); }
  60% { transform: translateX(-4px); }
  80% { transform: translateX(3px); }
  100% { transform: translateX(0); }
}
</style>
