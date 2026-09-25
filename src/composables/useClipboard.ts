import { ref } from 'vue';
import { ClipboardService } from '@/services/clipboard.service';
import { useSettingsStore } from '@/stores/settings.store';
import { useToast } from './useToast';

export function useClipboard() {
  const settingsStore = useSettingsStore();
  const { showToast } = useToast();
  const recentlyCopiedKey = ref<string | null>(null);
  let resetTimeout: number | null = null;

  const copy = async (text: string, label = 'Copied to clipboard', fieldKey?: string): Promise<boolean> => {
    if (!text) return false;

    const timeoutSec = settingsStore.settings.clipboardTimeout;
    const success = await ClipboardService.copyText(text, timeoutSec);

    if (success) {
      if (fieldKey) {
        recentlyCopiedKey.value = fieldKey;
        if (resetTimeout) window.clearTimeout(resetTimeout);
        resetTimeout = window.setTimeout(() => {
          recentlyCopiedKey.value = null;
        }, 2500);
      }

      // Display toast WITHOUT exposing sensitive passwords
      showToast(label, 'success', 2000);
      return true;
    } else {
      showToast('Failed to copy to clipboard', 'danger', 2500);
      return false;
    }
  };

  return {
    copy,
    recentlyCopiedKey,
  };
}
