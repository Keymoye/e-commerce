# Authentication Flow Documentation

This document describes the complete authentication system in the Keystore e-commerce application, including OAuth integration, session management, and best practices.

## Architecture Overview

```
┌──────────────┐
│   Client     │
│   (React)    │
└──────┬───────┘
       │ Login/Signup
       │
┌──────▼────────────────────────────────────┐
│   Auth Pages (login/, register/)           │
│   - Forms with react-hook-form + Zod      │
│   - OAuth buttons (Google, GitHub, etc.)   │
└──────┬────────────────────────────────────┘
       │ POST /api/login, /api/signup, /api/oauth
       │
┌──────▼───────────────────────┐
│   API Routes                  │
│   - Validation (Zod schemas)  │
│   - Services layer            │
│   - Error handling (AppError) │
└──────┬───────────────────────┘
       │
┌──────▼───────────────────────────────────────────┐
│   Supabase Auth                                   │
│   - User management                              │
│   - JWT session tokens                           │
│   - OAuth provider integration                   │
│   - Email verification (optional)                │
└──────┬───────────────────────────────────────────┘
       │ JWT + session data
       │
┌──────▼──────────────────────────────────────┐
│   Middleware (middleware.ts)                 │
│   - Request ID header generation             │
│   - Session validation (cookies)             │
│   - Protected route redirect to /login       │
└──────┬──────────────────────────────────────┘
       │
┌──────▼──────────────────────────────────────┐
│   Protected Pages / API Routes               │
│   - Logged-in user context                   │
│   - Cart, wishlist, checkout access          │
└──────────────────────────────────────────────┘
```

## User Authentication Flow

### 1. Signup Flow

**Request:**

```http
POST /api/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "fullName": "John Doe"
}
```

**Backend Process (services/auth.ts):**

1. Validate input with Zod schema (email, password, fullName)
2. Call Supabase `auth.signUp(email, password)`
3. Return session token and user object

**Response:**

```json
{
  "data": {
    "user": {
      "id": "uuid-1234",
      "email": "user@example.com",
      "user_metadata": { "full_name": "John Doe" }
    },
    "session": {
      "access_token": "eyJ0eXAi...",
      "refresh_token": "...",
      "expires_in": 3600,
      "expires_at": 1234567890
    }
  }
}
```

**Client-Side (hooks/auth/useRegister.ts):**

1. Call `/api/signup` endpoint
2. Store session in Supabase client (handles `refreshSession()`)
3. AuthContext is updated via Supabase listener
4. Redirect to `/profile` or `/products`

### 2. Login Flow

**Request:**

```http
POST /api/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Backend Process (services/auth.ts):**

1. Validate email/password with Zod schema
2. Call Supabase `auth.signInWithPassword(email, password)`
3. Supabase validates credentials, returns session if valid
4. Generate request-id for logging (middleware)

**Response:**

```json
{
  "data": {
    "user": { "id": "...", "email": "..." },
    "session": {
      "access_token": "...",
      "refresh_token": "...",
      "expires_in": 3600
    }
  }
}
```

**Client-Side (hooks/auth/useLogin.ts):**

1. Call `/api/login` with credentials
2. Store session in Supabase client (auto-calls `setSession()`)
3. Toast success message
4. Redirect to `/products` or intended destination

### 3. OAuth Flow (Google, GitHub, etc.)

**Initiation:**

```
User clicks "Sign in with Google" button
           ↓
Client calls: supabase.auth.signInWithOAuth({ provider: 'google' })
           ↓
Redirects to: https://accounts.google.com/o/oauth2/auth?...
           ↓
User approves at Google
           ↓
