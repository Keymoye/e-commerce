// Simple structured logger usable on server and client.
// Keeps a minimal footprint and consistent timestamped output.
type LogArgs = unknown[];

type Context =
  | { requestId?: string; userId?: string }
  | Record<string, unknown>;

const isContext = (v: unknown): v is Context => {
  return (
    typeof v === "object" &&
    v !== null &&
    ("requestId" in (v as any) || "userId" in (v as any))
  );
};

const fmt = (level: string, ctx: Context | undefined, args: LogArgs) => {
  const time = new Date().toISOString();
  if (process.env.NODE_ENV === "production") {
    // JSON output in production for structured logs
    const out: Record<string, unknown> = {
      time,
      level,
      context: ctx ?? {},
      message: args
        .map((a) => (typeof a === "string" ? a : JSON.stringify(a)))
        .join(" "),
    };
    return [JSON.stringify(out)];
  }

  const ctxStr = ctx ? `[ctx:${JSON.stringify(ctx)}] ` : "";
  return [`[${time}] [${level}] ${ctxStr}`, ...args];
};

export const logger = {
  info: (maybeCtx: unknown, ...rest: LogArgs) => {
    const [ctx, args] = isContext(maybeCtx)
      ? [maybeCtx as Context, rest]
      : [undefined, [maybeCtx, ...rest]];
    console.info(...fmt("INFO", ctx, args as LogArgs));
  },
  debug: (maybeCtx: unknown, ...rest: LogArgs) => {
    if (process.env.NODE_ENV !== "production") {
      const [ctx, args] = isContext(maybeCtx)
        ? [maybeCtx as Context, rest]
        : [undefined, [maybeCtx, ...rest]];
      console.debug(...fmt("DEBUG", ctx, args as LogArgs));
    }
  },
  warn: (maybeCtx: unknown, ...rest: LogArgs) => {
    const [ctx, args] = isContext(maybeCtx)
      ? [maybeCtx as Context, rest]
      : [undefined, [maybeCtx, ...rest]];
    console.warn(...fmt("WARN", ctx, args as LogArgs));
  },
  error: (maybeCtx: unknown, ...rest: LogArgs) => {
    const [ctx, args] = isContext(maybeCtx)
      ? [maybeCtx as Context, rest]
      : [undefined, [maybeCtx, ...rest]];
    console.error(...fmt("ERROR", ctx, args as LogArgs));
  },
};

export default logger;
