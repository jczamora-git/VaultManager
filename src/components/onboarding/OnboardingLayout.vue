<template>
  <div class="vk-onboarding-layout" :class="[`hero-${heroSize}`, `pos-${contentPosition}`, { 'is-scrollable': scrollable }]">
    <!-- LARGE RED HERO AREA (Context & Identity) -->
    <header class="vk-onboarding-hero vk-hero-backdrop">
      <div class="vk-container vk-hero-container">
        <!-- Top Navigation Row (Back Button & Step Badge) -->
        <div class="vk-nav-top-row">
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
          <div v-else class="vk-nav-spacer"></div>

          <slot name="top-right">
            <span v-if="step" class="vk-step-badge">{{ step }}</span>
          </slot>
        </div>

        <!-- Intentional Empty Flex Space -->
        <div class="vk-hero-spacer"></div>

        <!-- Page Title & Subtitle (Positioned near bottom of Red Hero) -->
        <div class="vk-hero-copy">
          <slot name="hero-extra"></slot>
          <h1 class="vk-hero-title">{{ title }}</h1>
          <p v-if="subtitle" class="vk-hero-subtitle">{{ subtitle }}</p>
        </div>
      </div>
    </header>

    <!-- MAIN WHITE / DARK SHEET (Interaction Area) -->
    <main class="vk-onboarding-sheet vk-sheet">
      <div class="vk-container vk-sheet-container">
        <!-- Main Interactive Content Slot -->
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
    heroSize?: 'large' | 'medium' | 'compact';
    contentPosition?: 'lower' | 'center' | 'natural';
    scrollable?: boolean;
  }>(),
  {
    subtitle: '',
    step: '',
    showBack: true,
    heroSize: 'large',
    contentPosition: 'natural',
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
  background: linear-gradient(
    180deg,
    #C62A27 0%,
    #B82825 45%,
    #A92220 100%
  );
  overflow: hidden;
  position: relative;
}

.dark .vk-onboarding-layout {
  background: linear-gradient(
    180deg,
    #181818 0%,
    #121212 45%,
    #0D0D0D 100%
  );
}

.vk-onboarding-layout.is-scrollable {
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

/* ========================================= */
/* RED HERO AREA (Context / Identity)        */
/* ========================================= */
.vk-onboarding-hero {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
  background: transparent !important;
  transition: height 0.2s ease;
}

/* Hero Height Variants */
.hero-large .vk-onboarding-hero {
  height: clamp(280px, 43dvh, 390px);
}

.hero-medium .vk-onboarding-hero {
  height: clamp(235px, 36dvh, 315px);
}

.hero-compact .vk-onboarding-hero {
  height: clamp(190px, 28dvh, 240px);
}

.vk-hero-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding-top: calc(env(safe-area-inset-top, 0px) + 12px);
  padding-bottom: 26px;
  padding-left: 24px;
  padding-right: 24px;
  width: 100%;
}

.vk-nav-top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 44px;
  flex-shrink: 0;
}

.vk-nav-spacer {
  width: 44px;
  height: 44px;
}

.vk-hero-circle-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.16);
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
  background: rgba(255, 255, 255, 0.28);
}

.dark .vk-hero-circle-btn {
  background: var(--vk-bg-surface-soft);
  color: var(--text-primary);
  border: 1px solid var(--vk-border);
}

.vk-step-badge {
  font-size: 0.775rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
  background: rgba(255, 255, 255, 0.18);
  padding: 5px 14px;
  border-radius: var(--radius-pill);
  letter-spacing: -0.01em;
}

.dark .vk-step-badge {
  background: var(--vk-bg-surface-soft);
  color: var(--text-secondary);
  border: 1px solid var(--vk-border);
}

/* Intentional Large Empty Space */
.vk-hero-spacer {
  flex: 1;
  min-height: 16px;
}

/* Hero Title & Subtitle at Bottom */
.vk-hero-copy {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  animation: vkFadeUp 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.vk-hero-title {
  font-size: clamp(1.65rem, 5.5vw, 1.85rem);
  font-weight: 800;
  color: #FFFFFF;
  letter-spacing: -0.03em;
  line-height: 1.15;
  margin: 0;
}

.dark .vk-hero-title {
  color: var(--text-primary);
}

.vk-hero-subtitle {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.38;
  margin: 4px 0 0 0;
  max-width: 340px;
}

.dark .vk-hero-subtitle {
  color: var(--text-secondary);
}

/* ========================================= */
/* WHITE SHEET (Interaction Area)            */
/* ========================================= */
.vk-onboarding-sheet {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #FFFFFF;
  border-radius: 32px 32px 0 0;
  margin-top: -12px;
  z-index: 2;
  position: relative;
  min-height: 0;
  overflow-y: auto;
  border-top: 1px solid rgba(255, 255, 255, 0.35);
  box-shadow: 0 -2px 0 rgba(255, 255, 255, 0.35), 0 -12px 32px rgba(0, 0, 0, 0.06);
}

.dark .vk-onboarding-sheet {
  background: #151515;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 -2px 0 rgba(255, 255, 255, 0.05), 0 -12px 32px rgba(0, 0, 0, 0.3);
}

.vk-sheet-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding-top: clamp(24px, 3.5dvh, 36px);
  padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 24px);
  padding-left: 24px;
  padding-right: 24px;
  width: 100%;
  max-width: 360px;
  margin: 0 auto;
}

.pos-lower .vk-sheet-container {
  justify-content: flex-end;
}

.pos-center .vk-sheet-container {
  justify-content: center;
}

.vk-sheet-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  animation: vkSheetUp 0.24s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* Animations */
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

@keyframes vkSheetUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive Short Screens (<= 720px) */
@media (max-height: 720px) {
  .hero-large .vk-onboarding-hero {
    height: clamp(230px, 38dvh, 290px);
  }
  .hero-medium .vk-onboarding-hero {
    height: clamp(195px, 30dvh, 245px);
  }
  .hero-compact .vk-onboarding-hero {
    height: clamp(165px, 24dvh, 200px);
  }
  .vk-hero-container {
    padding-bottom: 18px;
    padding-left: 20px;
    padding-right: 20px;
  }
  .vk-hero-title {
    font-size: 1.55rem;
  }
  .vk-hero-subtitle {
    font-size: 0.815rem;
  }
  .vk-sheet-container {
    padding-top: 20px;
    padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 16px);
    padding-left: 20px;
    padding-right: 20px;
  }
}

/* Keyboard open / very short screens */
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
