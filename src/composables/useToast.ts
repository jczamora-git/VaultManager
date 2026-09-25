import { ref } from 'vue';

export type ToastType = 'success' | 'danger' | 'error' | 'warning' | 'info' | 'primary' | 'medium';

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration: number;
  showClose: boolean;
}

const currentToast = ref<ToastMessage | null>(null);
let toastTimer: number | null = null;
let toastIdCounter = 0;

export function useToast() {
  const showToast = (
    message: string,
    type: ToastType = 'info',
    duration = 2200,
    options?: { showClose?: boolean }
  ) => {
    // Normalize type
    let normalizedType: 'success' | 'error' | 'warning' | 'info' = 'info';
    if (type === 'success') normalizedType = 'success';
    else if (type === 'danger' || type === 'error') normalizedType = 'error';
    else if (type === 'warning') normalizedType = 'warning';
    else normalizedType = 'info';

    if (toastTimer) {
      window.clearTimeout(toastTimer);
      toastTimer = null;
    }

    const id = ++toastIdCounter;
    currentToast.value = {
      id,
      message,
      type: normalizedType,
      duration,
      showClose: options?.showClose ?? (normalizedType === 'warning' || duration > 4000),
    };

    if (duration > 0) {
      toastTimer = window.setTimeout(() => {
        if (currentToast.value?.id === id) {
          currentToast.value = null;
        }
      }, duration);
    }
  };

  const dismissToast = () => {
    if (toastTimer) {
      window.clearTimeout(toastTimer);
      toastTimer = null;
    }
    currentToast.value = null;
  };

  return {
    currentToast,
    showToast,
    dismissToast,
  };
}
