<template>
  <div class="vk-swipe-wrapper" :class="{ 'is-open': isOpen }">
    <!-- REVEALED EDIT ACTION (LEFT SIDE) -->
    <button
      type="button"
      class="vk-swipe-action-btn vk-swipe-action-edit"
      :class="{ 'is-visible': showEditAction }"
      aria-label="Edit login"
      @click.stop="handleEditClick"
    >
      <div class="vk-swipe-action-inner">
        <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
          <path d="m15 5 4 4"/>
        </svg>
        <span class="vk-swipe-action-label">EDIT</span>
      </div>
    </button>

    <!-- REVEALED DELETE ACTION (RIGHT SIDE) -->
    <button
      type="button"
      class="vk-swipe-action-btn vk-swipe-action-delete"
      :class="{ 'is-visible': showDeleteAction }"
      aria-label="Delete login"
      @click.stop="handleDeleteClick"
    >
      <div class="vk-swipe-action-inner">
        <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 6h18"/>
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          <line x1="10" x2="10" y1="11" y2="17"/>
          <line x1="14" x2="14" y1="11" y2="17"/>
        </svg>
        <span class="vk-swipe-action-label">DELETE</span>
      </div>
    </button>

    <!-- FOREGROUND CREDENTIAL CARD -->
    <div
      ref="cardRef"
      class="vk-credential-card"
      :class="{
        'is-open-edit': isEditActive,
        'is-open-delete': isDeleteActive
      }"
      :style="cardStyle"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerCancel"
      @click="handleCardClick"
    >
      <!-- Logo / Icon -->
      <CredentialIcon
        :title="credential.title"
        :domain="credential.domain"
        :website="credential.website"
        :size="44"
        :radius="13"
      />

      <!-- Credential Info -->
      <div class="vk-card-info">
        <div class="vk-card-title-row">
          <span class="vk-card-title">{{ credential.title }}</span>
        </div>
        <div class="vk-card-secondary-row">
          <span v-if="credential.email" class="vk-card-subtext">{{ credential.email }}</span>
          <span v-else-if="credential.username" class="vk-card-subtext">{{ credential.username }}</span>
          <span v-else-if="credential.domain" class="vk-card-subtext">{{ credential.domain }}</span>
          <span v-else class="vk-card-subtext vk-card-muted">Password account</span>
        </div>
      </div>

      <!-- Favorite Star & Chevron Navigation Affordance -->
      <div class="vk-card-trailing-actions">
        <button
          type="button"
          class="vk-card-star-btn"
          :class="{ 'is-favorite': credential.favorite }"
          :title="credential.favorite ? 'Remove from favorites' : 'Mark as favorite'"
          @pointerdown.stop
          @click.stop="$emit('toggle-favorite', credential.id)"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            :fill="credential.favorite ? 'var(--brand-red, #D3332F)' : 'none'"
            :stroke="credential.favorite ? 'var(--brand-red, #D3332F)' : 'currentColor'"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>

        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="vk-card-chevron"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Credential } from '@/models/credential.model';
import CredentialIcon from '@/components/common/CredentialIcon.vue';

const props = defineProps<{
  credential: Credential;
  isOpen?: boolean;
  openSide?: 'edit' | 'delete' | null;
}>();

const emit = defineEmits<{
  (e: 'select', id: string): void;
  (e: 'toggle-favorite', id: string): void;
  (e: 'edit', item: Credential): void;
  (e: 'delete', item: Credential): void;
  (e: 'open-change', payload: { id: string; isOpen: boolean; side: 'edit' | 'delete' | null }): void;
}>();

const ACTION_WIDTH = 80;
const SNAP_THRESHOLD = 38;
const MAX_RUBBER_BAND = 88;
const ACTION_REVEAL_THRESHOLD = 4;

const cardRef = ref<HTMLElement | null>(null);
const translateX = ref(0);
const isDragging = ref(false);
const hasSwiped = ref(false);

const isAnimatingClose = ref(false);
const closingSide = ref<'edit' | 'delete' | null>(null);

let startX = 0;
let startY = 0;
let startTranslateX = 0;
let isTracking = false;
let isHorizontalGesture = false;
let hasTriggeredHaptic = false;

// Reveal Edit layer only when swiping right (>4px) or snapped open to edit
const showEditAction = computed(() => {
  if (translateX.value > ACTION_REVEAL_THRESHOLD) return true;
  if (props.isOpen && props.openSide === 'edit') return true;
  if (isAnimatingClose.value && closingSide.value === 'edit') return true;
  return false;
});

