class DebugLogger {
  private static instance: DebugLogger;

  private constructor() {}

  public static getInstance(): DebugLogger {
    if (!DebugLogger.instance) {
      DebugLogger.instance = new DebugLogger();
    }
    return DebugLogger.instance;
  }

  public log(message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    const logEntry = `
========== DEBUG LOG ==========
[${timestamp}]
${message}
${data ? JSON.stringify(data, null, 2) : 'No data'}
============================
`;

    // Im Server-Kontext
    if (typeof process !== 'undefined') {
      console.log('\x1b[36m%s\x1b[0m', logEntry); // Cyan für bessere Sichtbarkeit
    } else {
      // Im Browser-Kontext
      console.log('%c' + logEntry, 'color: cyan');
    }
  }
}

export const logger = DebugLogger.getInstance();
