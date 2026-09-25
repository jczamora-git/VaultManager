<template>
  <img
    :src="logoSrc"
    :alt="computedAlt"
    :style="logoStyle"
    class="vk-logo"
    loading="eager"
    decoding="async"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { VAULTIFY_LOGO_DEFAULT, VAULTIFY_LOGO_ALT } from '@/constants/branding';
import { useSettingsStore } from '@/stores/settings.store';

const props = withDefaults(
  defineProps<{
    variant?: 'default' | 'alt' | 'auto';
    surface?: 'brand' | 'light' | 'dark' | 'auto';
    size?: number | string;
    alt?: string;
    decorative?: boolean;
  }>(),
  {
    variant: 'auto',
    surface: 'auto',
    size: 40,
    alt: 'Vaultify',
    decorative: false,
  }
);

const settingsStore = useSettingsStore();

const computedAlt = computed(() => (props.decorative ? '' : props.alt));

const logoSrc = computed(() => {
  if (props.variant === 'alt') {
    return VAULTIFY_LOGO_ALT;
  }
  if (props.variant === 'default') {
    return VAULTIFY_LOGO_DEFAULT;
  }

  // Auto variant logic based on surface
  if (props.surface === 'brand' || props.surface === 'dark') {
    return VAULTIFY_LOGO_ALT;
  }
  if (props.surface === 'light') {
    return VAULTIFY_LOGO_DEFAULT;
  }

  // Auto surface based on active theme
  const isDark =
    settingsStore.settings.theme === 'dark' ||
    (settingsStore.settings.theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  return isDark ? VAULTIFY_LOGO_ALT : VAULTIFY_LOGO_DEFAULT;
});

const logoStyle = computed(() => {
  if (!props.size) return {};
  const sizeValue = typeof props.size === 'number' ? `${props.size}px` : props.size;
  return {
    width: sizeValue,
    height: sizeValue,
  };
});
</script>

<style scoped>
.vk-logo {
  display: inline-block;
  object-fit: contain;
  vertical-align: middle;
  user-select: none;
}
</style>
