import { translateText } from '../services/translator.js';
import { StorageService } from '../services/storage.js';
import { SpeechService } from '../services/speech.js';
import { TranslationStore } from '../stores/translationStore.js';
import { Toast } from './ToastNotification.js';
import { requestManager } from '../services/requestManager.js';
import { createDebounce } from '../utils/debounce.js';
import { DEBOUNCE_TIMES, LIMITS, Logger } from '../utils/constants.js';

/**
 * Input Panel Setup
 * Handles user input, language selection, and translation triggering
 */
export function setupInputPanel() {
  const inputEl = document.getElementById('inputText');
  const sourceLangSelect = document.getElementById('sourceLang');
  const targetLangSelect = document.getElementById('targetLang');
  const clearBtn = document.getElementById('clearBtn');
  const micBtn = document.getElementById('micBtn');
  const swapLangBtn = document.getElementById('swapLangBtn');
  const newTransBtn = document.getElementById('newTranslationBtn');
  const sourceLangLabel = document.getElementById('sourceLangLabel');
  const targetLangLabel = document.getElementById('targetLangLabel');

  let currentMicRecognition = null;

  // Language name mappings
  const langNames = {
    vi: 'Việt',
    zh: 'Trung (Giản thể)',
    ko: 'Hàn',
    ja: 'Nhật',
    en: 'Anh',
    auto: 'Phát hiện'
  };

  // Debounced translation function (800ms)
  const debouncedTranslate = createDebounce(() => {
    const text = inputEl.value.trim();
    if (!text) return;

    const requestId = requestManager.createRequestId();
    const settings = StorageService.getSettings();

    translateText(
      text,
      targetLangSelect.value,
      settings.model,
      requestId
    );
  }, DEBOUNCE_TIMES.INPUT);

  // Input event handler
  inputEl.addEventListener('input', (e) => {
    const text = e.target.value;
    TranslationStore.setInputText(text);

    // Show/hide clear button
    clearBtn.classList.toggle('hidden', !text.trim());

    // Show/hide new translation button
    newTransBtn.classList.toggle('hidden', !text.trim());

    // Check input length
    if (text.length > LIMITS.MAX_INPUT_LENGTH) {
      e.target.value = text.substring(0, LIMITS.MAX_INPUT_LENGTH);
      Toast.warning(`Giới hạn ${LIMITS.MAX_INPUT_LENGTH} ký tự`);
      return;
    }

    // Debounce translation
    if (text.trim()) {
      debouncedTranslate();
    } else {
      debouncedTranslate.cancel();
      TranslationStore.clear();
    }
  });

  // Clear button
  clearBtn.addEventListener('click', () => {
    inputEl.value = '';
    debouncedTranslate.cancel();
    TranslationStore.clear();
    clearBtn.classList.add('hidden');
    newTransBtn.classList.add('hidden');
  });

  // Microphone button
  micBtn.addEventListener('click', () => {
    if (currentMicRecognition) {
      currentMicRecognition.stop();
      currentMicRecognition = null;
      micBtn.classList.remove('text-red-600');
      return;
    }

    const sourceLang = sourceLangSelect.value;
    if (sourceLang === 'auto') {
      Toast.warning('Vui lòng chọn ngôn ngữ nguồn');
      return;
    }

    micBtn.classList.add('text-red-600');
    currentMicRecognition = SpeechService.listen(
      sourceLang,
      (text) => {
        inputEl.value = text;
        inputEl.dispatchEvent(new Event('input', { bubbles: true }));
      },
      () => {
        currentMicRecognition = null;
        micBtn.classList.remove('text-red-600');
      }
    );

    if (!currentMicRecognition) {
      Toast.error('Trình duyệt không hỗ trợ nhận diện giọng nói');
      micBtn.classList.remove('text-red-600');
    }
  });

  // Swap languages button
  swapLangBtn.addEventListener('click', () => {
    const source = sourceLangSelect.value;
    const target = targetLangSelect.value;

    if (source === 'auto') {
      Toast.warning('Không thể đổi khi nguồn là Phát hiện');
      return;
    }

    sourceLangSelect.value = target;
    targetLangSelect.value = source;

    sourceLangSelect.dispatchEvent(new Event('change', { bubbles: true }));
    targetLangSelect.dispatchEvent(new Event('change', { bubbles: true }));
  });

  // Source language change
  sourceLangSelect.addEventListener('change', (e) => {
    const langCode = e.target.value;
    sourceLangLabel.textContent = langNames[langCode] || langCode;
    TranslationStore.setLanguages(langCode, targetLangSelect.value);

    // Retranslate if we have input
    const text = inputEl.value.trim();
    if (text) {
      debouncedTranslate();
    }
  });

  // Target language change
  targetLangSelect.addEventListener('change', (e) => {
    const langCode = e.target.value;
    targetLangLabel.textContent = langNames[langCode] || langCode;
    TranslationStore.setLanguages(sourceLangSelect.value, langCode);

    // Retranslate if we have input
    const text = inputEl.value.trim();
    if (text) {
      debouncedTranslate();
    }
  });

  // New translation button
  newTransBtn.addEventListener('click', () => {
    inputEl.value = '';
    debouncedTranslate.cancel();
    TranslationStore.clear();
    inputEl.focus();
    clearBtn.classList.add('hidden');
    newTransBtn.classList.add('hidden');
  });

  // Initialize labels
  sourceLangLabel.textContent = langNames[sourceLangSelect.value] || 'Việt';
  targetLangLabel.textContent = langNames[targetLangSelect.value] || 'Trung (Giản thể)';

  Logger.debug('InputPanel', 'Setup complete');

  // Return cleanup function
  return () => {
    debouncedTranslate.cancel();
    if (currentMicRecognition) {
      currentMicRecognition.stop();
    }
  };
}