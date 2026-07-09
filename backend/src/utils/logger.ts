const log = (level: string, message: string, meta?: any) => {
  const timestamp = new Date().toISOString();
  console[level as keyof Console]?.(`[${timestamp}] ${level.toUpperCase()}: ${message}`, meta || '');
};

export default {
  info: (msg: string, meta?: any) => log('info', msg, meta),
  error: (msg: string, meta?: any) => log('error', msg, meta),
  warn: (msg: string, meta?: any) => log('warn', msg, meta),
  debug: (msg: string, meta?: any) => log('debug', msg, meta),
};