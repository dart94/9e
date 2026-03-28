export const logger = {
  error: (message: string, _error?: unknown) => {
    if (__DEV__) {
      console.error(message, _error);
    }
  },
  warn: (message: string, _data?: unknown) => {
    if (__DEV__) {
      console.warn(message, _data);
    }
  },
};
