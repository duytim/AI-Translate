import { SpeechService } from '../services/speech.js';
import { TranslationStore } from '../stores/translationStore.js';
import { StorageService } from '../services/storage.js';
import { Toast } from './ToastNotification.js';
import { Logger } from '../utils/constants.js';

/**
 * Output Panel Setup
 * Displays translation results with skeleton loading and error states
 */
export function setupOutputPanel() {
  const panelEl = document.getElementById('outputPanel');
  const labelEl = document.getElementById('targetLangLabel');
  const loadingEl = document.getElementById('loadingIndicator');
  const contentEl = document.getElementById('resultContent');

  const outTranslation = document.getElementById('outTranslation');
  const outPhonetic = document.getElementById('outPhonetic');
  const copyBtn = document.getElementById('copyBtn');
  const ttsTranslationBtn = document.getElementById('ttsTranslation');
  const sourceLangSelect = document.getElementById('sourceLang');
  const targetLangSelect = document.getElementById('targetLang');

  let lastCopiedToastId = null;

  // Language name mappings
  const langNames = {
    vi: 'Việt',
    zh: 'Trung (Giản thể)',
    ko: 'Hàn',
    ja: 'Nhật',
    en: 'Anh',
    auto: 'Phát hiện'
  };

  // Subscribe to store changes
  const unsubscribe = TranslationStore.subscribe((state) => {
    updatePanel(state);
  });

  /**
   * Update panel based on store state
   */
  function updatePanel(state) {
    const { isLoading, currentTranslation, error, targetLanguage } = state;

    // Update label
    labelEl.textContent = langNames[targetLanguage] || 'Trung (Giản thể)';

    if (isLoading) {
      showLoading();
    } else if (error) {
      showError(error);
    } else if (currentTranslation) {
      showResult(currentTranslation);
    } else {
      hidePanel();
    }
  }

  /**
   * Show loading skeleton
   */
  function showLoading() {
    panelEl.classList.remove('hidden');
    loadingEl.classList.remove('hidden');
    contentEl.classList.add('hidden');

    // Render skeleton loading
    loadingEl.innerHTML = `
      <div class="space-y-3">
        <div class="h-8 bg-gray-300 dark:bg-gray-700 rounded-lg w-3/4 animate-pulse"></div>
        <div class="h-6 bg-gray-300 dark:bg-gray-700 rounded-lg w-1/2 animate-pulse"></div>
        <div class="h-6 bg-gray-300 dark:bg-gray-700 rounded-lg w-2/3 animate-pulse"></div>
      </div>
    `;
  }

  /**
   * Show error message
   */
  function showError(error) {
    panelEl.classList.remove('hidden');
    loadingEl.classList.add('hidden');
    contentEl.classList.remove('hidden');

    outTranslation.className = 'text-lg text-red-500 dark:text-red-400 font-medium';
    outTranslation.textContent = error.message || 'Lỗi dịch thuật. Vui lòng thử lại.';
    outPhonetic.classList.add('hidden');

    Logger.debug('OutputPanel', `Error shown: ${error.type}`);
  }

  /**
   * Show translation result
   */
  function showResult(data) {
    panelEl.classList.remove('hidden');
    loadingEl.classList.add('hidden');
    contentEl.classList.remove('hidden');

    outTranslation.className = 'text-3xl font-normal leading-tight text-gray-900 dark:text-white mb-2 selection:bg-blue-200 dark:selection:bg-blue-800';
    outTranslation.textContent = data.translation || '';

    if (data.phonetic) {
      outPhonetic.classList.remove('hidden');
      outPhonetic.textContent = data.phonetic;
    } else {
      outPhonetic.classList.add('hidden');
    }
  }

  /**
   * Hide panel
   */
  function hidePanel() {
    panelEl.classList.add('hidden');
  }

  // TTS for translation
  ttsTranslationBtn.addEventListener('click', () => {
    const state = TranslationStore.getState();
    if (state.currentTranslation) {
      SpeechService.speak(
        state.currentTranslation.translation,
        targetLangSelect.value
      );
    }
  });

  // Copy translation
  copyBtn.addEventListener('click', () => {
    const state = TranslationStore.getState();
    if (state.currentTranslation) {
      navigator.clipboard.writeText(state.currentTranslation.translation);

      // Dismiss previous toast
      if (lastCopiedToastId) {
        Toast.dismiss(lastCopiedToastId);
      }

      // Show success toast
      lastCopiedToastId = Toast.success('Đã sao chép');

      // Visual feedback on button
      const origHTML = copyBtn.innerHTML;
      copyBtn.innerHTML = '<i class="fa-solid fa-check text-green-500"></i>';
      setTimeout(() => {
        copyBtn.innerHTML = origHTML;
      }, 2000);
    }
  });

  Logger.debug('OutputPanel', 'Setup complete');

  // Return cleanup function
  return () => {
    unsubscribe();
  };
}