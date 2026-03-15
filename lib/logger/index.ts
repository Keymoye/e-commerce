type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type LogContext = Record<string, unknown>;
 
const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0, info: 1, warn: 2, error: 3,
};
 
function getMinLevel(): LogLevel {
  if (process.env.NODE_ENV === 'production') return 'info';
  if (process.env.NODE_ENV === 'test')       return 'warn';
  return 'debug';
}
 
function shouldLog(level: LogLevel): boolean {
  return LEVEL_ORDER[level] >= LEVEL_ORDER[getMinLevel()];
}
 
function sanitize(ctx: LogContext): LogContext {
  // Never log these fields even if accidentally included
  const REDACTED = ['password','token','secret','card','cvv','ssn','apiKey'];
  return Object.fromEntries(
    Object.entries(ctx).map(([k, v]) =>
      REDACTED.some(r => k.toLowerCase().includes(r))
        ? [k, '[REDACTED]']
        : [k, v],
    ),
  );
}
 
function format(level: LogLevel, ctx: LogContext): string {
  const entry = {
    ts:    new Date().toISOString(),
    level,
    env:   process.env.NODE_ENV,
    ...sanitize(ctx),
  };
  if (process.env.NODE_ENV === 'production') return JSON.stringify(entry);
  // Pretty print in development
  const { ts, level: lvl, ...rest } = entry;
  const color = { debug:'\x1b[36m', info:'\x1b[32m', warn:'\x1b[33m', error:'\x1b[31m' };
  return `${color[lvl]}[${lvl.toUpperCase()}]\x1b[0m ${JSON.stringify(rest)}`;
}
 
function log(level: LogLevel, ctx: LogContext): void {
  if (!shouldLog(level)) return;
  const out = format(level, ctx);
  if (level === 'error') { console.error(out); return; }
  if (level === 'warn')  { console.warn(out);  return; }
  console.log(out);
}
 
export const logger = {
  debug: (ctx: LogContext) => log('debug', ctx),
  info:  (ctx: LogContext) => log('info',  ctx),
  warn:  (ctx: LogContext) => log('warn',  ctx),
  error: (ctx: LogContext) => log('error', ctx),
  // Convenience: log with a requestId prefix for API routes
  withRequestId: (requestId: string) => ({
    debug: (ctx: LogContext) => log('debug', { requestId, ...ctx }),
    info:  (ctx: LogContext) => log('info',  { requestId, ...ctx }),
    warn:  (ctx: LogContext) => log('warn',  { requestId, ...ctx }),
    error: (ctx: LogContext) => log('error', { requestId, ...ctx }),
  }),
};
