<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <VaultifyHeroSheetLayout
        title="Cipher"
        subtitle="Convert text securely."
        :has-dock="true"
      >
        <!-- Large Segmented Control -->
        <div class="vk-mode-segment-pill">
          <button
            type="button"
            class="vk-segment-choice"
            :class="{ 'is-active': mode === 'encrypt' }"
            @click="mode = 'encrypt'"
          >
            <span>Encrypt / Encode</span>
          </button>
          <button
            type="button"
            class="vk-segment-choice"
            :class="{ 'is-active': mode === 'decrypt' }"
            @click="mode = 'decrypt'"
          >
            <span>Decrypt / Decode</span>
          </button>
        </div>

        <!-- Algorithm Selector Scroller -->
        <div class="vk-algo-scroller">
          <button
            v-for="algo in CIPHER_ALGORITHMS"
            :key="algo.id"
            type="button"
            class="vk-algo-pill"
            :class="{ 'is-active': selectedAlgoId === algo.id }"
            @click="selectedAlgoId = algo.id"
          >
            <span>{{ algo.name }}</span>
          </button>
        </div>

        <!-- Badge Info -->
        <CipherAlgorithmBadge :algorithm="currentAlgoInfo" />

        <!-- Input Area -->
        <div class="vk-cipher-fields">
          <div class="vk-input-group">
            <div class="vk-label-row">
              <label class="vk-label">{{ mode === 'encrypt' ? 'Plaintext Input' : 'Ciphertext Input' }}</label>
              <span class="vk-char-counter">{{ inputText.length }} chars</span>
            </div>
            <div class="vk-input-wrapper vk-textarea-wrapper">
              <textarea
                v-model="inputText"
                :placeholder="mode === 'encrypt' ? 'Paste or type text to encrypt...' : 'Paste ciphertext to decrypt...'"
                rows="4"
                class="vk-input vk-textarea font-mono"
              ></textarea>
            </div>
          </div>

          <!-- AES Passphrase -->
          <div v-if="selectedAlgoId === 'AES-GCM'" class="vk-input-group">
            <label class="vk-label">Encryption Passphrase</label>
            <div class="vk-input-wrapper">
              <input
                :type="showPassphrase ? 'text' : 'password'"
                v-model="aesPassphrase"
                placeholder="Enter secret passphrase..."
                class="vk-input"
              />
              <button type="button" class="vk-btn-icon-only" @click="showPassphrase = !showPassphrase" tabindex="-1">
                <svg v-if="!showPassphrase" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Caesar Shift -->
          <div v-if="selectedAlgoId === 'Caesar'" class="vk-input-group">
            <div class="vk-label-row">
              <label class="vk-label">Shift Amount (1 to 25)</label>
              <span class="vk-shift-number">{{ caesarShift }}</span>
            </div>
            <input
              type="range"
              min="1"
              max="25"
              v-model.number="caesarShift"
              class="vk-custom-range"
            />
          </div>

          <!-- Vigenere Key -->
          <div v-if="selectedAlgoId === 'Vigenere'" class="vk-input-group">
            <label class="vk-label">Secret Keyword</label>
            <div class="vk-input-wrapper">
              <input
                type="text"
                v-model="vigenereKey"
                placeholder="e.g. SECRETKEY"
                class="vk-input font-mono"
              />
            </div>
          </div>

          <!-- Primary Action Button -->
          <button
            type="button"
            class="vk-btn vk-btn-primary vk-btn-block"
            :disabled="isProcessing || !inputText"
            @click="processCipher"
          >
            <span v-if="!isProcessing">{{ mode === 'encrypt' ? 'Transform / Encrypt' : 'Process / Decrypt' }}</span>
            <span v-else>Processing...</span>
          </button>

          <!-- Error Notice -->
          <div v-if="errorMessage" class="vk-error-notice">
            {{ errorMessage }}
          </div>
        </div>

        <!-- OUTPUT RESULT SECTION -->
        <div v-if="outputText" class="vk-output-section">
          <SectionHeader title="Output Result" />
          <div class="vk-output-card">
            <div class="vk-output-box font-mono">
              {{ outputText }}
            </div>
            <div class="vk-output-footer">
              <button type="button" class="vk-btn vk-btn-secondary vk-btn-sm" @click="useAsInput">
                Use as Input
              </button>
              <CopyButton :text="outputText" :show-text="true" toast-message="Result copied" />
            </div>
          </div>
        </div>
      </VaultifyHeroSheetLayout>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { IonPage, IonContent } from '@ionic/vue';
import { CIPHER_ALGORITHMS, CipherAlgorithm, CipherAlgorithmInfo } from '@/models/cipher.model';
import { CipherService } from '@/services/cipher.service';
import { useToast } from '@/composables/useToast';
import VaultifyHeroSheetLayout from '@/components/layout/VaultifyHeroSheetLayout.vue';
import SectionHeader from '@/components/common/SectionHeader.vue';
import CipherAlgorithmBadge from '@/components/cipher/CipherAlgorithmBadge.vue';
import CopyButton from '@/components/common/CopyButton.vue';

const { showToast } = useToast();

const mode = ref<'encrypt' | 'decrypt'>('encrypt');
const selectedAlgoId = ref<CipherAlgorithm>('AES-GCM');
const inputText = ref('');
const outputText = ref('');
const aesPassphrase = ref('');
const showPassphrase = ref(false);
const caesarShift = ref(3);
const vigenereKey = ref('KEY');
const isProcessing = ref(false);
const errorMessage = ref('');

