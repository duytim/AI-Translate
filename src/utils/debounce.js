/**
 * Creates a debounced function that delays execution
 * @param {Function} fn - Function to debounce
 * @param {number} ms - Delay in milliseconds
 * @returns {Function} Debounced function with cancel method
 */
export function createDebounce(fn, ms) {
  let timeoutId = null;

  const debounced = (...args) => {
    if (timeoutId !== null) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, ms);
  };

  debounced.cancel = () => {
    if (timeoutId !== null) clearTimeout(timeoutId);
    timeoutId = null;
  };

  return debounced;
}

/**
 * Creates a throttled function that limits execution frequency
 * @param {Function} fn - Function to throttle
 * @param {number} ms - Minimum delay between executions
 * @returns {Function} Throttled function
 */
export function createThrottle(fn, ms) {
  let lastCall = 0;
  let timeoutId = null;

  return (...args) => {
    const now = Date.now();
    const remaining = ms - (now - lastCall);

    if (remaining <= 0) {
      if (timeoutId) clearTimeout(timeoutId);
      lastCall = now;
      fn(...args);
    } else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        timeoutId = null;
        fn(...args);
      }, remaining);
    }
  };
}
