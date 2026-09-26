<template>
  <ion-modal
    :is-open="isOpen"
    @didDismiss="handleDismiss"
    class="vk-delete-modal"
  >
    <div class="vk-delete-modal-card">
      <!-- Top Right Circular Close Button -->
      <button
        type="button"
        class="vk-delete-close-btn"
        @click="handleClose"
        aria-label="Close delete confirmation"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
        </svg>
      </button>

      <!-- Soft Red Trash Icon Circle -->
      <div class="vk-delete-icon-circle">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C62825" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 6h18"/>
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          <line x1="10" x2="10" y1="11" y2="17"/>
          <line x1="14" x2="14" y1="11" y2="17"/>
        </svg>
      </div>

      <!-- Title -->
      <h3 class="vk-delete-title">Delete Login?</h3>

      <!-- Description -->
      <p class="vk-delete-desc">
        This will permanently remove <span class="vk-delete-target-name">“{{ credential?.title || 'this item' }}”</span> from your vault.
      </p>

      <!-- Swipe to Delete Slider Track -->
      <div
        ref="trackRef"
        class="vk-swipe-delete-track"
        :class="{ 'is-deleting': isDeleting }"
      >
        <!-- Dynamic Progress Fill -->
        <div
          class="vk-swipe-delete-fill"
          :style="{ width: `${dragX + 28}px` }"
        />

        <!-- Centered Label -->
        <span
          class="vk-swipe-delete-label"
          :style="{ opacity: Math.max(0, 1 - progress * 1.5) }"
        >
          {{ isDeleting ? 'Deleting…' : 'Swipe to Delete' }}
        </span>

        <!-- Draggable Handle Knob -->
        <div
          ref="handleRef"
          class="vk-swipe-delete-handle"
          :style="handleStyle"
          @pointerdown="onPointerDown"
          @pointermove="onPointerMove"
          @pointerup="onPointerUp"
          @pointercancel="onPointerCancel"
          role="button"
          tabindex="0"
          :aria-label="`Swipe to permanently delete ${credential?.title || 'credential'}`"
          @keydown.enter.prevent="handleAccessibleDelete"
          @keydown.space.prevent="handleAccessibleDelete"
        >
          <svg v-if="!isDeleting" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 6h18"/>
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            <line x1="10" x2="10" y1="11" y2="17"/>
            <line x1="14" x2="14" y1="11" y2="17"/>
          </svg>
          <div v-else class="vk-swipe-delete-spinner" />
        </div>
      </div>

      <!-- Screen Reader / Accessible Fallback Action -->
      <button
        type="button"
        class="vk-sr-only"
        @click="handleAccessibleDelete"
      >
        Confirm permanent deletion of {{ credential?.title }}
      </button>
    </div>
  </ion-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import { IonModal } from '@ionic/vue';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Credential } from '@/models/credential.model';

const props = defineProps<{
  isOpen: boolean;
  credential: Credential | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'confirm'): void;
}>();

const trackRef = ref<HTMLElement | null>(null);
const handleRef = ref<HTMLElement | null>(null);

const dragX = ref(0);
const isDragging = ref(false);
const isDeleting = ref(false);
const trackWidth = ref(300);

const HANDLE_SIZE = 48;
const PADDING = 4;

const maxDrag = computed(() => {
  return Math.max(0, trackWidth.value - HANDLE_SIZE - PADDING * 2);
});

const progress = computed(() => {
  if (maxDrag.value <= 0) return 0;
  return Math.min(1, Math.max(0, dragX.value / maxDrag.value));
});

const threshold = computed(() => {
  return maxDrag.value * 0.82;
});

const handleStyle = computed(() => {
  return {
    transform: `translateX(${dragX.value}px)`,
    transition: isDragging.value ? 'none' : 'transform 200ms cubic-bezier(0.2, 0.8, 0.2, 1)',
  };
});

let startX = 0;

