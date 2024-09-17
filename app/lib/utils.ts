const skipLog =
  typeof window !== 'undefined' && !process.env.NEXT_PUBLIC_BROWSER_LOG;

export const Logger = {
  error: function (message?: any, ...optionalParams: any[]) {
    if (skipLog) {
      return;
    }
    console.error(message, ...optionalParams);
  },
  log: function (message?: any, ...optionalParams: any[]) {
    if (skipLog) {
      return;
    }
    console.log(message, ...optionalParams);
  },
};
