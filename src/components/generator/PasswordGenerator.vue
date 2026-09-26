<template>
  <div class="vk-password-generator-content">
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { PasswordGeneratorService } from '@/services/password-generator.service';
import { GeneratorOptions, DEFAULT_GENERATOR_OPTIONS } from '@/models/generator.model';
import { useClipboard } from '@/composables/useClipboard';
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

const strengthLabel = computed(() => analysis.value.label || 'Strong');
const strengthColor = computed(() => analysis.value.color || '#16A34A');

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

defineExpose({
  regenerate,
});

onMounted(() => {
  if (!generatedPassword.value) {
    regenerate();
  }
});
</script>

<style scoped>
.vk-password-generator-content {
  display: flex;
  flex-direction: column;
}

.vk-generated-pw-card {
  position: relative;
  background: var(--vk-gen-card-bg, #F1EFEC);
  border-radius: 18px;
  padding: 0;
  margin-bottom: 22px;
  border: none;
  box-shadow: none;
  overflow: hidden;
}

:global(.dark) .vk-generated-pw-card,
:global(.ion-palette-dark) .vk-generated-pw-card,
:global(body.dark-theme) .vk-generated-pw-card,
:global([data-theme="dark"]) .vk-generated-pw-card {
  background: #202020;
  border: none;
  box-shadow: none;
}

.vk-pw-main-text {
  padding: 24px 20px 20px 20px;
  font-size: clamp(17px, 5vw, 22px);
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 0.02em;
  line-height: 1.35;
  text-align: center;
  user-select: all;
  overflow-wrap: anywhere;
  word-break: break-word;
  transition: opacity var(--vk-motion-base) var(--vk-ease-standard),
              transform var(--vk-motion-base) var(--vk-ease-enter);
}

.vk-pw-card-footer {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 13px 18px 15px 18px;
  border-top: 1.5px dashed rgba(0, 0, 0, 0.12);
}

:global(.dark) .vk-pw-card-footer,
:global(.ion-palette-dark) .vk-pw-card-footer,
:global(body.dark-theme) .vk-pw-card-footer,
:global([data-theme="dark"]) .vk-pw-card-footer {
  border-top: 1.5px dashed rgba(255, 255, 255, 0.12);
}

/* Clearly Defined Inward Ticket Cutouts (18px diameter, seamless carved notch) */
.vk-pw-card-footer::before,
.vk-pw-card-footer::after {
  content: '';
  position: absolute;
  top: 0;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--vk-sheet-bg, var(--vk-bg-sheet, #FFFFFF));
  border: none;
  box-sizing: border-box;
  z-index: 2;
}

.vk-pw-card-footer::before {
  left: 0;
  transform: translate(-50%, -50%);
}

.vk-pw-card-footer::after {
  right: 0;
  transform: translate(50%, -50%);
}

:global(.dark) .vk-pw-card-footer::before,
:global(.dark) .vk-pw-card-footer::after,
:global(.ion-palette-dark) .vk-pw-card-footer::before,
:global(.ion-palette-dark) .vk-pw-card-footer::after,
:global(body.dark-theme) .vk-pw-card-footer::before,
:global(body.dark-theme) .vk-pw-card-footer::after,
:global([data-theme="dark"]) .vk-pw-card-footer::before,
:global([data-theme="dark"]) .vk-pw-card-footer::after {
  background: var(--vk-sheet-bg, var(--vk-bg-sheet, #151515));
  border: none;
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
  flex-shrink: 0;
  transition: background-color var(--vk-motion-base) ease;
}

.vk-strength-text {
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--text-primary);
  transition: color var(--vk-motion-base) ease;
}

.vk-gen-copy-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--vk-gen-copy-bg, #0A0A0A);
  color: var(--vk-gen-copy-text, #FFFFFF);
  border: none;
  padding: 6px 14px;
  border-radius: var(--radius-pill, 999px);
  font-size: 0.8125rem;
  font-weight: 700;
  cursor: pointer;
  outline: none;
  transition: transform var(--vk-motion-fast) var(--vk-ease-press),
              background-color var(--vk-motion-base) ease,
              color var(--vk-motion-base) ease;
  user-select: none;
}

@media (hover: hover) {
  .vk-gen-copy-btn:hover {
    background: #262626;
  }
}

.vk-gen-copy-btn:active {
  transform: scale(0.96);
  background: #333333;
}

:global(.dark) .vk-gen-copy-btn,
:global(.ion-palette-dark) .vk-gen-copy-btn,
:global(body.dark-theme) .vk-gen-copy-btn,
:global([data-theme="dark"]) .vk-gen-copy-btn {
  background: #F4F4F2;
  color: #101010;
}

@media (hover: hover) {
  :global(.dark) .vk-gen-copy-btn:hover,
  :global(.ion-palette-dark) .vk-gen-copy-btn:hover,
  :global(body.dark-theme) .vk-gen-copy-btn:hover,
  :global([data-theme="dark"]) .vk-gen-copy-btn:hover {
    background: #FFFFFF;
  }
}

:global(.dark) .vk-gen-copy-btn:active,
:global(.ion-palette-dark) .vk-gen-copy-btn:active,
:global(body.dark-theme) .vk-gen-copy-btn:active,
:global([data-theme="dark"]) .vk-gen-copy-btn:active {
  background: #E0E0E0;
}

.vk-gen-copy-btn.is-copied {
  background: var(--brand-red, #D3332F) !important;
  color: #FFFFFF !important;
}

.vk-section-header-block {
  margin-top: 4px;
  margin-bottom: 12px;
}

.vk-section-kicker {
  font-size: 0.725rem;
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
