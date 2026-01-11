🔐 Authentication System — Architecture & Flow

This document explains how authentication works in the application using Next.js (App Router), Supabase Auth, SSR validation, and a client AuthProvider.

The system is designed for performance, security, and predictable state management across server and client.

🚀 Overview

The authentication flow is built on three layers:

Edge Middleware

Fast protection of routes

Only checks cookie presence (sb-access-token)

No Supabase calls

Secure SSR Verification

createServerSupabaseClient() validates tokens using Supabase

Real user object is loaded on the server

Prevents client spoofing

Client Auth Provider

Hydrates user from SSR

Listens for login / logout / token refresh

Provides useAuth() hook to the rest of the app

This ensures the app is secure, fast, and consistent across all pages.

📦 High-Level Architecture
┌────────────────────────┐
│ Browser Request │
└────────────┬───────────┘
│
▼
┌────────────────────────┐
│ Middleware (Edge) │
│ Checks sb-access-token │
│ Redirect if missing │
└────────────┬───────────┘
│
▼
┌────────────────────────────────────────────┐
│ Server Component / Layout (SSR) │
│ createServerSupabaseClient() → getUser() │
│ Validates session with Supabase │
└────────────┬───────────────────────────────┘
│
▼
┌────────────────────────────────────────────┐
│ <AuthProvider initialUser={user}> │
│ Hydration → Session Sync → Auth Listener │
└────────────┬───────────────────────────────┘
│
▼
┌────────────────────────────────────────────┐
│ Client Components (useAuth) │
└────────────────────────────────────────────┘

🧠 The Big Idea

Edge middleware decides if a user may pass.
Server components decide who the user actually is.
Client provider keeps everything reactive.

🧱 Detailed Flow Breakdown

1. Browser Requests a Page

The user requests a protected route like:

/dashboard

Before anything loads, Next.js runs the middleware.

2. Middleware (Edge) — Fast Access Control

What it does:

Reads the sb-access-token cookie

Checks if the route is protected or public

If protected & missing cookie → redirects to /login

If cookie exists → lets request through

Important:

❌ Does NOT call Supabase

❌ Does NOT validate session

✔ Only checks for cookie presence

✔ Runs instantly at the edge

Middleware prevents protected pages from loading even one pixel for unauthorized users.

3. Server Component / Layout — Secure SSR Validation

Once the request reaches your server code:

const supabase = createServerSupabaseClient();
const { data: { user } } = await supabase.auth.getUser();

This step:

Reads Supabase cookies

Verifies them with Supabase Auth

Returns a trusted user object

Runs inside a secure server environment

If the token is expired or invalid → user = null.

This is the source of truth for authentication.

4. SSR → Client Transfer (Initial User)

The server now passes the user down to the client:

<AuthProvider initialUser={user}>
  {children}
</AuthProvider>

This solves hydration issues and ensures UI instantly knows logged-in status.

5. AuthProvider (Client)

The AuthProvider is responsible for keeping the browser session in sync.

It:

Hydrates user from SSR (initialUser)

Calls supabase.auth.getSession() once on mount

Subscribes to onAuthStateChange

Updates context whenever login/logout/refresh happens

Exposes user, session, and actions via useAuth()

This ensures the UI always reflects the latest session state.

6. Client Components — useAuth()

All components use the hook:

const { user } = useAuth();

This gives live-updating user data without hitting Supabase repeatedly.

🗂 File Structure Summary
/app
layout.tsx
/dashboard
layout.tsx ← Server-side validation
page.tsx
/login
page.tsx

/lib/supabase
client.ts ← Browser Supabase client
server.ts ← createServerSupabaseClient

/components
AuthProvider.tsx ← Client session manager

middleware.ts ← Edge cookie guard

🔐 Security Layers (Defense in Depth)
Layer Role Security Strength

1. Middleware Blocks unauthenticated users from protected routes ⭐⭐⭐⭐
2. Server Components Validates user session securely ⭐⭐⭐⭐⭐
3. Client Provider UI-only reactive session changes ⭐⭐

Only the server is trusted for real authentication logic.

🌐 Full Request Flow (Text Version)
User clicks a protected route
│
▼
Next.js Middleware

- checks access cookie
- redirects or allows
  │
  ▼
  Server Component
- verifies session with Supabase
- loads secure user object
  │
  ▼
  <AuthProvider initialUser={user}>
- hydrate user
- sync with client session
- listen for state changes
  │
  ▼
  useAuth()
- used by client components

🧩 Why This Architecture?
✔ Prevents middleware timeouts

(no async calls, no Supabase lookup)

✔ Fast page load

(edge allows/denies instantly)

✔ Fully secure SSR auth

(supabase.auth.getUser() runs on trusted server)

✔ Predictable UI

(AuthProvider syncs & listens for changes)

( || product.image_urls?.[0])

---

## Logging & Error Handling (📌)

This project includes a centralized logging and error handling proposal: see `docs/LOGGING_AND_ERRORS.md` for the design, recommended practices, and examples (API wrapper `lib/apiHandler.ts`, `AppError` in `lib/errors.ts`). Follow those guidelines to keep logs structured, avoid PII leakage, and enable optional external integration (Sentry, Datadog) in production.
