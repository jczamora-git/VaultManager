<template>
  <div class="vk-password-analyzer-content">
    <!-- INPUT BOX -->
    <div class="vk-section-header-block">
      <span class="vk-section-kicker">PASSWORD TO ANALYZE</span>
    </div>

    <div class="vk-analyzer-input-card">
      <div class="vk-analyzer-input-wrapper">
        <input
          v-model="inputPassword"
          :type="showPassword ? 'text' : 'password'"
          class="vk-analyzer-input font-mono"
          placeholder="Enter or paste a password..."
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
          @input="handleInput"
        />

        <div class="vk-analyzer-input-actions">
          <!-- Clear Button -->
          <button
            v-if="inputPassword"
            type="button"
            class="vk-analyzer-icon-btn"
            title="Clear password"
            aria-label="Clear password"
            @click="clearPassword"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="m15 9-6 6" />
              <path d="m9 9 6 6" />
            </svg>
          </button>

          <!-- Show / Hide Toggle -->
          <button
            type="button"
            class="vk-analyzer-icon-btn"
            :title="showPassword ? 'Hide password' : 'Show password'"
            :aria-label="showPassword ? 'Hide password' : 'Show password'"
            @click="showPassword = !showPassword"
          >
            <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
              <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
              <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
              <line x1="2" x2="22" y1="2" y2="22" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- STRENGTH METER & RESULT HEADER -->
    <div class="vk-analyzer-meter-section">
      <div class="vk-analyzer-meter-header">
        <span class="vk-analyzer-meter-title">Strength</span>
        <span
          v-if="inputPassword && analysis.label"
          class="vk-analyzer-strength-badge"
          :style="{ color: analysis.color }"
          role="status"
          :aria-label="`Password strength: ${analysis.label}`"
        >
          {{ analysis.label }}
        </span>
        <span v-else class="vk-analyzer-empty-hint">
          Enter a password to analyze its strength.
        </span>
      </div>

      <div class="vk-analyzer-bars" role="progressbar" :aria-valuenow="analysis.score" aria-valuemin="0" aria-valuemax="4">
        <div
          v-for="i in 4"
          :key="i"
          class="vk-analyzer-bar-segment"
          :style="{
            backgroundColor: (inputPassword && i <= analysis.score) ? analysis.color : 'var(--vk-meter-track, rgba(0, 0, 0, 0.06))',
          }"
        ></div>
      </div>
    </div>

    <!-- ANALYSIS RESULTS (ONLY WHEN PASSWORD IS ENTERED) -->
    <div v-if="inputPassword" class="vk-analyzer-results-wrapper">
      <!-- SUMMARY CARD: ESTIMATED RESISTANCE -->
      <div class="vk-resistance-card">
        <div class="vk-resistance-header">
          <span class="vk-section-kicker">ESTIMATED RESISTANCE</span>
        </div>

        <div class="vk-resistance-headline font-mono">
          ~ {{ analysis.headlineCrackTime }}
        </div>

        <p class="vk-resistance-description">
          {{ resistanceSummaryText }}
        </p>

        <p class="vk-resistance-disclaimer">
          Estimates vary depending on attacker hardware, hashing method, and security controls.
        </p>

        <!-- Collapsible Scenarios Toggle -->
        <button
          type="button"
          class="vk-scenarios-toggle-btn"
          @click="showScenarios = !showScenarios"
        >
          <span>{{ showScenarios ? 'Hide attack scenarios' : 'View attack scenarios' }}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            :class="{ 'is-rotated': showScenarios }"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>

        <!-- Collapsible Attack Scenarios Breakdown -->
        <div v-if="showScenarios" class="vk-scenarios-breakdown">
          <div class="vk-scenario-row">
            <div class="vk-scenario-meta">
              <span class="vk-scenario-name">Online (throttled)</span>
              <span class="vk-scenario-desc">Limited login rate (100/hr)</span>
            </div>
            <span class="vk-scenario-val font-mono">{{ analysis.crackTimes.onlineThrottled }}</span>
          </div>

          <div class="vk-scenario-row">
            <div class="vk-scenario-meta">
              <span class="vk-scenario-name">Online (unthrottled)</span>
              <span class="vk-scenario-desc">High-volume web attacks</span>
            </div>
            <span class="vk-scenario-val font-mono">{{ analysis.crackTimes.onlineUnthrottled }}</span>
          </div>

          <div class="vk-scenario-row">
            <div class="vk-scenario-meta">
              <span class="vk-scenario-name">Offline (slow hash)</span>
              <span class="vk-scenario-desc">Modern KDF (bcrypt/Argon2)</span>
            </div>
            <span class="vk-scenario-val font-mono">{{ analysis.crackTimes.offlineSlow }}</span>
          </div>

          <div class="vk-scenario-row">
            <div class="vk-scenario-meta">
              <span class="vk-scenario-name">Offline (fast hash)</span>
              <span class="vk-scenario-desc">High-speed GPU cracking</span>
            </div>
            <span class="vk-scenario-val font-mono">{{ analysis.crackTimes.offlineFast }}</span>
          </div>

          <div class="vk-scenario-row vk-entropy-row">
            <div class="vk-scenario-meta">
              <span class="vk-scenario-name">Estimated Entropy</span>
              <span class="vk-scenario-desc">Pattern-aware bits</span>
            </div>
            <span class="vk-scenario-val font-mono">{{ analysis.entropyBits }} bits</span>
          </div>
        </div>
      </div>

      <!-- SECURITY ANALYSIS CHECKS -->
      <div class="vk-analysis-section">
        <div class="vk-section-header-block">
          <span class="vk-section-kicker">SECURITY ANALYSIS</span>
        </div>

        <div class="vk-checks-card">
          <!-- Check 1: Length -->
          <div class="vk-check-item">
            <span class="vk-check-icon" :class="analysis.checks.length ? 'is-pass' : 'is-fail'">
              <svg v-if="analysis.checks.length" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </span>
            <span class="vk-check-text">
              {{ analysis.checks.length ? `${analysis.checks.lengthCount} characters (Good length)` : `${analysis.checks.lengthCount} characters (Short length)` }}
            </span>
          </div>

          <!-- Check 2: Character pool mix -->
          <div class="vk-check-item">
            <span class="vk-check-icon" :class="charPoolCount >= 3 ? 'is-pass' : 'is-neutral'">
              <svg v-if="charPoolCount >= 3" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="1"></circle>
              </svg>
            </span>
            <span class="vk-check-text">
              {{ characterMixSummary }}
            </span>
          </div>

          <!-- Check 3: Common words / dictionary pattern -->
          <div class="vk-check-item">
            <span class="vk-check-icon" :class="analysis.checks.noCommonPatterns ? 'is-pass' : 'is-fail'">
              <svg v-if="analysis.checks.noCommonPatterns" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </span>
            <span class="vk-check-text">
              {{ analysis.checks.noCommonPatterns ? 'No common dictionary word or pattern' : 'Contains common word, date, or keyboard pattern' }}
            </span>
          </div>

          <!-- Check 4: Repeated sequences -->
          <div class="vk-check-item">
            <span class="vk-check-icon" :class="analysis.checks.noRepeatedSequences ? 'is-pass' : 'is-fail'">
              <svg v-if="analysis.checks.noRepeatedSequences" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </span>
            <span class="vk-check-text">
              {{ analysis.checks.noRepeatedSequences ? 'No predictable sequences or character repeats' : 'Contains repeated characters or predictable sequence' }}
            </span>
          </div>

          <!-- Warnings List -->
          <div v-if="analysis.warnings.length > 0" class="vk-warnings-sublist">
            <div v-for="(warn, idx) in analysis.warnings" :key="idx" class="vk-warning-item">
              <span class="vk-warning-dot">!</span>
              <span class="vk-warning-text">{{ warn }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- SUGGESTIONS -->
      <div class="vk-analysis-section">
        <div class="vk-section-header-block">
          <span class="vk-section-kicker">SUGGESTIONS</span>
        </div>

        <div class="vk-suggestions-card">
          <div v-if="analysis.suggestions.length > 0" class="vk-suggestions-list">
            <div v-for="(sug, idx) in analysis.suggestions" :key="idx" class="vk-suggestion-item">
              <span class="vk-suggestion-bullet">•</span>
              <span class="vk-suggestion-text">{{ sug }}</span>
            </div>
          </div>
          <div v-else class="vk-suggestions-empty">
            No major weaknesses detected. This password demonstrates strong resistance.
          </div>
        </div>
      </div>

      <!-- GENERATE STRONGER PASSWORD CTA -->
      <div class="vk-analyzer-actions">
        <button
          type="button"
          class="vk-btn vk-btn-primary vk-btn-block"
          @click="handleSwitchToGenerate"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
            <path d="M16 21h5v-5"/>
          </svg>
          <span>Generate a Strong Password</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue';
import { PasswordStrengthService, PasswordAnalysis } from '@/services/passwordStrength.service';

const emit = defineEmits<{
  (e: 'switch-to-generate'): void;
}>();

const inputPassword = ref('');
const showPassword = ref(false);
const showScenarios = ref(false);

const analysis = computed<PasswordAnalysis>(() => {
  return PasswordStrengthService.analyze(inputPassword.value);
});

const charPoolCount = computed(() => {
  const c = analysis.value.checks;
  let count = 0;
  if (c.uppercase) count++;
  if (c.lowercase) count++;
  if (c.numbers) count++;
  if (c.symbols) count++;
  return count;
});

const characterMixSummary = computed(() => {
  const c = analysis.value.checks;
  const types: string[] = [];
  if (c.uppercase) types.push('Upper');
  if (c.lowercase) types.push('Lower');
  if (c.numbers) types.push('Numbers');
  if (c.symbols) types.push('Symbols');
  if (types.length === 0) return 'No character types';
  if (types.length >= 4) return 'Mixed character types (Upper, Lower, Numbers, Symbols)';
  return `Contains: ${types.join(', ')}`;
});

const resistanceSummaryText = computed(() => {
  const score = analysis.value.score;
  switch (score) {
    case 4:
      return 'Excellent resistance against common and automated password attacks.';
    case 3:
      return 'Strong resistance against common dictionary and automated attacks.';
    case 2:
      return 'Moderate resistance; may be vulnerable to high-speed offline hash cracking.';
    case 1:
      return 'Weak resistance; easily cracked with automated wordlists.';
    default:
      return 'Very low resistance; susceptible to instant cracking.';
  }
});

function handleInput() {
  // Real-time evaluation triggers automatically via computed analysis
}

function clearPassword() {
  inputPassword.value = '';
}

function handleSwitchToGenerate() {
  clearPassword();
  emit('switch-to-generate');
}

function resetVolatileState() {
  inputPassword.value = '';
  showPassword.value = false;
  showScenarios.value = false;
}

onUnmounted(() => {
  resetVolatileState();
});

defineExpose({
  resetVolatileState,
});
</script>

<style scoped>
.vk-password-analyzer-content {
  display: flex;
  flex-direction: column;
}

.vk-section-header-block {
  margin-top: 4px;
  margin-bottom: 10px;
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

/* INPUT CARD */
.vk-analyzer-input-card {
  background: var(--vk-surface-soft, #F1EFEC);
  border-radius: 18px;
  padding: 12px 16px;
  margin-bottom: 18px;
  border: 1px solid var(--vk-border, rgba(0, 0, 0, 0.04));
  transition: border-color var(--vk-motion-base) ease;
}

:global(.dark) .vk-analyzer-input-card,
:global(.ion-palette-dark) .vk-analyzer-input-card,
:global(body.dark-theme) .vk-analyzer-input-card,
:global([data-theme="dark"]) .vk-analyzer-input-card {
  background: #202020;
  border-color: rgba(255, 255, 255, 0.07);
}

.vk-analyzer-input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.vk-analyzer-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: 0.02em;
  padding: 6px 0;
  min-width: 0;
}

.vk-analyzer-input::placeholder {
  color: var(--text-muted, #9A9A9A);
  font-family: inherit;
  font-weight: 400;
  font-size: 0.95rem;
}

.vk-analyzer-input-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.vk-analyzer-icon-btn {
  background: transparent;
  border: none;
  color: var(--text-secondary, #777);
  cursor: pointer;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: color var(--vk-motion-base) ease, background-color var(--vk-motion-base) ease;
}

.vk-analyzer-icon-btn:hover {
  color: var(--text-primary);
  background: rgba(0, 0, 0, 0.04);
}

:global(.dark) .vk-analyzer-icon-btn:hover,
:global(.ion-palette-dark) .vk-analyzer-icon-btn:hover,
:global(body.dark-theme) .vk-analyzer-icon-btn:hover,
:global([data-theme="dark"]) .vk-analyzer-icon-btn:hover {
  background: rgba(255, 255, 255, 0.08);
}

/* STRENGTH METER */
.vk-analyzer-meter-section {
  margin-bottom: 22px;
}

.vk-analyzer-meter-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.825rem;
  margin-bottom: 8px;
}

.vk-analyzer-meter-title {
  color: var(--text-secondary);
  font-weight: 600;
}

.vk-analyzer-strength-badge {
  font-size: 0.85rem;
  font-weight: 800;
  transition: color var(--vk-motion-base) ease;
}

.vk-analyzer-empty-hint {
  font-size: 0.775rem;
  color: var(--text-muted);
}

.vk-analyzer-bars {
  display: flex;
  gap: 6px;
  height: 6px;
  width: 100%;
}

.vk-analyzer-bar-segment {
  flex: 1;
  border-radius: var(--radius-pill, 999px);
  transition: background-color 150ms ease;
}

:global(.dark) {
  --vk-meter-track: rgba(255, 255, 255, 0.08);
}

/* RESISTANCE SUMMARY CARD */
.vk-resistance-card {
  background: var(--vk-surface-soft, #F1EFEC);
  border-radius: 20px;
  padding: 18px 18px 16px 18px;
  margin-bottom: 20px;
  border: 1px solid var(--vk-border, rgba(0, 0, 0, 0.04));
}

:global(.dark) .vk-resistance-card,
:global(.ion-palette-dark) .vk-resistance-card,
:global(body.dark-theme) .vk-resistance-card,
:global([data-theme="dark"]) .vk-resistance-card {
  background: #202020;
  border-color: rgba(255, 255, 255, 0.07);
}

.vk-resistance-header {
  margin-bottom: 6px;
}

.vk-resistance-headline {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 6px;
  letter-spacing: 0.02em;
}

.vk-resistance-description {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.4;
  margin: 0 0 10px 0;
}

.vk-resistance-disclaimer {
  font-size: 0.725rem;
  color: var(--text-muted);
  line-height: 1.35;
  margin: 0 0 14px 0;
}

.vk-scenarios-toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: none;
  color: var(--brand-red, #D3332F);
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  padding: 0;
  outline: none;
}

.vk-scenarios-toggle-btn svg {
  transition: transform var(--vk-motion-base) ease;
}

.vk-scenarios-toggle-btn svg.is-rotated {
  transform: rotate(180deg);
}

.vk-scenarios-breakdown {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid var(--vk-divider);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.vk-scenario-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.vk-scenario-meta {
  display: flex;
  flex-direction: column;
}

.vk-scenario-name {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-primary);
}

.vk-scenario-desc {
  font-size: 0.7rem;
  color: var(--text-muted);
}

.vk-scenario-val {
  font-size: 0.825rem;
  font-weight: 700;
  color: var(--text-primary);
  text-align: right;
  white-space: nowrap;
}

.vk-entropy-row {
  margin-top: 4px;
  padding-top: 8px;
  border-top: 1px dashed var(--vk-divider);
}

/* CHECKS CARD */
.vk-analysis-section {
  margin-bottom: 20px;
}

.vk-checks-card,
.vk-suggestions-card {
  background: var(--vk-surface-soft, #F1EFEC);
  border-radius: 18px;
  padding: 16px;
  border: 1px solid var(--vk-border, rgba(0, 0, 0, 0.04));
}

:global(.dark) .vk-checks-card,
:global(.dark) .vk-suggestions-card,
:global(.ion-palette-dark) .vk-checks-card,
:global(.ion-palette-dark) .vk-suggestions-card,
:global(body.dark-theme) .vk-checks-card,
:global(body.dark-theme) .vk-suggestions-card,
:global([data-theme="dark"]) .vk-checks-card,
:global([data-theme="dark"]) .vk-suggestions-card {
  background: #202020;
  border-color: rgba(255, 255, 255, 0.07);
}

.vk-check-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.vk-check-item:last-child {
  margin-bottom: 0;
}

.vk-check-icon {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.vk-check-icon.is-pass {
  background: rgba(22, 163, 74, 0.14);
  color: #16A34A;
}

.vk-check-icon.is-fail {
  background: rgba(211, 51, 47, 0.14);
  color: var(--brand-red, #D3332F);
}

.vk-check-icon.is-neutral {
  background: rgba(150, 150, 150, 0.14);
  color: var(--text-muted);
}

.vk-check-text {
  font-size: 0.825rem;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.35;
}

.vk-warnings-sublist {
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid var(--vk-divider);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.vk-warning-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.vk-warning-dot {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  background: var(--brand-red, #D3332F);
  color: #FFFFFF;
  font-size: 0.65rem;
  font-weight: 800;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 1px;
}

.vk-warning-text {
  font-size: 0.775rem;
  color: var(--brand-red, #D3332F);
  font-weight: 600;
  line-height: 1.35;
}

/* SUGGESTIONS */
.vk-suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.vk-suggestion-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.vk-suggestion-bullet {
  color: var(--brand-red, #D3332F);
  font-weight: 800;
  font-size: 0.9rem;
  line-height: 1.2;
}

.vk-suggestion-text {
  font-size: 0.825rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

.vk-suggestions-empty {
  font-size: 0.825rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

/* ACTIONS */
.vk-analyzer-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
  margin-bottom: 20px;
}
</style>
