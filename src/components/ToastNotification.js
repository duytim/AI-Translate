import { TOAST_TYPES } from '../utils/constants.js';

/**
 * Toast notification system
 */
class ToastManager {
  constructor() {
    this.container = null;
    this.initContainer();
  }

  initContainer() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      this.container.className = 'fixed bottom-20 right-4 z-50 max-w-sm space-y-3 pointer-events-none';
      document.body.appendChild(this.container);
    }
  }

  /**
   * Show a toast notification
   * @param {string} message - Toast message
   * @param {string} type - Toast type (success, error, warning, info)
   * @param {number} duration - Duration in ms (0 = no auto-dismiss)
   */
  show(message, type = TOAST_TYPES.INFO, duration = 3000) {
    const toast = document.createElement('div');
    const timestamp = Date.now();
    toast.id = `toast-${timestamp}`;

    const bgColor = {
      success: 'bg-green-600',
      error: 'bg-red-600',
      warning: 'bg-amber-600',
      info: 'bg-blue-600'
    }[type] || 'bg-blue-600';

    const icon = {
      success: '✓',
      error: '✕',
      warning: '!',
      info: 'ⓘ'
    }[type] || 'ⓘ';

    toast.className = `
      ${bgColor} text-white px-4 py-3 rounded-lg shadow-lg
      text-sm font-medium pointer-events-auto
      animate-in fade-in slide-in-from-right-4 duration-300
      flex items-center gap-3
    `.trim();

    toast.innerHTML = `
      <span class="text-lg flex-shrink-0">${icon}</span>
      <span class="flex-1">${this.escapeHtml(message)}</span>
    `;

    this.container.appendChild(toast);

    if (duration > 0) {
      setTimeout(() => this.dismiss(timestamp), duration);
    }

    return timestamp;
  }

  /**
   * Dismiss a specific toast
   * @param {number} toastId - Toast ID returned from show()
   */
  dismiss(toastId) {
    const toast = document.getElementById(`toast-${toastId}`);
    if (toast) {
      toast.classList.add('animate-out', 'fade-out', 'slide-out-to-right-4');
      toast.addEventListener('animationend', () => toast.remove(), { once: true });
    }
  }

  /**
   * Escape HTML to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string}
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Convenience methods
  success(message, duration = 3000) {
    return this.show(message, TOAST_TYPES.SUCCESS, duration);
  }

  error(message, duration = 5000) {
    return this.show(message, TOAST_TYPES.ERROR, duration);
  }

  warning(message, duration = 4000) {
    return this.show(message, TOAST_TYPES.WARNING, duration);
  }

  info(message, duration = 3000) {
    return this.show(message, TOAST_TYPES.INFO, duration);
  }
}

export const Toast = new ToastManager();
