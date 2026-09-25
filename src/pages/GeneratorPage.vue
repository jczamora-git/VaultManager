<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <!-- HERO HEADER -->
      <div class="vk-hero-backdrop">
        <div class="vk-container">
          <h1 class="vk-hero-title">Generator</h1>
          <p class="vk-hero-subtitle">Generate something stronger.</p>
        </div>
      </div>

      <!-- MAIN WHITE / DARK CONTENT SHEET -->
      <div class="vk-sheet">
        <div class="vk-container">
          <!-- DOMINANT GENERATED PASSWORD DISPLAY CARD -->
          <div class="vk-generated-pw-card vk-ticket-cutout">
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
          <SectionHeader title="Configuration" />
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
        </div>
      </div>
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
import SectionHeader from '@/components/common/SectionHeader.vue';
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
.vk-generated-pw-card {
  background: var(--vk-gen-card-bg);
  border-radius: var(--radius-lg);
  padding: 24px 20px 18px 20px;
  margin-bottom: 24px;
}

.vk-pw-main-text {
  font-size: 1.45rem;
  font-weight: 800;
  color: var(--vk-gen-card-text);
  word-break: break-all;
  letter-spacing: 0.04em;
  line-height: 1.35;
  margin-bottom: 20px;
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
  padding-top: 14px;
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
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-primary);
  transition: color var(--vk-motion-base) ease;
}

.vk-gen-copy-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--vk-gen-copy-bg);
  color: var(--vk-gen-copy-text);
  border: none;
  padding: 8px 16px;
  border-radius: var(--radius-pill);
  font-size: 0.825rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform var(--vk-motion-fast) var(--vk-ease-press),
              background-color var(--vk-motion-base) ease,
              color var(--vk-motion-base) ease;
  user-select: none;
}

.vk-gen-copy-btn:active {
  transform: scale(0.96);
}

.vk-gen-copy-btn.is-copied {
  background: var(--brand-red);
  color: #FFFFFF;
}

.font-mono {
  font-family: var(--vk-font-mono);
}

.vk-generator-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 28px;
}
</style>
