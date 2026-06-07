import { LANGUAGES, DEFAULT_MODEL } from '../utils/constants.js';

/**
 * Enhanced Translation Store
 * Centralized state management for all translation-related data
 */
class TranslationStoreImpl {
  constructor() {
    this.state = {
      // Current translation
      currentTranslation: null,

      // Language settings
      sourceLanguage: LANGUAGES.VI,
      targetLanguage: LANGUAGES.ZH,

      // Model
      currentModel: DEFAULT_MODEL,

      // Loading state
      isLoading: false,
      loadingStartTime: null,

      // Error state
      error: null,

      // Current request ID (for guarding against stale requests)
      currentRequestId: null,

      // Input text
      inputText: '',

      // History
      translationHistory: [],

      // Cached results
      cache: {}
    };

    this.listeners = [];
  }

  /**
   * Subscribe to state changes
   * @param {Function} listener - Callback function
   * @returns {Function} Unsubscribe function
   */
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      const idx = this.listeners.indexOf(listener);
      if (idx > -1) this.listeners.splice(idx, 1);
    };
  }

  /**
   * Notify all subscribers of state change
   * @private
   */
  notify() {
    this.listeners.forEach(listener => listener(this.getState()));
  }

  /**
   * Get current state
   * @returns {Object}
   */
  getState() {
    return { ...this.state };
  }

  /**
   * Set translation result
   * @param {Object} translation - Translation object from API
   * @param {number} requestId - Request ID to guard against stale updates
   */
  setTranslation(translation, requestId) {
    if (requestId !== this.state.currentRequestId) {
      return; // Ignore stale requests
    }

    this.state.currentTranslation = translation;
    this.state.isLoading = false;
    this.state.error = null;
    this.notify();
  }

  /**
   * Set loading state
   * @param {boolean} isLoading
   * @param {number} requestId - Current request ID
   */
  setLoading(isLoading, requestId = null) {
    this.state.isLoading = isLoading;
    if (isLoading) {
      this.state.loadingStartTime = Date.now();
      this.state.currentRequestId = requestId;
      this.state.error = null;
      this.state.currentTranslation = null;
    } else {
      this.state.loadingStartTime = null;
    }
    this.notify();
  }

  /**
   * Set error state
   * @param {string} errorMessage - Error message
   * @param {string} errorType - Error type constant
   */
  setError(errorMessage, errorType = 'ERROR') {
    this.state.error = { message: errorMessage, type: errorType };
    this.state.isLoading = false;
    this.notify();
  }

  /**
   * Update languages
   * @param {string} source - Source language code
   * @param {string} target - Target language code
   */
  setLanguages(source, target) {
    this.state.sourceLanguage = source;
    this.state.targetLanguage = target;
    this.notify();
  }

  /**
   * Update input text
   * @param {string} text
   */
  setInputText(text) {
    this.state.inputText = text;
    this.notify();
  }

  /**
   * Update current model
   * @param {string} model - Model ID
   */
  setModel(model) {
    this.state.currentModel = model;
    this.notify();
  }

  /**
   * Add to history
   * @param {Object} item - Translation item with source, target, etc
   */
  addToHistory(item) {
    // Avoid duplicates (same source text)
    if (this.state.translationHistory.length > 0 &&
        this.state.translationHistory[0].original === item.original) {
      return;
    }

    this.state.translationHistory.unshift({
      ...item,
      timestamp: Date.now()
    });

    // Keep only last 200
    if (this.state.translationHistory.length > 200) {
      this.state.translationHistory.pop();
    }

    this.notify();
  }

  /**
   * Clear everything
   */
  clear() {
    this.state.currentTranslation = null;
    this.state.inputText = '';
    this.state.error = null;
    this.state.isLoading = false;
    this.notify();
  }

  /**
   * Clear error
   */
  clearError() {
    this.state.error = null;
    this.notify();
  }
}

export const TranslationStore = new TranslationStoreImpl();