function updateTrackWidth() {
  if (trackRef.value) {
    trackWidth.value = trackRef.value.clientWidth || 300;
  }
}

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      dragX.value = 0;
      isDragging.value = false;
      isDeleting.value = false;
      nextTick(() => {
        updateTrackWidth();
      });
    }
  }
);

onMounted(() => {
  updateTrackWidth();
});

function triggerHaptic() {
  try {
    Haptics.impact({ style: ImpactStyle.Medium });
  } catch {}
}

function onPointerDown(e: PointerEvent) {
  if (isDeleting.value) return;
  if (e.button !== 0 && e.pointerType === 'mouse') return;

  updateTrackWidth();
  isDragging.value = true;
  startX = e.clientX - dragX.value;

  if (handleRef.value && e.pointerId) {
    try {
      handleRef.value.setPointerCapture(e.pointerId);
    } catch {}
  }
}

function onPointerMove(e: PointerEvent) {
  if (!isDragging.value || isDeleting.value) return;

  const currentX = e.clientX - startX;
  dragX.value = Math.max(0, Math.min(maxDrag.value, currentX));
}

function onPointerUp(e: PointerEvent) {
  if (handleRef.value && e.pointerId) {
    try {
      handleRef.value.releasePointerCapture(e.pointerId);
    } catch {}
  }
  finishDrag();
}

function onPointerCancel(e: PointerEvent) {
  if (handleRef.value && e.pointerId) {
    try {
      handleRef.value.releasePointerCapture(e.pointerId);
    } catch {}
  }
  finishDrag();
}

function finishDrag() {
  if (!isDragging.value) return;
  isDragging.value = false;

  if (dragX.value >= threshold.value) {
    // Snap to end & confirm deletion
    dragX.value = maxDrag.value;
    triggerHaptic();
    isDeleting.value = true;
    emit('confirm');
  } else {
    // Snap back to origin
    dragX.value = 0;
  }
}

function handleAccessibleDelete() {
  if (isDeleting.value) return;
  dragX.value = maxDrag.value;
  triggerHaptic();
  isDeleting.value = true;
  emit('confirm');
}

function handleClose() {
  if (isDeleting.value) return;
  emit('close');
}

function handleDismiss() {
  if (!isDragging.value) {
    handleClose();
  }
}
</script>

<style scoped>
/* Modal host styling */
ion-modal.vk-delete-modal {
  --width: calc(100% - 32px);
  --max-width: 380px;
  --height: auto;
  --border-radius: 24px;
  --box-shadow: 0 16px 48px rgba(0, 0, 0, 0.28);
  --backdrop-opacity: 0.45;
  --background: #FFFFFF;
}

:global(.dark) ion-modal.vk-delete-modal,
:global(.ion-palette-dark) ion-modal.vk-delete-modal,
:global(body.dark-theme) ion-modal.vk-delete-modal,
:global([data-theme="dark"]) ion-modal.vk-delete-modal {
  --background: #181818;
}

/* Card Content Container */
.vk-delete-modal-card {
  position: relative;
  padding: 24px 22px 22px 22px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background: #FFFFFF;
  border-radius: 24px;
  box-sizing: border-box;
  width: 100%;
}

:global(.dark) .vk-delete-modal-card,
:global(.ion-palette-dark) .vk-delete-modal-card,
:global(body.dark-theme) .vk-delete-modal-card,
:global([data-theme="dark"]) .vk-delete-modal-card {
  background: #181818;
  border: 1px solid rgba(255, 255, 255, 0.07);
}

/* Close Button (Top Right) */
.vk-delete-close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #F3F1EE;
  color: #555555;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: background 150ms ease, transform 120ms ease;
  -webkit-tap-highlight-color: transparent;
  z-index: 10;
}

.vk-delete-close-btn:hover {
  background: #E8E5E0;
}

.vk-delete-close-btn:active {
  transform: scale(0.94);
}

:global(.dark) .vk-delete-close-btn,
:global(.ion-palette-dark) .vk-delete-close-btn,
:global(body.dark-theme) .vk-delete-close-btn,
:global([data-theme="dark"]) .vk-delete-close-btn {
  background: #242424;
  color: #F5F5F5;
}

