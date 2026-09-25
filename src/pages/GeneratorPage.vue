<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <VaultifyHeroSheetLayout
        title="Generator"
        subtitle="Generate something stronger."
        :has-dock="true"
      >
        <!-- DOMINANT GENERATED PASSWORD DISPLAY CARD -->
        <div class="vk-generated-pw-card">
          <div class="vk-pw-main-text font-mono">
            {{ generatedPassword }}
          </div>

          <!-- Strength & Copy Row -->
          <div class="vk-pw-card-footer">
            <div class="vk-pw-strength-tag">
              <span class="vk-strength-dot" :style="{ backgroundColor: strengthColor }"></span>
              <span class="vk-strength-text">{{ strengthLabel }}</span>
            </div>

            <button
              type="button"
              class="vk-gen-copy-btn"
              :class="{ 'is-copied': isCopied }"
              @click="handleCopy"
              aria-label="Copy generated password"
            >
              <svg v-if="!isCopied" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              <span>{{ isCopied ? 'Copied' : 'Copy' }}</span>
            </button>
          </div>
        </div>

        <!-- Options Section -->
        <div class="vk-section-header-block">
          <span class="vk-section-kicker">CONFIGURATION</span>
        </div>

        <GeneratorOptionsPanel
          v-model:options="options"
          @change="regenerate"
        />

        <!-- Action Buttons -->
        <div class="vk-generator-actions">
          <button type="button" class="vk-btn vk-btn-primary vk-btn-block" @click="regenerate">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
              <path d="M16 21h5v-5"/>
            </svg>
            <span>Generate Password</span>
          </button>

          <button type="button" class="vk-btn vk-btn-secondary vk-btn-block" @click="saveToVault">
            Save to New Credential
          </button>
        </div>
      </VaultifyHeroSheetLayout>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { IonPage, IonContent } from '@ionic/vue';
import { PasswordGeneratorService } from '@/services/password-generator.service';
import { GeneratorOptions, DEFAULT_GENERATOR_OPTIONS } from '@/models/generator.model';
import { useClipboard } from '@/composables/useClipboard';
import VaultifyHeroSheetLayout from '@/components/layout/VaultifyHeroSheetLayout.vue';
import GeneratorOptionsPanel from '@/components/generator/GeneratorOptionsPanel.vue';

const router = useRouter();
const { copy } = useClipboard();

const options = reactive<GeneratorOptions>({ ...DEFAULT_GENERATOR_OPTIONS });
const generatedPassword = ref('');
const isCopied = ref(false);
let copyTimer: number | null = null;

const analysis = computed(() => {
  return PasswordGeneratorService.analyze(generatedPassword.value);
});

const strengthLabel = computed(() => analysis.value.label);
const strengthColor = computed(() => analysis.value.color);

function regenerate() {
  generatedPassword.value = PasswordGeneratorService.generate(options);
}

async function handleCopy() {
  if (!generatedPassword.value) return;
  const success = await copy(generatedPassword.value, 'Password copied to clipboard');
  if (success) {
    isCopied.value = true;
    if (copyTimer) clearTimeout(copyTimer);
    copyTimer = window.setTimeout(() => {
      isCopied.value = false;
    }, 2000);
  }
}

function saveToVault() {
  router.push({
    path: '/credential/new',
    query: { prefillPassword: generatedPassword.value },
  });
}

onMounted(() => {
  regenerate();
});
</script>

<style scoped>
ion-content {
  --background: transparent;
}

.vk-generated-pw-card {
  background: #F1EFEC;
  border-radius: 20px;
  padding: 22px 20px 16px 20px;
  margin-bottom: 22px;
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.dark .vk-generated-pw-card {
  background: #1E1E1E;
  border-color: rgba(255, 255, 255, 0.06);
}

.vk-pw-main-text {
  font-size: 1.45rem;
  font-weight: 800;
  color: var(--text-primary);
  word-break: break-all;
  letter-spacing: 0.04em;
  line-height: 1.35;
  margin-bottom: 18px;
  text-align: center;
  user-select: all;
  transition: opacity var(--vk-motion-base) var(--vk-ease-standard),
              transform var(--vk-motion-base) var(--vk-ease-enter);
}

.vk-pw-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid var(--vk-divider);
  padding-top: 12px;
}

.vk-pw-strength-tag {
  display: flex;
  align-items: center;
  gap: 8px;
}

.vk-strength-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  transition: background-color var(--vk-motion-base) ease;
}

.vk-strength-text {
  font-size: 0.825rem;
  font-weight: 700;
  color: var(--text-primary);
  transition: color var(--vk-motion-base) ease;
}

.vk-gen-copy-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #0A0A0A;
  color: #FFFFFF;
  border: none;
  padding: 7px 15px;
  border-radius: var(--radius-pill, 999px);
  font-size: 0.8125rem;
  font-weight: 700;
  cursor: pointer;
  outline: none;
  transition: transform var(--vk-motion-fast) var(--vk-ease-press),
              background-color var(--vk-motion-base) ease;
  user-select: none;
}

.dark .vk-gen-copy-btn {
  background: #F4F4F2;
  color: #101010;
}

.vk-gen-copy-btn:active {
  transform: scale(0.96);
}

.vk-gen-copy-btn.is-copied {
  background: var(--brand-red, #B82825);
  color: #FFFFFF;
}

.vk-section-header-block {
  margin-top: 4px;
  margin-bottom: 12px;
}

.vk-section-kicker {
  font-size: 0.725rem; /* ~11.5px */
  font-weight: 700;
  letter-spacing: 0.05em;
  color: var(--text-muted, #9A9A9A);
  text-transform: uppercase;
}

.font-mono {
  font-family: var(--vk-font-mono);
}

.vk-generator-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 24px;
}
</style>
