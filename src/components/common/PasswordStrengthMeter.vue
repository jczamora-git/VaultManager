<template>
  <div class="vk-strength-meter">
    <div class="vk-strength-header">
      <span class="vk-strength-label">
        Password Strength
      </span>
      <span v-if="password && analysis.label" class="vk-strength-val" :style="{ color: analysis.color }">
        {{ analysis.label }}
      </span>
    </div>

    <!-- Segmented Strength Bars -->
    <div class="vk-strength-bars">
      <div
        v-for="i in 4"
        :key="i"
        class="vk-bar-segment"
        :style="{
          backgroundColor: (password && i <= analysis.score) ? analysis.color : 'var(--vk-border)',
        }"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { PasswordGeneratorService } from '@/services/password-generator.service';

const props = withDefaults(
  defineProps<{
    password?: string;
    showSuggestions?: boolean;
  }>(),
  {
    password: '',
    showSuggestions: true,
  }
);

const analysis = computed(() => {
  return PasswordGeneratorService.analyze(props.password || '');
});
</script>

<style scoped>
.vk-strength-meter {
  margin-top: 8px;
}

.vk-strength-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.775rem;
  margin-bottom: 6px;
}

.vk-strength-label {
  color: var(--text-secondary);
  font-weight: 500;
}

.vk-entropy-badge {
  font-size: 0.7rem;
  color: var(--text-muted);
  font-family: var(--vk-font-mono);
  font-weight: 500;
}

.vk-strength-val {
  font-size: 0.775rem;
  font-weight: 700;
  text-transform: capitalize;
}

.vk-strength-bars {
  display: flex;
  gap: 6px;
  height: 4px;
  width: 100%;
}

.vk-bar-segment {
  flex: 1;
  border-radius: var(--radius-pill);
  transition: background-color 0.25s ease;
}
</style>