:global(.dark) .vk-delete-close-btn:hover,
:global(.ion-palette-dark) .vk-delete-close-btn:hover,
:global(body.dark-theme) .vk-delete-close-btn:hover,
:global([data-theme="dark"]) .vk-delete-close-btn:hover {
  background: #2E2E2E;
}

/* Icon Circle */
.vk-delete-icon-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(198, 40, 37, 0.10);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  margin-top: 4px;
}

/* Title */
.vk-delete-title {
  font-size: 1.3rem; /* ~21px */
  font-weight: 800;
  color: #151515;
  margin: 0 0 8px 0;
  letter-spacing: -0.01em;
}

:global(.dark) .vk-delete-title,
:global(.ion-palette-dark) .vk-delete-title,
:global(body.dark-theme) .vk-delete-title,
:global([data-theme="dark"]) .vk-delete-title {
  color: #F5F5F5;
}

/* Description */
.vk-delete-desc {
  font-size: 0.88rem; /* ~14px */
  color: #777777;
  line-height: 1.45;
  margin: 0 0 24px 0;
  max-width: 290px;
}

.vk-delete-target-name {
  font-weight: 700;
  color: #151515;
}

:global(.dark) .vk-delete-desc,
:global(.ion-palette-dark) .vk-delete-desc,
:global(body.dark-theme) .vk-delete-desc,
:global([data-theme="dark"]) .vk-delete-desc {
  color: #999999;
}

:global(.dark) .vk-delete-target-name,
:global(.ion-palette-dark) .vk-delete-target-name,
:global(body.dark-theme) .vk-delete-target-name,
:global([data-theme="dark"]) .vk-delete-target-name {
  color: #F5F5F5;
}

/* Swipe Track */
.vk-swipe-delete-track {
  position: relative;
  width: 100%;
  height: 56px;
  border-radius: 999px;
  background: rgba(198, 40, 37, 0.09);
  border: 1px solid rgba(198, 40, 37, 0.14);
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
  touch-action: pan-y;
}

:global(.dark) .vk-swipe-delete-track,
:global(.ion-palette-dark) .vk-swipe-delete-track,
:global(body.dark-theme) .vk-swipe-delete-track,
:global([data-theme="dark"]) .vk-swipe-delete-track {
  background: rgba(211, 51, 47, 0.14);
  border-color: rgba(211, 51, 47, 0.22);
}

/* Dynamic Progress Fill */
.vk-swipe-delete-fill {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  background: rgba(198, 40, 37, 0.18);
  pointer-events: none;
  border-radius: 999px 0 0 999px;
}

/* Centered Label */
.vk-swipe-delete-label {
  position: absolute;
  color: #C62825;
  font-size: 0.9rem; /* ~14.5px */
  font-weight: 700;
  letter-spacing: 0.01em;
  pointer-events: none;
  user-select: none;
  transition: opacity 80ms ease;
  z-index: 1;
}

:global(.dark) .vk-swipe-delete-label,
:global(.ion-palette-dark) .vk-swipe-delete-label,
:global(body.dark-theme) .vk-swipe-delete-label,
:global([data-theme="dark"]) .vk-swipe-delete-label {
  color: #E54D4A;
}

/* Draggable Handle Knob */
.vk-swipe-delete-handle {
  position: absolute;
  left: 4px;
  top: 3px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #C62825;
  box-shadow: 0 4px 12px rgba(198, 40, 37, 0.38);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  z-index: 2;
  -webkit-tap-highlight-color: transparent;
}

.vk-swipe-delete-handle:active {
  cursor: grabbing;
}

/* Spinner during active deletion */
.vk-swipe-delete-spinner {
  width: 20px;
  height: 20px;
  border: 2.5px solid rgba(255, 255, 255, 0.3);
  border-top-color: #FFFFFF;
  border-radius: 50%;
  animation: vk-spin 700ms linear infinite;
}

@keyframes vk-spin {
  to {
    transform: rotate(360deg);
  }
}

/* Accessible screen-reader only class */
.vk-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>
