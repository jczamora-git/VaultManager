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
  gap: 13px;
  margin: 0 auto;
  user-select: none;
}

.vk-pin-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #DCD7D2;
  opacity: 0.7;
  transform: scale(0.8);
  transition: transform 120ms var(--vk-ease-enter),
              opacity 120ms var(--vk-ease-enter),
              background-color 120ms ease;
}

.vk-pin-dot.is-filled {
  background: #C52A27;
  opacity: 1;
  transform: scale(1);
}

/* Dark theme dots */
:global(.dark) .vk-pin-dot,
:global(.ion-palette-dark) .vk-pin-dot,
:global(body.dark-theme) .vk-pin-dot {
  background: #3A3A3A;
  opacity: 0.8;
}

:global(.dark) .vk-pin-dot.is-filled,
:global(.ion-palette-dark) .vk-pin-dot.is-filled,
:global(body.dark-theme) .vk-pin-dot.is-filled {
  background: #D3332F;
  opacity: 1;
}

/* Precise horizontal shake animation (dots only) */
.is-shaking {
  animation: vk-dot-shake 260ms cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

@keyframes vk-dot-shake {
  0% { transform: translateX(0); }
  20% { transform: translateX(-6px); }
  40% { transform: translateX(5px); }
  60% { transform: translateX(-3px); }
  80% { transform: translateX(2px); }
  100% { transform: translateX(0); }
}
</style>
