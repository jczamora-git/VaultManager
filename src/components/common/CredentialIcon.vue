<template>
  <div
    class="vk-credential-icon"
    :style="{
      width: `${size}px`,
      height: `${size}px`,
      minWidth: `${size}px`,
      minHeight: `${size}px`,
      borderRadius: `${radius || Math.round(size * 0.3)}px`,
      ...(hasImageError || !cachedIcon ? fallbackStyle : {}),
    }"
  >
    <transition name="vk-icon-fade" mode="out-in">
      <img
        v-if="cachedIcon && !hasImageError"
        :key="cachedIcon"
        :src="cachedIcon"
        :alt="title"
        class="vk-icon-img"
        @error="onImageError"
        loading="lazy"
      />
      <span v-else key="fallback" class="vk-icon-letter" :style="{ fontSize: `${Math.round(size * 0.44)}px` }">
        {{ letter }}
      </span>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { FaviconService } from '@/services/favicon.service';
import { WebsiteIconCacheService } from '@/services/websiteIconCache.service';

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
  return props.domain || WebsiteIconCacheService.normalizeDomain(props.website);
});

// Cache First: Read strictly from local reactive cache (dataUrl). Never remote URL directly.
const cachedIcon = computed(() => {
  if (!cleanDomain.value) return null;
  return WebsiteIconCacheService.getCachedIcon(cleanDomain.value);
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
}

watch(
  () => [props.domain, props.website, cachedIcon.value],
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

/* Subtle crossfade (140ms) when icon updates */
.vk-icon-fade-enter-active,
.vk-icon-fade-leave-active {
  transition: opacity 140ms ease;
}

.vk-icon-fade-enter-from,
.vk-icon-fade-leave-to {
  opacity: 0;
}
</style>
