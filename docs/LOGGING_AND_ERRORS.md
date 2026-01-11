# Logging & Error Handling — Design (RFC)

Overview

- Centralized logging and error handling with minimal runtime overhead and easy integration with external providers (Sentry, Datadog, Logstash).
- Maintain current developer-friendly console-based logs in dev, structured JSON logs in production.
- Provide request-scoped context (requestId, userId) and an opinionated API error type for consistent responses.

Key components

- `lib/logger.ts` — single-entry structured logger used across client/server. Supports context as first arg.
- `lib/errors.ts` — `AppError` (operational errors) with `status`, optional `code` and `details`.
- `lib/apiHandler.ts` — `withApiHandler()` wrapper that attaches `requestId`, standardizes error responses and logs errors with context.
- `components/ErrorBoundary.tsx` — client-side error boundary; will be extended to report to Sentry when configured.

Usage examples

- API routes
  - Wrap handlers with `withApiHandler` to get auto requestId propagation and unified error responses.

  ```ts
  export const POST = withApiHandler(async (req, { requestId }) => {
    // ... business logic
    return { status: 200, body: { message: "ok" } };
  });
  ```

- Throwing errors
  - Use `throw new AppError('Not found', 404, { code: 'NOT_FOUND' });` for expected failures.

Operational notes

- Add SENTRY_DSN and enable reporting behind a feature flag in production only.
- Ensure PII is never logged; sanitize before sending to external sinks.

Next steps

- Implement request-context utilities and a context-bound logger helper.
- Add Sentry integration behind `SENTRY_DSN` env var and add tests around API error flows.
- Provide runbook for on-call engineers and add a quick-start usage guide for developers.

Admin audit & metrics

- Server-side admin actions (create/update/delete) are guarded by `lib/auth/assertAdmin.ts` which throws `AppError(403)` for non-admins.
- Admin actions emit audit logs (via `logger.withContext`) including `userId` and optional `requestId`.
- Lightweight metrics are available in `lib/metrics.ts` and are incremented for admin actions: `admin.product.create`, `admin.product.update`, `admin.product.delete`.
- For production, wire metrics to a metrics backend (Prometheus/Datadog).

Additional notes:

- A best-effort audit persistence helper is available at `lib/audit.ts` and `services/admin/product.ts` records audit entries for create/update/delete operations. Ensure the `admin_audits` table is created in the DB (schema suggested in `docs/ADMIN_AUDIT.md`).
- Admin APIs for product management are exposed under `/api/admin/products` and `/api/admin/products/[id]`. Client admin UI components were updated to call these endpoints (instead of calling server services directly) to ensure proper request/response semantics and centralized middleware handling.

Logger usage

- Basic logging (backwards compatible):

```ts
import logger from "@/lib/logger";

logger.info({ requestId }, "user logged in", { userId: 123 });
```

- Preferred pattern (attach request-scoped context once):

```ts
const log = logger.withContext({ requestId });
log.info("Handled request", { path });
log.error("Failed to save", err);
```

- Adding sinks (e.g., unit tests or external logger):

```ts
import logger from "@/lib/logger";
logger.setSinks([
  {
    info: (rec) => {
      /* send to external system */
    },
    error: (rec) => {
      /* capture in Sentry */
    },
  },
]);
```

Sentry Integration (optional)

- Set `SENTRY_DSN` (server) and/or `NEXT_PUBLIC_SENTRY_DSN` (client) in production environments to enable crash reporting.
- Use `SENTRY_TRACES_SAMPLE_RATE` to control trace sampling for APM (defaults to 0.0 if unset).
- The project provides `lib/errorReporter.ts` which lazily initializes Sentry and attaches `requestId` and `userId` when available.
- Client errors are reported via `ErrorBoundary`, server errors are forwarded from the `withApiHandler` wrapper.
- Ensure PII is sanitized prior to logging or reporting to external providers.
