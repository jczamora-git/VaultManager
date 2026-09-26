<template>
  <div class="vk-hero-sheet-page" :class="[`hero-${heroSize}`, { 'has-dock': hasDock, 'is-scrollable': scrollable }]">
    <!-- RED HERO HEADER (Transparent container inside continuous red root) -->
    <header class="vk-page-hero">
      <div class="vk-container vk-hero-content-box">
        <!-- Optional Top Navigation / Action Row -->
        <div v-if="showBack || showClose || $slots['top-action']" class="vk-hero-nav-row">
          <button
            v-if="showBack"
            type="button"
            class="vk-hero-action-btn"
            @click="$emit('back')"
            aria-label="Go back"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>
          <button
            v-else-if="showClose"
            type="button"
            class="vk-hero-action-btn"
            @click="$emit('close')"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
            </svg>
          </button>
          <div v-else class="vk-nav-spacer"></div>

          <slot name="top-action"></slot>
        </div>

        <!-- Hero Title & Subtitle -->
        <div class="vk-hero-titles">
          <h1 class="vk-hero-title">{{ title }}</h1>
          <p v-if="subtitle" class="vk-hero-subtitle">{{ subtitle }}</p>
          <slot name="hero-bottom"></slot>
        </div>
      </div>
    </header>

    <!-- WHITE FOREGROUND SHEET (The only white surface) -->
    <main class="vk-page-sheet vk-sheet">
      <div class="vk-container vk-sheet-inner">
        <slot></slot>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string;
    subtitle?: string;
    showBack?: boolean;
    showClose?: boolean;
    heroSize?: 'standard' | 'compact' | 'medium' | 'pin';
    scrollable?: boolean;
    hasDock?: boolean;
  }>(),
  {
    subtitle: '',
    showBack: false,
    showClose: false,
    heroSize: 'standard',
    scrollable: true,
    hasDock: false,
  }
);

defineEmits<{
  (e: 'back'): void;
  (e: 'close'): void;
}>();
</script>

<style scoped>
.vk-hero-sheet-page {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  height: 100dvh;
  width: 100%;
  background: var(--vk-brand-gradient, linear-gradient(
    180deg,
    #D02724 0%,
    #B8201E 100%
  ));
  overflow: hidden;
  position: relative;
}

.vk-hero-sheet-page.is-scrollable {
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

/* RED HERO AREA (Context / Identity) - Transparent background */
.vk-page-hero {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
  background: transparent !important;
  padding-top: calc(env(safe-area-inset-top, 0px) + 12px);
  padding-bottom: 24px;
}

.hero-compact .vk-page-hero {
  padding-bottom: 18px;
}

.hero-pin .vk-page-hero {
  padding-bottom: 28px;
}

.vk-hero-content-box {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-left: 24px;
  padding-right: 24px;
}

.vk-hero-nav-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 44px;
  margin-bottom: 8px;
}

.vk-nav-spacer {
  width: 44px;
  height: 44px;
}

.vk-hero-action-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.14);
  border: none;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  outline: none;
  transition: transform var(--vk-motion-instant, 90ms) var(--vk-ease-press, ease),
              background-color var(--vk-motion-fast, 120ms) ease;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.vk-hero-action-btn:active {
  transform: scale(0.94);
  background: rgba(255, 255, 255, 0.26);
}

.vk-hero-titles {
  display: flex;
  flex-direction: column;
  animation: vkFadeUp var(--vk-motion-base) var(--vk-ease-enter) 0ms forwards;
}

.hero-pin .vk-hero-titles {
  align-items: center;
  text-align: center;
}

.vk-hero-title {
  font-size: clamp(1.65rem, 5.5vw, 1.85rem);
  font-weight: 800;
  color: #FFFFFF;
  margin: 0;
  letter-spacing: -0.03em;
  line-height: 1.15;
}

.vk-hero-subtitle {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 4px 0 0 0;
  line-height: 1.38;
  max-width: 360px;
}

.hero-pin .vk-hero-subtitle {
  text-align: center;
  margin: 5px auto 0 auto;
}

/* SHEET SURFACE */
.vk-page-sheet,
.vk-sheet {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--vk-bg-sheet, var(--vk-sheet-bg, #FFFFFF));
  color: var(--text-primary);
  border-radius: 36px 36px 0 0;
  margin-top: -12px;
  z-index: 2;
  position: relative;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  border-top: 1px solid var(--border-light, rgba(255, 255, 255, 0.4));
  box-shadow: 0 -2px 0 rgba(255, 255, 255, 0.35), 0 -12px 32px rgba(0, 0, 0, 0.06);
  transition: background-color var(--vk-motion-base) ease;
}

.vk-sheet-inner {
  background: transparent !important;
  padding-top: var(--vk-sheet-padding-top, 14px);
  padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 24px);
  padding-left: 24px;
  padding-right: 24px;
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
}

.has-dock .vk-sheet-inner {
  padding-bottom: calc(var(--vk-dock-height, 64px) + var(--vk-dock-offset, 12px) + env(safe-area-inset-bottom, 0px) + 24px);
}

@keyframes vkFadeUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive Short Screens (<= 720px) */
@media (max-height: 720px) {
  .vk-page-hero {
    padding-bottom: 16px;
  }
  .vk-hero-content-box {
    padding-left: 20px;
    padding-right: 20px;
  }
  .vk-hero-title {
    font-size: 1.55rem;
  }
  .vk-hero-subtitle {
    font-size: 0.815rem;
  }
  .vk-sheet-inner {
    padding-top: 12px;
    padding-left: 20px;
    padding-right: 20px;
  }
}

/* Keyboard open / very short screens */
@media (max-height: 560px) {
  .vk-hero-sheet-page {
    overflow-y: auto !important;
    height: auto !important;
  }
  .vk-page-sheet {
    overflow: visible;
  }
}

/* Dark Mode Architecture - ONLY FOREGROUND SHEET CHANGES */
:global(.dark) .vk-page-sheet,
:global(.dark) .vk-sheet,
:global(.ion-palette-dark) .vk-page-sheet,
:global(.ion-palette-dark) .vk-sheet,
:global(body.dark-theme) .vk-page-sheet,
:global(body.dark-theme) .vk-sheet,
:global([data-theme="dark"]) .vk-page-sheet,
:global([data-theme="dark"]) .vk-sheet {
  background: var(--vk-bg-sheet, var(--vk-sheet-bg, #151515));
  color: var(--text-primary, #F5F5F5);
  border-top-color: var(--vk-border, rgba(255, 255, 255, 0.08));
  box-shadow: 0 -2px 0 rgba(255, 255, 255, 0.04), 0 -12px 32px rgba(0, 0, 0, 0.4);
}
</style>
