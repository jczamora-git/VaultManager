<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <VaultifyHeroSheetLayout
        title="Generator"
        subtitle="Generate something stronger."
        :has-dock="true"
      >
        <!-- SEGMENTED MODE SELECTOR (GENERATE | ANALYZE) -->
        <div class="vk-mode-segment-pill" role="tablist">
          <button
            type="button"
            role="tab"
            :aria-selected="activeMode === 'generate'"
            class="vk-segment-choice"
            :class="{ 'is-active': activeMode === 'generate' }"
            @click="setMode('generate')"
          >
            <span>Generate</span>
          </button>
          <button
            type="button"
            role="tab"
            :aria-selected="activeMode === 'analyze'"
            class="vk-segment-choice"
            :class="{ 'is-active': activeMode === 'analyze' }"
            @click="setMode('analyze')"
          >
            <span>Analyze</span>
          </button>
        </div>

        <!-- GENERATE MODE -->
        <div v-show="activeMode === 'generate'" class="vk-mode-panel">
          <PasswordGenerator ref="generatorRef" />
        </div>

        <!-- ANALYZE MODE -->
        <div v-show="activeMode === 'analyze'" class="vk-mode-panel">
          <PasswordAnalyzer
            ref="analyzerRef"
            @switch-to-generate="handleSwitchToGenerate"
          />
        </div>
      </VaultifyHeroSheetLayout>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { IonPage, IonContent, onIonViewDidLeave } from '@ionic/vue';
import VaultifyHeroSheetLayout from '@/components/layout/VaultifyHeroSheetLayout.vue';
import PasswordGenerator from '@/components/generator/PasswordGenerator.vue';
import PasswordAnalyzer from '@/components/generator/PasswordAnalyzer.vue';

type GeneratorMode = 'generate' | 'analyze';

const activeMode = ref<GeneratorMode>('generate');
const generatorRef = ref<InstanceType<typeof PasswordGenerator> | null>(null);
const analyzerRef = ref<InstanceType<typeof PasswordAnalyzer> | null>(null);

function setMode(mode: GeneratorMode) {
  if (activeMode.value === 'analyze' && mode === 'generate') {
    // Clear volatile analysis data when switching away from analyze mode
    analyzerRef.value?.resetVolatileState();
  }
  activeMode.value = mode;
}

function handleSwitchToGenerate() {
  activeMode.value = 'generate';
  generatorRef.value?.regenerate();
}

onIonViewDidLeave(() => {
  // Clear volatile memory when leaving the generator page
  analyzerRef.value?.resetVolatileState();
});
</script>

<style scoped>
ion-content {
  --background: transparent;
}

.vk-mode-segment-pill {
  display: flex;
  background: var(--vk-bg-surface-soft, #F1EFEC);
  border-radius: var(--radius-pill, 999px);
  padding: 4px;
  margin-bottom: 20px;
  border: 1px solid var(--vk-border, rgba(0, 0, 0, 0.04));
}

:global(.dark) .vk-mode-segment-pill,
:global(.ion-palette-dark) .vk-mode-segment-pill,
:global(body.dark-theme) .vk-mode-segment-pill,
:global([data-theme="dark"]) .vk-mode-segment-pill {
  background: #202020;
  border-color: rgba(255, 255, 255, 0.07);
}

.vk-segment-choice {
  flex: 1;
  padding: 9px 16px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.825rem;
  font-weight: 700;
  border-radius: var(--radius-pill, 999px);
  cursor: pointer;
  transition: all 0.16s ease;
  outline: none;
}

.vk-segment-choice.is-active {
  background: #0A0A0A;
  color: #FFFFFF;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

:global(.dark) .vk-segment-choice.is-active,
:global(.ion-palette-dark) .vk-segment-choice.is-active,
:global(body.dark-theme) .vk-segment-choice.is-active,
:global([data-theme="dark"]) .vk-segment-choice.is-active {
  background: #F4F4F2;
  color: #101010;
}

.vk-mode-panel {
  display: flex;
  flex-direction: column;
  animation: fadeIn 0.18s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0.85;
    transform: translateY(2px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