// Reveal Delete layer only when swiping left (<-4px) or snapped open to delete
const showDeleteAction = computed(() => {
  if (translateX.value < -ACTION_REVEAL_THRESHOLD) return true;
  if (props.isOpen && props.openSide === 'delete') return true;
  if (isAnimatingClose.value && closingSide.value === 'delete') return true;
  return false;
});

const isEditActive = computed(() => translateX.value > 0 || (props.isOpen && props.openSide === 'edit'));
const isDeleteActive = computed(() => translateX.value < 0 || (props.isOpen && props.openSide === 'delete'));

const cardStyle = computed(() => {
  return {
    transform: `translateX(${translateX.value}px)`,
    transition: isDragging.value ? 'none' : 'transform 180ms cubic-bezier(0.2, 0.8, 0.2, 1)',
  };
});

// Sync external isOpen prop changes
watch(
  () => [props.isOpen, props.openSide] as const,
  ([open, side], prev) => {
    const prevOpen = prev ? prev[0] : false;
    const prevSide = prev ? prev[1] : null;

    if (!open) {
      if (prevOpen && prevSide) {
        closingSide.value = prevSide;
        isAnimatingClose.value = true;
        setTimeout(() => {
          if (translateX.value === 0) {
            isAnimatingClose.value = false;
            closingSide.value = null;
          }
        }, 200);
      }
      translateX.value = 0;
    } else if (side === 'edit') {
      isAnimatingClose.value = false;
      closingSide.value = null;
      translateX.value = ACTION_WIDTH;
    } else if (side === 'delete') {
      isAnimatingClose.value = false;
      closingSide.value = null;
      translateX.value = -ACTION_WIDTH;
    }
  },
  { immediate: true }
);

function triggerLightHaptic() {
  try {
    Haptics.impact({ style: ImpactStyle.Light });
  } catch {}
}

function onPointerDown(e: PointerEvent) {
  if (e.button !== 0 && e.pointerType === 'mouse') return;

  isTracking = true;
  isHorizontalGesture = false;
  hasSwiped.value = false;
  hasTriggeredHaptic = false;
  isAnimatingClose.value = false;
  closingSide.value = null;
  startX = e.clientX;
  startY = e.clientY;
  startTranslateX = translateX.value;
}

function onPointerMove(e: PointerEvent) {
  if (!isTracking) return;

  const deltaX = e.clientX - startX;
  const deltaY = e.clientY - startY;

  // Determine gesture direction early
  if (!isHorizontalGesture) {
    if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 8) {
      // Vertical scrolling takes precedence
      isTracking = false;
      return;
    }
    if (Math.abs(deltaX) > 8) {
      isHorizontalGesture = true;
      isDragging.value = true;
      hasSwiped.value = true;
      // Capture pointer for smooth dragging
      if (cardRef.value && e.pointerId) {
        try {
          cardRef.value.setPointerCapture(e.pointerId);
        } catch {}
      }
    }
  }

  if (isHorizontalGesture) {
    const rawTarget = startTranslateX + deltaX;

    // Constrain translation strictly with subtle rubber-band resistance
    if (rawTarget > ACTION_WIDTH) {
      const extra = rawTarget - ACTION_WIDTH;
      translateX.value = Math.min(MAX_RUBBER_BAND, ACTION_WIDTH + extra * 0.08);
    } else if (rawTarget < -ACTION_WIDTH) {
      const extra = rawTarget - (-ACTION_WIDTH);
      translateX.value = Math.max(-MAX_RUBBER_BAND, -ACTION_WIDTH + extra * 0.08);
    } else {
      translateX.value = rawTarget;
    }

    // Single haptic feedback when crossing threshold
    if (!hasTriggeredHaptic && Math.abs(translateX.value) >= SNAP_THRESHOLD) {
      triggerLightHaptic();
      hasTriggeredHaptic = true;
    }
  }
}

