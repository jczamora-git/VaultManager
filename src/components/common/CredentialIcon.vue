<template>
  <div
    class="vk-credential-icon"
    :style="{
      width: `${size}px`,
      height: `${size}px`,
      minWidth: `${size}px`,
      minHeight: `${size}px`,
      borderRadius: `${radius || Math.round(size * 0.3)}px`,
      ...(hasImageError || !faviconUrl ? fallbackStyle : {}),
    }"
  >
    <img
      v-if="faviconUrl && !hasImageError"
      :src="faviconUrl"
      :alt="title"
      class="vk-icon-img"
      @error="onImageError"
      loading="lazy"
    />
    <span v-else class="vk-icon-letter" :style="{ fontSize: `${Math.round(size * 0.44)}px` }">
      {{ letter }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { FaviconService } from '@/services/favicon.service';

const props = withDefaults(
  defineProps<{
    title?: string;
    domain?: string;
    website?: string;
    size?: number;
    radius?: number;
  }>(),
  {
    title: '',
    domain: '',
    website: '',
    size: 46,
  }
);

const hasImageError = ref(false);

const cleanDomain = computed(() => {
  return props.domain || FaviconService.extractDomain(props.website);
});

const faviconUrl = computed(() => {
  if (!cleanDomain.value) return '';
  return FaviconService.getFaviconUrl(cleanDomain.value);
});

const letter = computed(() => {
  return FaviconService.getFallbackLetter(props.title, cleanDomain.value);
});

const fallbackStyle = computed(() => {
  const seed = props.title || cleanDomain.value || 'Key';
  return FaviconService.getDeterministicAvatarStyle(seed);
});

function onImageError() {
  hasImageError.value = true;
  if (cleanDomain.value) {
    FaviconService.markDomainFailed(cleanDomain.value);
  }
}

watch(
  () => [props.domain, props.website],
  () => {
    hasImageError.value = false;
  }
);
</script>

<style scoped>
.vk-credential-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: var(--surface-light);
  position: relative;
  flex-shrink: 0;
  user-select: none;
}

.vk-icon-img {
  width: 60%;
  height: 60%;
  object-fit: contain;
}

.vk-icon-letter {
  font-weight: 800;
  color: #ffffff;
  font-family: var(--vk-font-sans);
}
</style>