Google redirects to: https://yourdomain.com/auth/callback?code=...&state=...
```

**Callback Handling (app/auth/callback/route.ts):**

```typescript
// OAuth callback route
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");

  if (code) {
    // Exchange code for session using Supabase PKCE flow
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Session is now stored in cookies
      return NextResponse.redirect(`${origin}/products`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
```

**Client-Side Session Sync (components/auth/AuthProvider.tsx):**

1. On app load, `useEffect` calls `supabase.auth.getSession()`
2. If session exists, user is logged in
3. Supabase auth listener (`onAuthStateChange`) auto-updates on any auth change
4. AuthContext provides `user` and `session` to app

### 4. Logout Flow

**Request:**

```http
POST /api/logout
```

**Backend Process (services/auth.ts):**

1. Call Supabase `auth.signOut()`
2. Clear session cookies (handled by Supabase)

**Client-Side (hooks/auth/useLogout.ts):**

1. Call `/api/logout`
2. Supabase client auth state resets
3. AuthContext updates, `user` becomes `null`
4. Redirect to `/login`

## Session Management

### Session Storage

- **Primary**: Supabase session stored in secure HTTP-only cookies (set-cookie header in `/auth/callback`)
- **Client**: Supabase JS client automatically reads cookies on each request
- **Fallback**: Supabase stores session in `localStorage` if cookies unavailable (for debugging only)

### Token Lifecycle

**Access Token (JWT):**

- Expires in: 1 hour (default Supabase config)
- Contains: user ID, email, OAuth provider, permissions
- Used for: API requests to Supabase (in Authorization header)
- Refresh: Automatic via `supabase.auth.refreshSession()` when near expiry

**Refresh Token:**

- Expires in: 7 days (default Supabase config)
- Stored in: Secure HTTP-only cookie
- Purpose: Get new access token without re-login

### Refresh Token Flow

```
Access token expires
           ↓
Client makes request → 401 Unauthorized
           ↓
Supabase client auto-calls: auth.refreshSession()
           ↓
Server sends refresh_token in secure cookie
           ↓
Supabase OAuth server validates → new access_token
           ↓
Request retried with new token
           ↓
Request succeeds
```

## Request ID Propagation

For debugging and tracing:

1. **Middleware** generates unique request ID:

```typescript
// middleware.ts
const requestId = crypto.randomUUID();
request.headers.set("x-request-id", requestId);
```

2. **Logger** includes request ID in all logs:

```typescript
logger.info("User login attempt", { requestId, userId: user.id });
```

3. **API Routes** propagate request ID to client:

```typescript
response.headers.set("x-request-id", requestId);
```

4. **Client** can access via response headers for debugging.

## Protected Routes

Routes requiring authentication are protected by `middleware.ts`:

```typescript
// Redirect to /login if not authenticated
if (!session) {
  return NextResponse.redirect(new URL("/login", request.url));
}
```

**Protected Routes:**

- `/profile` - User profile/settings
- `/checkout` - Checkout page
- `/order/[id]` - Order details (future)

**Public Routes:**

- `/` - Homepage
- `/login`, `/register` - Auth pages
- `/products`, `/categories` - Product browsing
- `/api/signup`, `/api/login` - Auth endpoints

## Error Handling

### Common Auth Errors

| Error                     | Cause                   | Solution                          |
| ------------------------- | ----------------------- | --------------------------------- |
| `invalid_credentials`     | Wrong password          | Show "Invalid email or password"  |
| `user_not_found`          | Email not registered    | Suggest signup                    |
| `email_not_confirmed`     | Email not verified      | Resend confirmation email         |
| `over_request_rate_limit` | Too many login attempts | Show rate limit message, wait 60s |
| `oauth_code_expired`      | OAuth code > 10 min old | Restart OAuth flow                |
| `session_not_found`       | Session expired         | Redirect to login                 |

**Error Handling in API Routes:**

```typescript
// services/auth.ts
try {
  const { data, error } = await supabase.auth.signInWithPassword(
    email,
    password
  );
  if (error) throw new AppError(error.message, 401);
  return data;
} catch (error) {
  logger.error("Login failed", { email, error });
  throw error instanceof AppError ? error : new AppError("Login failed", 500);
}
```

## Security Best Practices

### Password Requirements

- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character (`!@#$%^&*`)

**Enforced via Zod in** `services/auth.ts`:

```typescript
password: z.string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[0-9]/, "Password must contain a number")
  .regex(/[!@#$%^&*]/, "Password must contain a special character");
```

### PKCE (Proof Key for Exchange)

- Used for OAuth flows to prevent authorization code interception
- Supabase handles PKCE automatically
- Requires `NEXT_PUBLIC_SITE_URL` set correctly for callback validation

### HTTP-Only Cookies

- Session cookies are `HttpOnly` (not accessible via JavaScript)
- Prevents XSS attacks stealing session tokens
- `Secure` flag ensures cookies only sent over HTTPS in production

### CSRF Protection

- Supabase uses state parameter in OAuth flow
- Middleware validates state matches request origin
- Prevents cross-site request forgery attacks

### Environment Variables

- Never expose `SUPABASE_SERVICE_ROLE_KEY` to client
- Use `NEXT_PUBLIC_SUPABASE_ANON_KEY` for client-side Supabase calls (limited permissions)
- Rotate keys periodically in production

## Logout & Session Cleanup

When user logs out:

1. **Server:** Supabase `auth.signOut()` invalidates session
2. **Cookies:** Session cookies are cleared via `Set-Cookie: Max-Age=0`
3. **Client:** Supabase auth listener detects state change
4. **State:** Cart and wishlist persisted in localStorage (not cleared on logout)
5. **Redirect:** User sent to `/login`

## Future Enhancements

- [ ] Email verification flow
- [ ] Password reset via email link
- [ ] Two-factor authentication (2FA)
- [ ] Social account linking
- [ ] User profile customization (avatar, preferences)
- [ ] Admin authentication and role-based access control (RBAC)

## Related Documentation

- See [`docs/DATABASE_UPGRADE.md`](./DATABASE_UPGRADE.md) for user table schema
- See [`docs/TESTING.md`](./TESTING.md) for auth testing strategies
- See [`services/auth.ts`](../services/auth.ts) for server-side auth logic
- See [`hooks/auth/`](../hooks/auth/) for client-side hooks
