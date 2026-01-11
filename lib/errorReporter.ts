/* Sentry integration wrapper - initializes Sentry lazily and provides capture helpers */
let _initialized = false;

async function initSentryIfNeeded() {
  if (_initialized) return;
  const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return;
  try {
    const Sentry = await import("@sentry/nextjs");
    // Initialize only once; additional options can be controlled via env
    if (!Sentry.getCurrentHub().getClient()) {
      Sentry.init({
        dsn,
        environment: process.env.NODE_ENV || "development",
        tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE) || 0.0,
        release: process.env.SENTRY_RELEASE,
      });
    }
    _initialized = true;
  } catch (e) {
    // ignore init errors to avoid breaking app flow
  }
}

export async function reportServerError(
  err: unknown,
  ctx?: Record<string, unknown>
) {
  await initSentryIfNeeded();
  if (!_initialized) return;
  try {
    const Sentry = await import("@sentry/nextjs");
    Sentry.withScope((scope) => {
      if (ctx) {
        if ((ctx as any).requestId)
          scope.setTag("requestId", String((ctx as any).requestId));
        if ((ctx as any).userId)
          scope.setUser({ id: String((ctx as any).userId) });
        scope.setExtras(ctx);
      }
      Sentry.captureException(err as any);
    });
  } catch (e) {
    // ignore reporting errors
  }
}

export async function reportClientError(
  err: unknown,
  ctx?: Record<string, unknown>
) {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN ?? process.env.SENTRY_DSN;
  if (!dsn) return;
  try {
    const Sentry = await import("@sentry/react");
    Sentry.withScope((scope: any) => {
      if (ctx) {
        if ((ctx as any).requestId)
          scope.setTag("requestId", String((ctx as any).requestId));
        if ((ctx as any).userId)
          scope.setUser({ id: String((ctx as any).userId) });
        scope.setExtras(ctx);
      }
      Sentry.captureException(err as any);
    });
  } catch (e) {
    // ignore
  }
}

export default { reportServerError, reportClientError };
