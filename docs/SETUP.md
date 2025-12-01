# Installation & Setup Guide

This guide will help you get the Keystore e-commerce application running locally and deploying it to production.

## Prerequisites

- **Node.js** >= 18 (we recommend 20.x)
- **pnpm** >= 8 (npm alternative, faster and more efficient)
- **Supabase** account (for authentication and future database migration)
- **Git** for version control

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Keymoye/e-commerce.git
cd e-commerce
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Environment Variables

Copy the `.env.example` file (or create `.env.local`):

```bash
cp .env.example .env.local
```

Then update `.env.local` with your values:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Sentry (optional, for error tracking in production)
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Analytics (optional)
NEXT_PUBLIC_GA_ID=your-ga-id
```

### 4. Run Development Server

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production

```bash
pnpm run build
pnpm run start
```

## Environment Variables Reference

| Variable                        | Required    | Description                                        |
| ------------------------------- | ----------- | -------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Yes         | Supabase project URL                               |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes         | Supabase anonymous key (client-safe)               |
| `SUPABASE_SERVICE_ROLE_KEY`     | Server only | Supabase service role key (never expose to client) |
| `NEXT_PUBLIC_SITE_URL`          | Yes         | Your app's public URL (for OAuth redirects)        |
| `NEXT_PUBLIC_SENTRY_DSN`        | Optional    | Sentry error tracking DSN                          |
| `NEXT_PUBLIC_GA_ID`             | Optional    | Google Analytics ID                                |

## First-Time Setup Checklist

- [ ] Dependencies installed (`pnpm install`)
- [ ] `.env.local` file created with Supabase credentials
- [ ] Development server runs without errors (`pnpm run dev`)
- [ ] Homepage loads in browser
- [ ] Can navigate to products, categories, and cart pages
- [ ] Authentication page loads (OAuth buttons visible if configured)

## Database Setup

See [`docs/DATABASE_UPGRADE.md`](./DATABASE_UPGRADE.md) for instructions on migrating from mock data to Supabase.

## Testing Locally

```bash
# Run unit tests
pnpm run test:run

# Run E2E tests (requires running dev server)
npx playwright test

# Run accessibility checks
npx playwright test --project=chromium # (includes axe tests)
```

## Troubleshooting

### `NEXT_PUBLIC_SUPABASE_URL is missing`

Ensure `.env.local` contains the `NEXT_PUBLIC_SUPABASE_URL` variable. The `.env` file is not loaded locally; use `.env.local` or `.env.development.local`.

### Supabase Authentication Not Working

1. Verify `NEXT_PUBLIC_SITE_URL` matches your current domain (localhost:3000 for dev).
2. Add your callback URL to Supabase project settings under **Auth > Authorized redirect URLs**:
   - `http://localhost:3000/auth/callback` (local)
   - `https://yourdomain.com/auth/callback` (production)

### Build Fails with PostCSS Error

Ensure `postcss.config.mjs` exports `{ plugins: { '@tailwindcss/postcss': {} } }`. See [`postcss.config.mjs`](../postcss.config.mjs).

## Deployment

### Vercel (Recommended for Next.js)

1. Connect your GitHub repo to Vercel
2. Add environment variables in Vercel settings
3. Deploy (auto-deploys on push to `main`)

### Docker / Self-Hosted

```bash
# Build image
docker build -t keystore:latest .

# Run container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=... \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=... \
  keystore:latest
```

## Next Steps

- Read [`docs/AUTH_FLOW.md`](./AUTH_FLOW.md) for authentication details
- Check [`docs/DATABASE_UPGRADE.md`](./DATABASE_UPGRADE.md) for moving to production data
- Review [`docs/TESTING.md`](./TESTING.md) for comprehensive testing
- See [`docs/PRODUCTION_GUIDE.md`](./PRODUCTION_GUIDE.md) for production checklist
