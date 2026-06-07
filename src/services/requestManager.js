import { REQUEST_COOLDOWN, RETRY_CONFIG, TIMEOUTS, Logger } from '../utils/constants.js';

/**
 * Manages API requests with:
 * - Request guarding (ignores stale requests)
 * - Cooldown enforcement (1500ms between requests)
 * - Retry logic with exponential backoff
 * - Timeout handling
 */
export class RequestManager {
  constructor() {
    this.lastRequestTime = 0;
    this.lastRequestId = 0;
    this.pendingRequestId = null;
  }

  /**
   * Gets the next request ID and validates if request should proceed
   * @returns {number} Request ID
   */
  createRequestId() {
    this.lastRequestId++;
    return this.lastRequestId;
  }

  /**
   * Check if this request should be executed (guards against stale requests)
   * @param {number} requestId - Request ID to check
   * @returns {boolean} True if request is still valid
   */
  isRequestValid(requestId) {
    return requestId === this.lastRequestId;
  }

  /**
   * Check if enough time has passed since last request (cooldown)
   * @returns {{canRequest: boolean, waitTime: number}}
   */
  checkCooldown() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const canRequest = timeSinceLastRequest >= REQUEST_COOLDOWN;
    const waitTime = Math.max(0, REQUEST_COOLDOWN - timeSinceLastRequest);

    return { canRequest, waitTime };
  }

  /**
   * Wait for cooldown period before executing request
   * @returns {Promise<void>}
   */
  async waitForCooldown() {
    const { canRequest, waitTime } = this.checkCooldown();
    if (!canRequest) {
      Logger.debug('RequestManager', `Waiting ${waitTime}ms for cooldown`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  /**
   * Record that a request has been executed
   */
  recordRequest() {
    this.lastRequestTime = Date.now();
  }

  /**
   * Retry a function with exponential backoff
   * @param {Function} fn - Async function to retry
   * @param {number} retries - Attempts remaining
   * @param {number} delayMs - Delay before retry
   * @returns {Promise<any>}
   */
  async retryWithBackoff(fn, retries = RETRY_CONFIG.MAX_RETRIES, delayMs = RETRY_CONFIG.INITIAL_DELAY) {
    try {
      return await fn();
    } catch (error) {
      const isRetryableError = RETRY_CONFIG.RETRYABLE_ERRORS.includes(error.status);
      const hasRetriesLeft = retries > 0;

      if (!isRetryableError || !hasRetriesLeft) {
        throw error;
      }

      Logger.warn('RequestManager', `Retry attempt, ${retries} left after ${delayMs}ms delay`);
      await new Promise(resolve => setTimeout(resolve, delayMs));

      const nextDelay = Math.min(
        delayMs * RETRY_CONFIG.BACKOFF_MULTIPLIER,
        RETRY_CONFIG.MAX_DELAY
      );

      return this.retryWithBackoff(fn, retries - 1, nextDelay);
    }
  }

  /**
   * Wrap fetch with timeout
   * @param {Function} fetchFn - Fetch function
   * @param {number} timeoutMs - Timeout in ms
   * @returns {Promise<Response>}
   */
  async fetchWithTimeout(fetchFn, timeoutMs = TIMEOUTS.TRANSLATION) {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error('TIMEOUT')),
        timeoutMs
      )
    );

    return Promise.race([fetchFn(), timeoutPromise]);
  }
}

// Singleton instance
export const requestManager = new RequestManager();
