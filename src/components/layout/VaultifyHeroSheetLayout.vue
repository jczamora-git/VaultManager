<template>
  <div class="vk-hero-sheet-page" :class="[`hero-${heroSize}`, { 'has-dock': hasDock }]">
    <!-- RED / DARK HERO HEADER -->
    <header class="vk-hero-backdrop vk-page-hero">
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

    <!-- WHITE / DARK CONTENT SHEET -->
    <main class="vk-sheet vk-page-sheet" :class="{ 'is-scrollable': scrollable }">
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
    heroSize?: 'standard' | 'compact' | 'pin';
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
  min-height: 100%;
  width: 100%;
  background: var(--canvas);
}

.vk-page-hero {
  padding-top: calc(env(safe-area-inset-top, 0px) + 16px);
  padding-bottom: clamp(20px, 3dvh, 26px);
  background: linear-gradient(180deg, #D02A27 0%, #B82321 100%);
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.dark .vk-page-hero {
  background: #0D0D0D;
}

.hero-compact .vk-page-hero {
  padding-bottom: 18px;
}

.hero-pin .vk-page-hero {
  padding-bottom: clamp(24px, 3.6dvh, 32px);
}

.vk-hero-content-box {
  display: flex;
  flex-direction: column;
  width: 100%;
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
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  outline: none;
  transition: transform var(--vk-motion-instant, 90ms) var(--vk-ease-press, ease),
              background-color 120ms ease;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.vk-hero-action-btn:active {
  transform: scale(0.94);
  background: rgba(255, 255, 255, 0.28);
}

.dark .vk-hero-action-btn {
  background: var(--vk-bg-surface-soft);
  border-color: var(--vk-border);
  color: var(--text-primary);
}

.vk-hero-titles {
  display: flex;
  flex-direction: column;
}

.vk-hero-title {
  font-size: clamp(1.65rem, 5vw, 1.85rem);
  font-weight: 800;
  color: #FFFFFF;
  margin: 0;
  letter-spacing: -0.03em;
  line-height: 1.15;
}

.dark .vk-hero-title {
  color: var(--text-primary);
}

.vk-hero-subtitle {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.88);
  margin: 4px 0 0 0;
  line-height: 1.35;
}

.dark .vk-hero-subtitle {
  color: var(--text-secondary);
}

/* White / Dark Content Sheet */
.vk-page-sheet {
  flex: 1;
  background: var(--vk-bg-sheet);
  border-radius: 32px 32px 0 0;
  margin-top: -12px;
  position: relative;
  z-index: 2;
  box-shadow: 0 -12px 32px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  min-height: calc(100dvh - 160px);
}

.dark .vk-page-sheet {
  background: #151515;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 -12px 32px rgba(0, 0, 0, 0.4);
}

.vk-sheet-inner {
  padding-top: clamp(20px, 3dvh, 26px);
  padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 24px);
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
}

.has-dock .vk-sheet-inner {
  padding-bottom: calc(var(--vk-dock-height, 64px) + var(--vk-dock-offset, 12px) + env(safe-area-inset-bottom, 0px) + 20px);
}
</style>
