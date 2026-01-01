/**
 * Logger utility for consistent logging across the app
 * Only logs in development mode to avoid performance issues in production
 */

const isDev = __DEV__;

const logger = {
  /**
   * Log informational messages
   * @param {...any} args - Arguments to log
   */
  log: (...args) => {
    if (isDev) {
      console.log(...args);
    }
  },

  /**
   * Log error messages
   * @param {...any} args - Arguments to log
   */
  error: (...args) => {
    if (isDev) {
      console.error(...args);
    }
    // In production, you might want to send errors to a logging service
    // e.g., Sentry.captureException(error)
  },

  /**
   * Log warning messages
   * @param {...any} args - Arguments to log
   */
  warn: (...args) => {
    if (isDev) {
      console.warn(...args);
    }
  },

  /**
   * Log debug messages (only in development)
   * @param {...any} args - Arguments to log
   */
  debug: (...args) => {
    if (isDev) {
      console.debug(...args);
    }
  },

  /**
   * Log info messages with a prefix
   * @param {string} prefix - Prefix for the log message
   * @param {...any} args - Arguments to log
   */
  info: (prefix, ...args) => {
    if (isDev) {
      console.log(`[${prefix}]`, ...args);
    }
  },
};

export default logger;

