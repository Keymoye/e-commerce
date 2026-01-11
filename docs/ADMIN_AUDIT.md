# Admin Audit Trail (Design)

✅ Purpose: ensure every admin action (create/update/delete) is recorded in an auditable, non-repudiable way.

Schema (suggested):

- Table: `admin_audits`
  - id uuid (primary key)
  - user_id uuid NULLABLE
  - action text
  - details jsonb
  - created_at timestamp with time zone default now()

Implementation in this repo:

- `lib/audit.ts` provides `recordAudit(action, userId?, details?)` which inserts into `admin_audits` using an admin Supabase client. Failures are logged but do not block the admin operation.
- `services/admin/product.ts` calls `recordAudit()` for create/update/delete actions.
- A protected API endpoint exists under `/api/admin/products` for list/create and `/api/admin/products/[id]` for read/update/delete; these handlers use `withApiHandler` and will return appropriate HTTP status codes.

Next steps (recommended):

- Add DB migration to create `admin_audits` and constraints (see `scripts/migrations/001_create_admin_audits.sql`).
- Apply the migration using your database tooling or the Supabase CLI. Example with `psql`:
  1. Connect to your DB: `psql <CONN_STRING>`
  2. Run: `\i scripts/migrations/001_create_admin_audits.sql`

  Or use Supabase CLI:
  1. `supabase db remote set <DATABASE_URL>`
  2. `supabase db query < scripts/migrations/001_create_admin_audits.sql`

- Add an Admin UI page at `/admin/audit` to browse recent audit entries with filters (action, user_id, date range).
- Add retention policy and archiving for audit history as needed.