function finishGesture() {
  if (!isTracking && !isHorizontalGesture) return;

  isTracking = false;
  isDragging.value = false;

  if (isHorizontalGesture) {
    if (translateX.value >= SNAP_THRESHOLD) {
      // Snap fully open to Edit (+80px)
      translateX.value = ACTION_WIDTH;
      isAnimatingClose.value = false;
      closingSide.value = null;
      emit('open-change', { id: props.credential.id, isOpen: true, side: 'edit' });
    } else if (translateX.value <= -SNAP_THRESHOLD) {
      // Snap fully open to Delete (-80px)
      translateX.value = -ACTION_WIDTH;
      isAnimatingClose.value = false;
      closingSide.value = null;
      emit('open-change', { id: props.credential.id, isOpen: true, side: 'delete' });
    } else {
      // Snap closed
      const prevDirection = translateX.value > 0 ? 'edit' : translateX.value < 0 ? 'delete' : null;
      if (prevDirection) {
        closingSide.value = prevDirection;
        isAnimatingClose.value = true;
        setTimeout(() => {
          if (translateX.value === 0) {
            isAnimatingClose.value = false;
            closingSide.value = null;
          }
        }, 200);
      }
      translateX.value = 0;
      emit('open-change', { id: props.credential.id, isOpen: false, side: null });
    }

    // Keep hasSwiped true briefly to prevent accidental tap navigation
    setTimeout(() => {
      hasSwiped.value = false;
      isHorizontalGesture = false;
    }, 100);
  }
}

function onPointerUp(e: PointerEvent) {
  if (cardRef.value && e.pointerId) {
    try {
      cardRef.value.releasePointerCapture(e.pointerId);
    } catch {}
  }
  finishGesture();
}

function onPointerCancel(e: PointerEvent) {
  if (cardRef.value && e.pointerId) {
    try {
      cardRef.value.releasePointerCapture(e.pointerId);
    } catch {}
  }
  finishGesture();
}

function handleCardClick() {
  if (hasSwiped.value) return;

  if (props.isOpen || translateX.value !== 0) {
    // If card was open, clicking it simply closes it
    close();
    return;
  }

  // Normal tap opens credential detail
  emit('select', props.credential.id);
}

function handleEditClick() {
  close();
  emit('edit', props.credential);
}

function handleDeleteClick() {
  emit('delete', props.credential);
}

function close() {
  const prevDirection = translateX.value > 0 ? 'edit' : translateX.value < 0 ? 'delete' : props.openSide || null;
  if (prevDirection) {
    closingSide.value = prevDirection;
    isAnimatingClose.value = true;
    setTimeout(() => {
      if (translateX.value === 0) {
        isAnimatingClose.value = false;
        closingSide.value = null;
      }
    }, 200);
  }
  translateX.value = 0;
  emit('open-change', { id: props.credential.id, isOpen: false, side: null });
}

defineExpose({
  close,
});
</script>

<style scoped>
.vk-swipe-wrapper {
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  margin-bottom: 9px;
  width: 100%;
  background: transparent;
  user-select: none;
  -webkit-user-select: none;
  touch-action: pan-y;
}

/* REVEALED ACTION BUTTONS (BEHIND CARD) */
.vk-swipe-action-btn {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 80px;
  border: none;
  cursor: pointer;
  outline: none;
  padding: 0;
  margin: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  -webkit-tap-highlight-color: transparent;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition: opacity 100ms ease, visibility 100ms ease;
}

.vk-swipe-action-btn.is-visible {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
}

.vk-swipe-action-edit {
  left: 0;
  border-radius: 16px 0 0 16px;
  background: #F5F1EE;
  color: #C62825;
}

:global(.dark) .vk-swipe-action-edit,
:global(.ion-palette-dark) .vk-swipe-action-edit,
:global(body.dark-theme) .vk-swipe-action-edit,
:global([data-theme="dark"]) .vk-swipe-action-edit {
  background: #242424 !important;
  color: #D3332F !important;
}

.vk-swipe-action-delete {
  right: 0;
  border-radius: 0 16px 16px 0;
  background: #C62825;
  color: #FFFFFF;
}

:global(.dark) .vk-swipe-action-delete,
:global(.ion-palette-dark) .vk-swipe-action-delete,
:global(body.dark-theme) .vk-swipe-action-delete,
:global([data-theme="dark"]) .vk-swipe-action-delete {
  background: #D3332F !important;
  color: #FFFFFF !important;
}

.vk-swipe-action-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 100%;
  height: 100%;
}

.vk-swipe-action-label {
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

/* FOREGROUND CREDENTIAL CARD */
.vk-credential-card {
  position: relative;
  z-index: 2;
  width: 100%;
  min-height: 64px;
  background: #FFFFFF;
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.025);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  cursor: pointer;
  will-change: transform, border-radius;
  transition: background-color 140ms ease, border-color 140ms ease, border-radius 120ms ease;
}

.vk-credential-card.is-open-edit {
  border-radius: 0 16px 16px 0 !important;
}

