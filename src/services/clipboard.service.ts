export class ClipboardService {
  private static clearTimer: number | null = null;
  private static lastCopiedText: string | null = null;

  /**
   * Copies text to clipboard and optionally schedules auto-clearing
   */
  static async copyText(text: string, autoClearSeconds = 30): Promise<boolean> {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older web views
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }

      this.lastCopiedText = text;

      // Handle auto-clearing if configured (> 0)
      if (this.clearTimer) {
        window.clearTimeout(this.clearTimer);
        this.clearTimer = null;
      }

      if (autoClearSeconds > 0) {
        this.clearTimer = window.setTimeout(async () => {
          await this.clearClipboardIfMatching(text);
        }, autoClearSeconds * 1000);
      }

      return true;
    } catch (err) {
      console.error('Failed to copy text to clipboard', err);
      return false;
    }
  }

  /**
   * Clears clipboard only if it still contains the sensitive text we copied
   */
  private static async clearClipboardIfMatching(originalText: string): Promise<void> {
    try {
      if (navigator.clipboard && navigator.clipboard.readText && navigator.clipboard.writeText) {
        const currentText = await navigator.clipboard.readText().catch(() => null);
        if (currentText === originalText || currentText === this.lastCopiedText) {
          await navigator.clipboard.writeText('');
        }
      }
    } catch {
      // Best-effort auto-clear; browser permissions may block silent clipboard read/write
    } finally {
      this.clearTimer = null;
      this.lastCopiedText = null;
    }
  }
}
