# Application Documentation — Ecommerce (Comprehensive)

This document summarizes the architecture, conventions, logging & error-handling strategy, admin runbook, testing guidance, and operational runbook for the Ecommerce project. It is intended as a single source of truth for maintainers and on-call engineers.

---

## 🚀 Quick Overview

- Framework: **Next.js (App Router)** + **React** (client components)
- Language: **TypeScript**
- Auth & DB: **Supabase** (client & server usage, admin client for privileged operations)
- Observability: custom structured `logger` + optional **Sentry** integration + lightweight in-memory metrics (production should use Prometheus/Datadog)
- Error Types: `AppError` (operational errors) + standardized `withApiHandler` wrapper for API routes

---

## 📁 Important files & entry points (quick links)

- Logging & errors:
  - `lib/logger.ts` — structured logger, sinks, `withContext` helper
  - `lib/errors.ts` — `AppError` and `isAppError`
  - `lib/apiHandler.ts` — `withApiHandler()` for all server API handlers
  - `lib/errorReporter.ts` — lazy Sentry initialization & server/client reporters
  - `components/ErrorBoundary.tsx` — client-side error boundary (reports client errors)
- Audit & metrics:
  - `lib/audit.ts` — best-effort admin audit persistence and `getRecentAudits()`
  - `lib/metrics.ts` — lightweight in-memory counters (replace with real exporter in prod)
- Admin:
  - `lib/auth/assertAdmin.ts` — server-side admin guard
  - `services/admin/product.ts` — admin product CRUD with audit + metrics + logging
  - `app/api/admin/products/*` & `app/api/admin/audit/*` — admin API endpoints
- Examples:
  - `services/auth.ts` — login/signup/logout services (AppError & logging usage)
  - `services/products.ts` — product read services with defensive logging and AppError wrapping

---

## ✍️ Design & Conventions (Logging & Errors)

### 1) When to log

- Log at the most actionable level with context:
  - `logger.debug(...)` — verbose runtime info, dev only
  - `logger.info(...)` — successful flows worth noting (e.g., user login)
  - `logger.warn(...)` — expected recoverable issues or unexpected but non-fatal states
  - `logger.error(...)` — errors and exceptions that need attention

### 2) Context propagation

- Use `withApiHandler()` for API endpoints to ensure a `requestId` is generated and attached to responses.
- For long-lived flows or services, call `const log = logger.withContext({ requestId, userId })` and use `log.info(...)`, `log.error(...)`, etc.

Example:

```ts
const log = logger.withContext({ requestId });
log.info("Products", "Fetched page", { page, pageSize });
```

### 3) Error semantics: `AppError`

- Use `AppError` for expected operational errors that should be returned to clients with a clear HTTP status and optional `code` and structured `details`.
- For unexpected internal exceptions, wrap with `new AppError('Internal server error', 500)` before surfacing via `withApiHandler` (which returns a safe generic message and reports the error).

Example:

```ts
if (!val)
  throw new AppError("Invalid payload", 400, { code: "INVALID_PAYLOAD" });
```

### 4) Sentry & external reporting

- Sentry is integrated lazily via `lib/errorReporter.ts`. It is only initialized when `SENTRY_DSN` (server) / `NEXT_PUBLIC_SENTRY_DSN` (client) is configured.
- Server errors are reported from `withApiHandler()` (for 5xx) and client errors are reported in `ErrorBoundary`.
- Ensure no PII is passed in as tags or extras. Mask emails or personal IDs in logs (see `services/auth.ts` example where `maskEmail()` is used).

### 5) Tests & Mocking

- The logger supports pluggable sinks, making it easy to install a mock sink in tests: `logger.setSinks([mockSink])` to assert that messages are emitted.

---

## 🛡️ Admin & Audit

### Audit table suggestion (migration SQL)

```sql
CREATE TABLE IF NOT EXISTS admin_audits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NULL,
  action text NOT NULL,
  details jsonb NULL,
  created_at timestamptz DEFAULT now()
);
```

- Add an index on `created_at` and `action` for querying/filtering.

### How audit works in this codebase

- `lib/audit.ts` provides `recordAudit(action, userId?, details?)` and `getRecentAudits(limit)`.
- `services/admin/product.ts` calls `recordAudit('product.create', adminUser.id, { id, name })` after a successful mutate operation.
- Audit writes are **best-effort**: failures are logged and do not prevent the admin operation from completing.

---

## 📈 Metrics & Monitoring

- `lib/metrics.ts` contains simple in-memory counters (used for bootstrapping). Metrics keys used: `admin.product.create`, `admin.product.update`, `admin.product.delete`.
- For production, export a `/metrics` endpoint (Prometheus text exposition format) and push counters to Datadog/Prometheus. Do **not** rely on in-memory counters in multi-instance deployments.
- Web Vitals are captured in `lib/web-vitals.ts` and forwarded via Sentry/custom analytics endpoint when set.

---

## 🔒 Security & Access Control

- All admin-mutating server-side operations MUST call `assertAdmin(ctx)` before performing DB writes.
- Server-side checks are mandatory — UI-level guards are insufficient.
- Mask sensitive user data before logging or sending to external providers.

---

## 📦 Architecture & Folder Map

- `app/` — Next.js app routes, server and client components
- `components/` — reusable components, admin UI subfolders
- `services/` — business logic & DB interactions (server-safe)
- `lib/` — infra helpers: logging, error types, supabase wrappers, audit & metrics
- `hooks/` — client hooks
- `tests/` — unit tests (Vitest)

---

## ✅ Developer Guidelines (How to add a new API route safely)

1. Add a server route under `app/api/.../route.ts`.
2. Wrap the handler with `withApiHandler(async (req, { requestId }) => { ... })`.
3. Use service functions in `services/` that operate with a `ctx?: { requestId?: string }` and call `logger.withContext(ctx)` inside.
4. Throw `AppError` for expected failures; let `withApiHandler` handle logging and Sentry reporting.

Example:

```ts
export const POST = withApiHandler(async (req, { requestId }) => {
  const body = await req.json();
  const product = await createProduct(body, { requestId });
  return { status: 201, body: product };
});
```

---

## 🧪 Testing & CI

- Unit tests: use `vitest`. The logger supports sink injection for assertions.
- Add API tests that call the route functions directly (handlers exported in the app) to assert status codes and error payload shapes.
- E2E: add flows for admin create/update/delete and assert an audit row is created (requires DB migration + test DB)

---

## 📚 Runbook & Troubleshooting

- If a 5xx appears in production:
  - Check `SENTRY` for error stack traces (if enabled).
  - Look up the `x-request-id` returned in the API payload and search logs for that requestId.
- If admin actions are not recorded:
  - Check that `admin_audits` table exists and has write permission for the service key.
  - Verify `recordAudit(...)` didn’t raise errors (failures are logged with `logger.warn`).

---

## 🛠️ Operational notes & roadmap

- Short term (highest priority):
  - Add DB migration for `admin_audits` and add e2e tests to validate audit writes. Migration SQL: `scripts/migrations/001_create_admin_audits.sql`.
  - Expose metrics exporter and wire to a production metrics pipeline.
- Medium term:
  - Improve admin UI with audit browsing, filters, and export.
  - Add CI step to create Sentry releases and upload sourcemaps when building production.

---

If you'd like, I can:

- scaffold the DB migration file and tests right now ✅
- add a `/metrics` exporter and a Prometheus text endpoint
- create the admin audit UI page with pagination & filters

---

_Last updated: 2026-01-11_
