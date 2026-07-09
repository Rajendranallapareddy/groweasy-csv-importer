const log = (level: string, message: string, meta?: any) => {
  const timestamp = new Date().toISOString();
  const logFn = console[level as keyof Console] as (...args: any[]) => void;
  if (typeof logFn === 'function') {
    logFn(`[${timestamp}] ${level.toUpperCase()}: ${message}`, meta || '');
  }
};

export default {
  info: (msg: string, meta?: any) => log('info', msg, meta),
  error: (msg: string, meta?: any) => log('error', msg, meta),
  warn: (msg: string, meta?: any) => log('warn', msg, meta),
  debug: (msg: string, meta?: any) => log('debug', msg, meta),
};