// Language codes and mappings
export const LANGUAGES = {
  VI: 'vi',
  ZH: 'zh',
  KO: 'ko',
  JA: 'ja',
  EN: 'en',
  AUTO: 'auto'
};

export const LANGUAGE_NAMES = {
  vi: 'Việt',
  zh: 'Trung (Giản thể)',
  ko: 'Hàn',
  ja: 'Nhật',
  en: 'Anh',
  auto: 'Phát hiện'
};

export const LANGUAGE_NAMES_FULL = {
  vi: 'tiếng Việt',
  zh: 'tiếng Trung',
  ko: 'tiếng Hàn',
  ja: 'tiếng Nhật',
  en: 'tiếng Anh'
};

// TTS Language mappings
export const TTS_LANG_MAP = {
  zh: 'zh-CN',
  ko: 'ko-KR',
  ja: 'ja-JP',
  en: 'en-US',
  vi: 'vi-VN',
  auto: 'vi-VN'
};

// STT Language mappings
export const STT_LANG_MAP = {
  zh: 'zh-CN',
  ko: 'ko-KR',
  ja: 'ja-JP',
  en: 'en-US',
  vi: 'vi-VN'
};

// AI Models
export const AI_MODELS = [
  'google/gemma-4-31b-it:free',
  'z-ai/glm-4.5-air:free',
  'qwen/qwen3-next-80b-a3b-instruct:free'
];

export const FALLBACK_MODELS = [
  'z-ai/glm-4.5-air:free',
  'qwen/qwen3-next-80b-a3b-instruct:free',
  'moonshotai/kimi-k2.6:free',
  'nousresearch/hermes-3-llama-3.1-405b:free',
  'google/gemma-4-31b-it:free'
];

export const DEFAULT_MODEL = 'google/gemma-4-31b-it:free';

// Error types
export const ERROR_TYPES = {
  NETWORK: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  RATE_LIMIT: 'RATE_LIMIT',
  API_ERROR: 'API_ERROR',
  PARSE_ERROR: 'PARSE_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  UNKNOWN: 'UNKNOWN_ERROR'
};

// Request timeouts (ms)
export const TIMEOUTS = {
  TRANSLATION: 12000,
  SPEECH: 5000
};

// Debounce timings (ms)
export const DEBOUNCE_TIMES = {
  INPUT: 800,
  SEARCH: 600
};

// Cooldown (ms)
export const REQUEST_COOLDOWN = 1500;

// Retry config
export const RETRY_CONFIG = {
  MAX_RETRIES: 2,
  INITIAL_DELAY: 2000,
  MAX_DELAY: 4000,
  BACKOFF_MULTIPLIER: 2,
  RETRYABLE_ERRORS: [429, 500, 502, 503, 504]
};

// Storage keys
export const STORAGE_KEYS = {
  HISTORY: 'translator_history',
  SETTINGS: 'translator_settings',
  CACHE: 'translator_cache',
  FLASHCARDS: 'translator_flashcards'
};

// Limits
export const LIMITS = {
  MAX_HISTORY: 200,
  MAX_CACHE_SIZE: 500,
  MAX_INPUT_LENGTH: 5000
};

// Toast types
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Logger utility (exported for use)
const isDev = import.meta.env.DEV;

export const Logger = {
  debug: (label, data) => {
    if (isDev) console.log(`[DEBUG] ${label}`, data);
  },

  info: (label, data) => {
    if (isDev) console.info(`[INFO] ${label}`, data);
  },

  warn: (label, data) => {
    console.warn(`[WARN] ${label}`, data);
  },

  error: (label, error) => {
    console.error(`[ERROR] ${label}`, error);
  }
};
