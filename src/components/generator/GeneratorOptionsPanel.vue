<template>
  <div class="vk-generator-options">
    <!-- Length Slider -->
    <div class="vk-length-control-row">
      <div class="vk-length-header">
        <span class="vk-option-title">Length</span>
        <span class="vk-length-number">{{ options.length }}</span>
      </div>
      <div class="vk-slider-wrap">
        <input
          type="range"
          min="8"
          max="64"
          :value="options.length"
          class="vk-custom-range"
          @input="onLengthChange"
        />
        <div class="vk-slider-limits">
          <span>8</span>
          <span>32</span>
          <span>64</span>
        </div>
      </div>
    </div>

    <!-- Toggle Option Rows -->
    <div class="vk-toggle-rows-group">
      <label class="vk-option-toggle-row">
        <span class="vk-option-title">Uppercase (A–Z)</span>
        <input
          type="checkbox"
          class="vk-custom-checkbox"
          :checked="options.uppercase"
          @change="updateOption('uppercase', ($event.target as HTMLInputElement).checked)"
        />
      </label>

      <label class="vk-option-toggle-row">
        <span class="vk-option-title">Lowercase (a–z)</span>
        <input
          type="checkbox"
          class="vk-custom-checkbox"
          :checked="options.lowercase"
          @change="updateOption('lowercase', ($event.target as HTMLInputElement).checked)"
        />
      </label>

      <label class="vk-option-toggle-row">
        <span class="vk-option-title">Numbers (0–9)</span>
        <input
          type="checkbox"
          class="vk-custom-checkbox"
          :checked="options.numbers"
          @change="updateOption('numbers', ($event.target as HTMLInputElement).checked)"
        />
      </label>

      <label class="vk-option-toggle-row">
        <span class="vk-option-title">Symbols (!@#$%...)</span>
        <input
          type="checkbox"
          class="vk-custom-checkbox"
          :checked="options.symbols"
          @change="updateOption('symbols', ($event.target as HTMLInputElement).checked)"
        />
      </label>

      <label class="vk-option-toggle-row">
        <span class="vk-option-title">Avoid Ambiguous Characters</span>
        <input
          type="checkbox"
          class="vk-custom-checkbox"
          :checked="options.avoidAmbiguous"
          @change="updateOption('avoidAmbiguous', ($event.target as HTMLInputElement).checked)"
        />
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { GeneratorOptions } from '@/models/generator.model';

const props = defineProps<{
  options: GeneratorOptions;
}>();

const emit = defineEmits<{
  (e: 'update:options', val: GeneratorOptions): void;
  (e: 'change'): void;
}>();

function onLengthChange(event: Event) {
  const val = parseInt((event.target as HTMLInputElement).value, 10);
  emit('update:options', { ...props.options, length: val });
  emit('change');
}

function updateOption<K extends keyof GeneratorOptions>(key: K, value: GeneratorOptions[K]) {
  emit('update:options', { ...props.options, [key]: value });
  emit('change');
}
</script>

<style scoped>
.vk-generator-options {
  display: flex;
  flex-direction: column;
}

.vk-length-control-row {
  padding: 14px 0 18px 0;
  border-bottom: 1px solid var(--vk-divider);
}

.vk-length-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.vk-option-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.01em;
}

.vk-length-number {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--brand-red);
  font-family: var(--vk-font-mono);
}

.vk-slider-wrap {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.vk-custom-range {
  width: 100%;
  accent-color: var(--brand-red);
  cursor: pointer;
  height: 6px;
  border-radius: var(--radius-pill);
  background: var(--vk-slider-track);
}

.vk-slider-limits {
  display: flex;
  justify-content: space-between;
  font-size: 0.725rem;
  color: var(--text-muted);
  font-family: var(--vk-font-mono);
  font-weight: 600;
}

.vk-toggle-rows-group {
  display: flex;
  flex-direction: column;
}

.vk-option-toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 56px;
  padding: 12px 0;
  border-bottom: 1px solid var(--vk-divider);
  cursor: pointer;
  user-select: none;
}

.vk-option-toggle-row:last-child {
  border-bottom: none;
}

.vk-custom-checkbox {
  width: 22px;
  height: 22px;
  accent-color: var(--brand-red);
  border-radius: 6px;
  cursor: pointer;
}

:global(.dark) .vk-custom-range,
:global(.ion-palette-dark) .vk-custom-range,
:global(body.dark-theme) .vk-custom-range,
:global([data-theme="dark"]) .vk-custom-range {
  background: #383838;
}
</style>
