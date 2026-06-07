import { StorageService } from './storage.js';
import { requestManager } from './requestManager.js';
import { TranslationStore } from '../stores/translationStore.js';
import { Toast } from '../components/ToastNotification.js';
import {
  FALLBACK_MODELS,
  LANGUAGE_NAMES_FULL,
  ERROR_TYPES,
  TIMEOUTS,
  Logger
} from '../utils/constants.js';

const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

/**
 * Translate text using OpenRouter API
 * Implements:
 * - Request guarding (ignores stale requests)
 * - Retry logic with exponential backoff
 * - Proper timeout handling
 * - Fallback models
 * - Caching
 *
 * @param {string} text - Text to translate
 * @param {string} targetLangCode - Target language code
 * @param {string} userSelectedModel - Preferred model
 * @param {number} requestId - Request ID for guarding
 * @returns {Promise<Object|null>} Translation result or null on failure
 */
export async function translateText(text, targetLangCode, userSelectedModel, requestId) {
  // Input validation
  if (!text || !text.trim()) {
    TranslationStore.setError('Vui lòng nhập văn bản', ERROR_TYPES.INVALID_INPUT);
    return null;
  }

  // Check cache first
  const cacheKey = `${targetLangCode}_${text}`;
  const cached = StorageService.getCache(cacheKey);
  if (cached) {
    Logger.debug('TranslateText', 'Cache hit');
    TranslationStore.setTranslation(cached, requestId);
    return cached;
  }

  // Wait for cooldown before making request
  await requestManager.waitForCooldown();

  // Mark as loading
  TranslationStore.setLoading(true, requestId);

  const targetLangName = LANGUAGE_NAMES_FULL[targetLangCode] || 'tiếng Trung';

  const SYSTEM_PROMPT = `
Bạn là phiên dịch viên chuyên nghiệp đa ngôn ngữ.

Nhiệm vụ:
* Hiểu chính xác ý định của người viết.
* Dịch sang ngôn ngữ đích theo cách người bản xứ thực sự sử dụng.
* Ưu tiên tự nhiên, dễ hiểu, lịch sự và đúng văn cảnh.
* Không dịch từng từ một nếu không tự nhiên.
* Có thể thay đổi cấu trúc câu nhưng không làm thay đổi ý nghĩa.
* Giữ nguyên mục đích, sắc thái và mức độ lịch sự.

Quy tắc:
1. Trò chuyện: dịch như người bản xứ nhắn tin, không dùng văn phong sách
2. Công việc: văn phong doanh nghiệp chuyên nghiệp, lịch sự
3. Câu hỏi: giữ nguyên ý hỏi, không thêm thông tin
4. Tên riêng, số điện thoại, link, mã: giữ nguyên
5. Emoji, xuống dòng: giữ nguyên
6. Không giải thích, không bình luận, không thêm nội dung ngoài dịch
7. Trả JSON hợp lệ

{
  "detected_source_language": "",
  "original": "",
  "phonetic": "",
  "translation": "",
  "translation_style": ""
}
`;

  // Prepare model list
  let modelsToTry = [userSelectedModel];
  for (const model of FALLBACK_MODELS) {
    if (model !== userSelectedModel) {
      modelsToTry.push(model);
    }
  }

  // Try each model with retry logic
  for (const model of modelsToTry) {
    try {
      const result = await requestManager.retryWithBackoff(async () => {
        return await makeApiRequest(model, SYSTEM_PROMPT, text, targetLangName, requestId);
      });

      // Check if this request is still valid
      if (TranslationStore.getState().currentRequestId !== requestId) {
        Logger.debug('TranslateText', 'Request became stale');
        return null;
      }

      // Cache result
      StorageService.saveCache(cacheKey, result);

      // Update store
      TranslationStore.setTranslation(result, requestId);

      // Save to history
      StorageService.saveHistory({
        ...result,
        targetLang: targetLangCode
      });

      // Record request time for cooldown
      requestManager.recordRequest();

      Logger.debug('TranslateText', `Success with model: ${model}`);
      return result;

    } catch (error) {
      Logger.warn('TranslateText', `Model ${model} failed: ${error.message}`);
      // Continue to next model
    }
  }

  // All models failed
  TranslationStore.setError(
    'Không thể dịch. Vui lòng thử lại sau.',
    ERROR_TYPES.API_ERROR
  );
  Toast.error('Lỗi dịch. Vui lòng kiểm tra kết nối mạng hoặc thử lại sau.');
  Logger.error('TranslateText', 'All models exhausted');
  return null;
}

/**
 * Make API request to OpenRouter
 * @private
 */
async function makeApiRequest(model, systemPrompt, text, targetLangName, requestId) {
  const response = await requestManager.fetchWithTimeout(
    () => fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Dịch sang ${targetLangName}: ${text}` }
        ],
        temperature: 0.1,
        max_tokens: 1000
      })
    }),
    TIMEOUTS.TRANSLATION
  );

  if (!response.ok) {
    const error = new Error(`API error ${response.status}`);
    error.status = response.status;
    throw error;
  }

  const data = await response.json();

  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    throw new Error('Invalid API response format');
  }

  let result = data.choices[0].message.content.trim();

  // Clean JSON markdown
  result = result
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/, '')
    .trim();

  const json = JSON.parse(result);
  json._used_model = model;

  return json;
}