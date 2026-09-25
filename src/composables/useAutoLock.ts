import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';
import { useVaultStore } from '@/stores/vault.store';
import { useSettingsStore } from '@/stores/settings.store';
import { App as CapacitorApp } from '@capacitor/app';

export function useAutoLock() {
  const router = useRouter();
  const authStore = useAuthStore();
  const vaultStore = useVaultStore();
  const settingsStore = useSettingsStore();

  let idleTimer: number | null = null;

  const lockVault = () => {
    if (authStore.isUnlocked) {
      authStore.lock();
      vaultStore.clearInMemoryData();
      router.replace('/unlock');
    }
  };

  const resetIdleTimer = () => {
    if (idleTimer) {
      window.clearTimeout(idleTimer);
      idleTimer = null;
    }

    const timeout = settingsStore.settings.autoLockTimeout;
    if (timeout > 0 && authStore.isUnlocked) {
      idleTimer = window.setTimeout(() => {
        lockVault();
      }, timeout * 1000);
    }
  };

  const handleVisibilityChange = () => {
    if (document.hidden && settingsStore.settings.lockOnBackground && authStore.isUnlocked) {
      lockVault();
    }
  };

  const setupListeners = () => {
    const events = ['pointerdown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((evt) => {
      window.addEventListener(evt, resetIdleTimer, { passive: true });
    });

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Capacitor native app state change
    try {
      CapacitorApp.addListener('appStateChange', ({ isActive }) => {
        if (!isActive && settingsStore.settings.lockOnBackground && authStore.isUnlocked) {
          lockVault();
        }
      });
    } catch {
      // Running in browser
    }

    resetIdleTimer();
  };

  const removeListeners = () => {
    const events = ['pointerdown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((evt) => {
      window.removeEventListener(evt, resetIdleTimer);
    });

    document.removeEventListener('visibilitychange', handleVisibilityChange);

    if (idleTimer) {
      window.clearTimeout(idleTimer);
      idleTimer = null;
    }
  };

  return {
    setupListeners,
    removeListeners,
    lockVault,
    resetIdleTimer,
  };
}
