<template>
  <div class="vk-onboarding-layout" :class="[`pos-${contentPosition}`, { 'is-scrollable': scrollable }]">
    <!-- RED / DARK HERO HEADER (Information Only) -->
    <header class="vk-onboarding-header vk-hero-backdrop">
      <div class="vk-container vk-header-inner">
        <!-- Top Nav (Back Button & Step Badge) -->
        <div v-if="showBack || step || $slots['top-right']" class="vk-header-top-row">
          <button
            v-if="showBack"
            type="button"
            class="vk-hero-circle-btn"
            @click="$emit('back')"
            title="Back"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>
          <div v-else></div>

          <slot name="top-right">
            <span v-if="step" class="vk-step-badge">{{ step }}</span>
          </slot>
        </div>

        <!-- Extra Hero Content (e.g., Brand tag, Avatar) -->
        <slot name="hero-extra"></slot>

        <!-- Title & Subtitle -->
        <div class="vk-header-text">
          <h1 class="vk-hero-title">{{ title }}</h1>
          <p v-if="subtitle" class="vk-hero-subtitle">{{ subtitle }}</p>
        </div>
      </div>
    </header>

    <!-- WHITE / DARK SHEET (Interaction Cluster) -->
    <main class="vk-onboarding-sheet vk-sheet">
      <div class="vk-container vk-sheet-container">
        <!-- Vertical breathing room / spacer for lower & center positioning -->
        <div v-if="contentPosition !== 'natural'" class="vk-sheet-top-spacer"></div>

        <!-- Main Interaction Body -->
        <div class="vk-sheet-content">
          <slot></slot>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string;
    subtitle?: string;
    step?: string;
    showBack?: boolean;
    contentPosition?: 'lower' | 'center' | 'natural';
    scrollable?: boolean;
  }>(),
  {
    subtitle: '',
    step: '',
    showBack: true,
    contentPosition: 'lower',
    scrollable: false,
  }
);

defineEmits<{
  (e: 'back'): void;
}>();
</script>

<style scoped>
.vk-onboarding-layout {
  min-height: 100dvh;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  background: var(--canvas);
  overflow: hidden;
  position: relative;
}

.vk-onboarding-layout.is-scrollable {
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

/* Header Section */
.vk-onboarding-header {
  flex-shrink: 0;
  padding-top: calc(env(safe-area-inset-top, 0px) + 14px);
  padding-bottom: 22px;
}

.vk-header-inner {
  display: flex;
  flex-direction: column;
}

.vk-header-top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 44px;
  margin-bottom: 12px;
}

.vk-hero-circle-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.1s ease, background-color 0.15s ease;
  touch-action: manipulation;
}

.vk-hero-circle-btn:active {
  transform: scale(0.94);
  background: rgba(255, 255, 255, 0.25);
}

.dark .vk-hero-circle-btn {
  background: var(--vk-bg-surface-soft);
  color: var(--text-primary);
  border: 1px solid var(--vk-border);
}

.vk-step-badge {
  font-size: 0.775rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.15);
  padding: 4px 12px;
  border-radius: var(--radius-pill);
  letter-spacing: -0.01em;
}

.dark .vk-step-badge {
  background: var(--vk-bg-surface-soft);
  color: var(--text-secondary);
  border: 1px solid var(--vk-border);
}

.vk-header-text {
  margin-top: 2px;
}

.vk-hero-title {
  font-size: 1.85rem;
  font-weight: 800;
  color: #FFFFFF;
  margin: 0 0 6px 0;
  letter-spacing: -0.03em;
  line-height: 1.15;
}

.dark .vk-hero-title {
  color: var(--text-primary);
}

.vk-hero-subtitle {
  font-size: 0.925rem;
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
  line-height: 1.4;
  max-width: 340px;
}

.dark .vk-hero-subtitle {
  color: var(--text-secondary);
}

/* White / Dark Content Sheet */
.vk-onboarding-sheet {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--vk-bg-sheet);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  min-height: 0;
  position: relative;
  overflow: hidden;
}

.vk-sheet-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding-top: 12px;
  padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 24px);
  width: 100%;
  max-width: 360px;
  margin: 0 auto;
}

/* Dynamic Positioning */
.pos-lower .vk-sheet-top-spacer {
  flex: 1;
  min-height: 16px;
  max-height: 120px;
}

.pos-center .vk-sheet-container {
  justify-content: center;
}

.pos-center .vk-sheet-top-spacer {
  flex: 0.6;
  min-height: 10px;
  max-height: 60px;
}

.pos-natural .vk-sheet-container {
  justify-content: flex-start;
  padding-top: 20px;
}

.vk-sheet-content {
  width: 100%;
  display: flex;
  flex-direction: column;
}

/* Responsive Short Screens (<= 720px) */
@media (max-height: 720px) {
  .vk-onboarding-header {
    padding-bottom: 14px;
  }
  .vk-header-top-row {
    margin-bottom: 6px;
  }
  .vk-hero-title {
    font-size: 1.6rem;
  }
  .vk-hero-subtitle {
    font-size: 0.85rem;
  }
  .pos-lower .vk-sheet-top-spacer {
    min-height: 6px;
    max-height: 36px;
  }
  .vk-sheet-container {
    padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 16px);
  }
}

/* Fallback for when content needs scroll on small screen or keyboard open */
@media (max-height: 560px) {
  .vk-onboarding-layout {
    overflow-y: auto !important;
    height: auto !important;
  }
  .vk-onboarding-sheet {
    overflow: visible;
  }
}
</style>
