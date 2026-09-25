import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useProfileStore } from '@/stores/profile.store';

/**
 * Time-based local greeting composable
 * 05:00–11:59 -> Good morning
 * 12:00–17:59 -> Good afternoon
 * 18:00–04:59 -> Good evening
 */
export function useGreeting(customName?: () => string) {
  const profileStore = useProfileStore();
  const currentHour = ref(new Date().getHours());
  let intervalId: number | null = null;

  function refreshTime() {
    currentHour.value = new Date().getHours();
  }

  onMounted(() => {
    refreshTime();
    // Refresh greeting periodically
    intervalId = window.setInterval(refreshTime, 60000);
  });

  onUnmounted(() => {
    if (intervalId) {
      window.clearInterval(intervalId);
      intervalId = null;
    }
  });

  const greeting = computed(() => {
    const hour = currentHour.value;
    if (hour >= 5 && hour < 12) {
      return 'Good morning';
    }
    if (hour >= 12 && hour < 18) {
      return 'Good afternoon';
    }
    return 'Good evening';
  });

  const resolvedName = computed(() => {
    if (customName) return customName();
    return profileStore.displayName;
  });

  const greetingWithName = computed(() => {
    const name = resolvedName.value;
    if (!name || name === 'User') {
      return greeting.value;
    }
    return `${greeting.value}, ${name}.`;
  });

  return {
    greeting,
    greetingWithName,
    refreshTime,
  };
}
