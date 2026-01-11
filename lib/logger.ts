// Structured logger with pluggable sinks and simple context helpers.
// Backwards-compatible `logger.info(maybeCtx, ...args)` API retained.

type LogArgs = unknown[];

export type Context =
  | { requestId?: string; userId?: string }
  | Record<string, unknown>;

const isContext = (v: unknown): v is Context => {
  return (
    typeof v === "object" &&
    v !== null &&
    ("requestId" in (v as any) || "userId" in (v as any))
  );
};

export type LogLevel = "ERROR" | "WARN" | "INFO" | "DEBUG";
const LEVELS: Record<LogLevel, number> = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};
let currentLevel: LogLevel =
  (process.env.LOG_LEVEL as LogLevel) ??
  (process.env.NODE_ENV === "production" ? "INFO" : "DEBUG");

export type LogRecord = {
  time: string;
  level: LogLevel;
  context: Context | {};
  message: string;
  args: LogArgs;
};

export type LogSink = Partial<{
  error: (rec: LogRecord) => void;
  warn: (rec: LogRecord) => void;
  info: (rec: LogRecord) => void;
  debug: (rec: LogRecord) => void;
}>;

const sinks: LogSink[] = [];

function shouldLog(level: LogLevel) {
  return LEVELS[level] <= (LEVELS[currentLevel] ?? LEVELS.INFO);
}

function buildRecord(
  level: LogLevel,
  ctx: Context | undefined,
  args: LogArgs
): LogRecord {
  const time = new Date().toISOString();
  const message = args
    .map((a) => (typeof a === "string" ? a : JSON.stringify(a)))
    .join(" ");
  return { time, level, context: ctx ?? {}, message, args };
}

function defaultConsoleSink(): LogSink {
  return {
    error: (rec) => {
      if (process.env.NODE_ENV === "production") {
        console.error(JSON.stringify(rec));
      } else {
        console.error(
          `[${rec.time}] [ERROR]`,
          rec.context,
          rec.message,
          ...rec.args
        );
      }
    },
    warn: (rec) => {
      if (process.env.NODE_ENV === "production") {
        console.warn(JSON.stringify(rec));
      } else {
        console.warn(
          `[${rec.time}] [WARN]`,
          rec.context,
          rec.message,
          ...rec.args
        );
      }
    },
    info: (rec) => {
      if (process.env.NODE_ENV === "production") {
        console.info(JSON.stringify(rec));
      } else {
        console.info(
          `[${rec.time}] [INFO]`,
          rec.context,
          rec.message,
          ...rec.args
        );
      }
    },
    debug: (rec) => {
      if (process.env.NODE_ENV !== "production") {
        console.debug(
          `[${rec.time}] [DEBUG]`,
          rec.context,
          rec.message,
          ...rec.args
        );
      }
    },
  };
}

// ensure at least one sink exists (console)
sinks.push(defaultConsoleSink());

export const logger = {
  setLevel: (lvl: LogLevel) => {
    currentLevel = lvl;
  },
  getLevel: () => currentLevel,
  setSinks: (newSinks: LogSink[]) => {
    sinks.length = 0;
    sinks.push(...newSinks);
  },
  addSink: (s: LogSink) => sinks.push(s),
  getSinks: () => [...sinks],

  withContext: (baseContext: Context) => ({
    error: (maybeCtx: unknown, ...rest: LogArgs) => {
      const [ctx, args] = isContext(maybeCtx)
        ? [Object.assign({}, baseContext, maybeCtx as Context), rest]
        : [baseContext, [maybeCtx, ...rest]];
      logger.error(ctx, ...(args as LogArgs));
    },
    warn: (maybeCtx: unknown, ...rest: LogArgs) => {
      const [ctx, args] = isContext(maybeCtx)
        ? [Object.assign({}, baseContext, maybeCtx as Context), rest]
        : [baseContext, [maybeCtx, ...rest]];
      logger.warn(ctx, ...(args as LogArgs));
    },
    info: (maybeCtx: unknown, ...rest: LogArgs) => {
      const [ctx, args] = isContext(maybeCtx)
        ? [Object.assign({}, baseContext, maybeCtx as Context), rest]
        : [baseContext, [maybeCtx, ...rest]];
      logger.info(ctx, ...(args as LogArgs));
    },
    debug: (maybeCtx: unknown, ...rest: LogArgs) => {
      const [ctx, args] = isContext(maybeCtx)
        ? [Object.assign({}, baseContext, maybeCtx as Context), rest]
        : [baseContext, [maybeCtx, ...rest]];
      logger.debug(ctx, ...(args as LogArgs));
    },
  }),

  info: (maybeCtx: unknown, ...rest: LogArgs) => {
    if (!shouldLog("INFO")) return;
    const [ctx, args] = isContext(maybeCtx)
      ? [maybeCtx as Context, rest]
      : [undefined, [maybeCtx, ...rest]];
    const rec = buildRecord("INFO", ctx, args as LogArgs);
    for (const s of sinks) s.info?.(rec);
  },

  debug: (maybeCtx: unknown, ...rest: LogArgs) => {
    if (!shouldLog("DEBUG")) return;
    const [ctx, args] = isContext(maybeCtx)
      ? [maybeCtx as Context, rest]
      : [undefined, [maybeCtx, ...rest]];
    const rec = buildRecord("DEBUG", ctx, args as LogArgs);
    for (const s of sinks) s.debug?.(rec);
  },

  warn: (maybeCtx: unknown, ...rest: LogArgs) => {
    if (!shouldLog("WARN")) return;
    const [ctx, args] = isContext(maybeCtx)
      ? [maybeCtx as Context, rest]
      : [undefined, [maybeCtx, ...rest]];
    const rec = buildRecord("WARN", ctx, args as LogArgs);
    for (const s of sinks) s.warn?.(rec);
  },

  error: (maybeCtx: unknown, ...rest: LogArgs) => {
    if (!shouldLog("ERROR")) return;
    const [ctx, args] = isContext(maybeCtx)
      ? [maybeCtx as Context, rest]
      : [undefined, [maybeCtx, ...rest]];
    const rec = buildRecord("ERROR", ctx, args as LogArgs);
    for (const s of sinks) s.error?.(rec);
  },
};

export default logger;
