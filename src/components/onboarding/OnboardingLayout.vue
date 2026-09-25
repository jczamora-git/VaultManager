<template>
  <div class="vk-onboarding-layout" :class="[`pos-${contentPosition}`, { 'is-scrollable': scrollable }]">
    <!-- RED / DARK COMPACT TOP NAV STRIP -->
    <header class="vk-onboarding-nav-strip vk-hero-backdrop">
      <div class="vk-container vk-nav-inner">
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
      </div>
    </header>

    <!-- MAIN WHITE / DARK SHEET (Unified Title + Interaction Cluster) -->
    <main class="vk-onboarding-sheet vk-sheet">
      <div class="vk-container vk-sheet-container">
        <!-- Top Breathing Room / Proportional Spacer -->
        <div class="vk-cluster-top-spacer"></div>

        <!-- Unified Content Group: Title + Subtitle + Main Form/CTA -->
        <div class="vk-onboarding-cluster" :class="{ 'is-centered': centerTitle }">
          <!-- Title & Subtitle Block inside the sheet -->
          <div v-if="title || $slots['title-extra']" class="vk-cluster-title-block">
            <slot name="title-extra"></slot>
            <h1 class="vk-cluster-title">{{ title }}</h1>
            <p v-if="subtitle" class="vk-cluster-subtitle">{{ subtitle }}</p>
          </div>

          <!-- Main Interactive Content Slot -->
          <div class="vk-cluster-main-content">
            <slot></slot>
          </div>
        </div>

        <!-- Bottom Breathing Room -->
        <div class="vk-cluster-bottom-spacer"></div>
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
    centerTitle?: boolean;
    scrollable?: boolean;
  }>(),
  {
    subtitle: '',
    step: '',
    showBack: true,
    contentPosition: 'lower',
    centerTitle: false,
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

/* Compact Top Nav Strip */
.vk-onboarding-nav-strip {
  flex-shrink: 0;
  padding-top: calc(env(safe-area-inset-top, 0px) + 10px);
  padding-bottom: 12px;
}

.vk-nav-inner {
  display: flex;
  flex-direction: column;
}

.vk-nav-top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 44px;
}

.vk-nav-spacer {
  width: 44px;
  height: 44px;
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

/* White / Dark Content Sheet */
.vk-onboarding-sheet {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--vk-bg-sheet);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  min-height: 0;
  position: relative;
  overflow-y: auto;
}

.vk-sheet-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-top: 8px;
  padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 20px);
  width: 100%;
  max-width: 360px;
  margin: 0 auto;
}

/* Unified Vertical Content Cluster */
.vk-onboarding-cluster {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.vk-onboarding-cluster.is-centered .vk-cluster-title-block {
  text-align: center;
}

.vk-onboarding-cluster.is-centered .vk-cluster-subtitle {
  margin-left: auto;
  margin-right: auto;
}

/* Title Block inside Sheet */
.vk-cluster-title-block {
  margin-bottom: 24px;
}

.vk-cluster-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.025em;
  line-height: 1.15;
  margin: 0 0 6px 0;
}

.vk-cluster-subtitle {
  font-size: 0.885rem;
  color: var(--text-secondary);
  line-height: 1.4;
  margin: 0;
  max-width: 340px;
}

.vk-cluster-main-content {
  display: flex;
  flex-direction: column;
  width: 100%;
}

/* Dynamic Vertical Proportions */
.pos-lower .vk-cluster-top-spacer {
  flex: 0.6;
  min-height: 8px;
  max-height: 50px;
}

.pos-lower .vk-cluster-bottom-spacer {
  flex: 1;
  min-height: 12px;
  max-height: 80px;
}

.pos-center .vk-cluster-top-spacer {
  flex: 1;
  min-height: 10px;
  max-height: 60px;
}

.pos-center .vk-cluster-bottom-spacer {
  flex: 1;
  min-height: 10px;
  max-height: 60px;
}

.pos-natural .vk-cluster-top-spacer {
  display: none;
}

.pos-natural .vk-cluster-bottom-spacer {
  flex: 1;
}

/* Responsive Short Screens (<= 720px) */
@media (max-height: 720px) {
  .vk-onboarding-nav-strip {
    padding-bottom: 8px;
  }
  .vk-cluster-title-block {
    margin-bottom: 16px;
  }
  .vk-cluster-title {
    font-size: 1.5rem;
    margin-bottom: 4px;
  }
  .vk-cluster-subtitle {
    font-size: 0.825rem;
  }
  .pos-lower .vk-cluster-top-spacer {
    min-height: 4px;
    max-height: 24px;
  }
  .pos-lower .vk-cluster-bottom-spacer {
    min-height: 8px;
    max-height: 36px;
  }
  .vk-sheet-container {
    padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 14px);
  }
}

/* Tall Phones (>= 850px) */
@media (min-height: 850px) {
  .pos-lower .vk-cluster-top-spacer {
    flex: 0.8;
    max-height: 70px;
  }
  .pos-lower .vk-cluster-bottom-spacer {
    flex: 1.2;
    max-height: 100px;
  }
  .vk-cluster-title-block {
    margin-bottom: 28px;
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