const currentAlgoInfo = computed<CipherAlgorithmInfo>(() => {
  return CIPHER_ALGORITHMS.find((a) => a.id === selectedAlgoId.value) || CIPHER_ALGORITHMS[0];
});

watch([mode, selectedAlgoId], () => {
  errorMessage.value = '';
});

async function processCipher() {
  errorMessage.value = '';
  outputText.value = '';

  if (!inputText.value) {
    errorMessage.value = 'Please provide text input.';
    return;
  }

  isProcessing.value = true;
  try {
    if (selectedAlgoId.value === 'AES-GCM') {
      if (!aesPassphrase.value) {
        throw new Error('A secret passphrase is required for AES-256-GCM.');
      }
      if (mode.value === 'encrypt') {
        outputText.value = await CipherService.aesEncrypt(inputText.value, aesPassphrase.value);
      } else {
        outputText.value = await CipherService.aesDecrypt(inputText.value, aesPassphrase.value);
      }
    } else if (selectedAlgoId.value === 'Caesar') {
      if (mode.value === 'encrypt') {
        outputText.value = CipherService.caesarEncrypt(inputText.value, caesarShift.value);
      } else {
        outputText.value = CipherService.caesarDecrypt(inputText.value, caesarShift.value);
      }
    } else if (selectedAlgoId.value === 'ROT13') {
      outputText.value = CipherService.rot13(inputText.value);
    } else if (selectedAlgoId.value === 'Vigenere') {
      if (!vigenereKey.value.trim()) {
        throw new Error('A keyword is required for Vigenère cipher.');
      }
      if (mode.value === 'encrypt') {
        outputText.value = CipherService.vigenereEncrypt(inputText.value, vigenereKey.value);
      } else {
        outputText.value = CipherService.vigenereDecrypt(inputText.value, vigenereKey.value);
      }
    } else if (selectedAlgoId.value === 'Base64') {
      if (mode.value === 'encrypt') {
        outputText.value = CipherService.base64Encode(inputText.value);
      } else {
        outputText.value = CipherService.base64Decode(inputText.value);
      }
    }
  } catch (err: any) {
    errorMessage.value = err.message || 'Cipher operation failed. Check your parameters.';
  } finally {
    isProcessing.value = false;
  }
}

function useAsInput() {
  if (outputText.value) {
    inputText.value = outputText.value;
    outputText.value = '';
    mode.value = mode.value === 'encrypt' ? 'decrypt' : 'encrypt';
    showToast('Output transferred to input', 'primary', 1200);
  }
}
</script>

<style scoped>
.vk-mode-segment-pill {
  display: flex;
  background: #F1EFEC;
  border-radius: var(--radius-pill, 999px);
  padding: 4px;
  margin-bottom: 16px;
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.dark .vk-mode-segment-pill {
  background: #1E1E1E;
  border-color: rgba(255, 255, 255, 0.06);
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

.dark .vk-segment-choice.is-active {
  background: #F4F4F2;
  color: #101010;
}

.vk-algo-scroller {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 2px 2px 14px 2px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.vk-algo-scroller::-webkit-scrollbar {
  display: none;
}

.vk-algo-pill {
  display: inline-flex;
  align-items: center;
  padding: 7px 16px;
  height: 36px;
  background: #F1EFEC;
  border: 1px solid rgba(0, 0, 0, 0.04);
  border-radius: var(--radius-pill, 999px);
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--text-secondary);
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: all 0.16s ease;
  outline: none;
}

.vk-algo-pill:hover {
  background: #E5E4E0;
  color: var(--text-primary);
}

.dark .vk-algo-pill {
  background: #1E1E1E;
  border-color: rgba(255, 255, 255, 0.06);
}

.dark .vk-algo-pill:hover {
  background: #252525;
}

.vk-algo-pill.is-active {
  background: var(--brand-red, #B82825);
  color: #FFFFFF;
  border-color: transparent;
}

.vk-cipher-fields {
  margin-bottom: 24px;
}

.vk-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.vk-char-counter {
  font-size: 0.725rem;
  color: var(--text-muted);
  font-family: var(--vk-font-mono);
}

.vk-shift-number {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--brand-red);
  font-family: var(--vk-font-mono);
}

.vk-custom-range {
  width: 100%;
  accent-color: var(--brand-red);
  cursor: pointer;
  height: 6px;
  border-radius: var(--radius-pill, 999px);
  background: var(--vk-slider-track);
}

.vk-error-notice {
  margin-top: 12px;
  padding: 12px 16px;
  border-radius: var(--radius-md);
  background: var(--brand-red-subtle);
  color: var(--brand-red);
  font-size: 0.85rem;
  font-weight: 600;
}

.vk-output-section {
  margin-bottom: 40px;
}

.vk-output-card {
  background: #F1EFEC;
  border-radius: 20px;
  padding: 18px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  animation: vkRiseIn var(--vk-motion-base) var(--vk-ease-enter) forwards;
}

.dark .vk-output-card {
  background: #1E1E1E;
  border-color: rgba(255, 255, 255, 0.06);
}

.vk-output-box {
  font-size: 0.95rem;
  color: var(--text-primary);
  word-break: break-all;
  white-space: pre-wrap;
  margin-bottom: 14px;
  max-height: 200px;
  overflow-y: auto;
}

.vk-output-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid var(--vk-divider);
  padding-top: 12px;
}

.font-mono {
  font-family: var(--vk-font-mono);
}
</style>