.vk-credential-card.is-open-delete {
  border-radius: 16px 0 0 16px !important;
}

@media (hover: hover) {
  .vk-credential-card:hover {
    background: #F8F8F6;
  }
}

.vk-credential-card:active {
  background: #EFEFEA;
}

:global(.dark) .vk-credential-card,
:global(.ion-palette-dark) .vk-credential-card,
:global(body.dark-theme) .vk-credential-card,
:global([data-theme="dark"]) .vk-credential-card {
  background: #181818 !important;
  border-color: rgba(255, 255, 255, 0.06) !important;
  box-shadow: none !important;
}

@media (hover: hover) {
  :global(.dark) .vk-credential-card:hover,
  :global(.ion-palette-dark) .vk-credential-card:hover,
  :global(body.dark-theme) .vk-credential-card:hover,
  :global([data-theme="dark"]) .vk-credential-card:hover {
    background: #202020 !important;
  }
}

:global(.dark) .vk-credential-card:active,
:global(.ion-palette-dark) .vk-credential-card:active,
:global(body.dark-theme) .vk-credential-card:active,
:global([data-theme="dark"]) .vk-credential-card:active {
  background: #252525 !important;
}

/* CARD INFO */
.vk-card-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.vk-card-title-row {
  display: flex;
  align-items: center;
}

.vk-card-title {
  font-size: 0.95rem; /* ~15px */
  font-weight: 700;
  color: var(--text-primary, #151515);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.01em;
}

:global(.dark) .vk-card-title,
:global(.ion-palette-dark) .vk-card-title,
:global(body.dark-theme) .vk-card-title,
:global([data-theme="dark"]) .vk-card-title {
  color: #F5F5F5 !important;
}

.vk-card-secondary-row {
  display: flex;
  align-items: center;
}

.vk-card-subtext {
  font-size: 0.775rem; /* ~12px */
  color: var(--text-secondary, #777777);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 400;
}

:global(.dark) .vk-card-subtext,
:global(.ion-palette-dark) .vk-card-subtext,
:global(body.dark-theme) .vk-card-subtext,
:global([data-theme="dark"]) .vk-card-subtext {
  color: rgba(255, 255, 255, 0.55) !important;
}

.vk-card-muted {
  color: var(--text-muted, #9A9A9A);
}

/* TRAILING ACTIONS */
.vk-card-trailing-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.vk-card-star-btn {
  background: transparent;
  border: none;
  padding: 6px;
  border-radius: 50%;
  color: var(--text-muted, #9A9A9A);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform var(--vk-motion-fast) var(--vk-ease-press),
              color var(--vk-motion-fast) ease;
}

:global(.dark) .vk-card-star-btn,
:global(.ion-palette-dark) .vk-card-star-btn,
:global(body.dark-theme) .vk-card-star-btn,
:global([data-theme="dark"]) .vk-card-star-btn {
  color: rgba(255, 255, 255, 0.45) !important;
}

.vk-card-star-btn:hover {
  color: var(--text-primary);
}

.vk-card-star-btn:active {
  transform: scale(1.18);
}

.vk-card-star-btn.is-favorite,
:global(.dark) .vk-card-star-btn.is-favorite,
:global(.ion-palette-dark) .vk-card-star-btn.is-favorite,
:global(body.dark-theme) .vk-card-star-btn.is-favorite,
:global([data-theme="dark"]) .vk-card-star-btn.is-favorite {
  color: var(--brand-red, #D3332F) !important;
}

.vk-card-chevron {
  color: var(--text-muted, #B0B0B0);
  transition: transform var(--vk-motion-fast) ease, color var(--vk-motion-fast) ease;
}

:global(.dark) .vk-card-chevron,
:global(.ion-palette-dark) .vk-card-chevron,
:global(body.dark-theme) .vk-card-chevron,
:global([data-theme="dark"]) .vk-card-chevron {
  color: rgba(255, 255, 255, 0.45) !important;
}

.vk-credential-card:hover .vk-card-chevron {
  transform: translateX(2px);
  color: var(--text-primary);
}

:global(.dark) .vk-credential-card:hover .vk-card-chevron,
:global(.ion-palette-dark) .vk-credential-card:hover .vk-card-chevron,
:global(body.dark-theme) .vk-credential-card:hover .vk-card-chevron,
:global([data-theme="dark"]) .vk-credential-card:hover .vk-card-chevron {
  color: #FFFFFF !important;
}
</style>
