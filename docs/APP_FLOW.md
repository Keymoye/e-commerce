# Application Flow & Architecture

Complete overview of the Keystore e-commerce application architecture, component structure, data flow, and user journeys.

## High-Level Application Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser / Client                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │   React Components (Next.js App Router)              │   │
│  │   - Pages: /, /products, /cart, /checkout, etc.     │   │
│  │   - Components: ProductCard, Navbar, Form           │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ↓                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │   State Management (Zustand)                         │   │
│  │   - cartStore: items, total, actions                 │   │
│  │   - wishlistStore: items, actions                    │   │
│  │   - localStorage persistence                         │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ↓                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │   Custom Hooks                                       │   │
│  │   - useProducts: fetch/filter/search                │   │
│  │   - useCart, useWishlist: access stores             │   │
│  │   - useAuthLogin, useRegister: auth flows           │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ↓                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │   API Client (lib/api.ts)                            │   │
│  │   - fetchJson: centralized fetch with errors        │   │
│  │   - Automatic error handling (AppError)             │   │
│  │   - Request logging with request-id                 │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ↓                                   │
└─────────────────────────────────────────────────────────────┘
                           ↓ HTTP
┌─────────────────────────────────────────────────────────────┐
│                  Next.js Server                              │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │   Middleware (middleware.ts)                         │   │
│  │   - Request ID generation                           │   │
│  │   - Session validation                              │   │
│  │   - Protected route redirect                        │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ↓                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │   API Routes (app/api/*)                             │   │
│  │   - /api/login, /api/signup, /api/logout            │   │
│  │   - /api/products, /api/cart, etc.                  │   │
│  │   - Error handling (AppError → HTTP response)       │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ↓                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │   Services Layer                                     │   │
│  │   - services/auth.ts: login, signup validation      │   │
│  │   - services/products.ts: product queries           │   │
│  │   - Business logic, Zod validation                  │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ↓                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │   Supabase Client                                    │   │
│  │   - Auth: user registration, OAuth, sessions        │   │
│  │   - Database: products, users, orders               │   │
│  │   - Real-time subscriptions (optional)              │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ↓                                   │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│               Supabase Backend (PostgreSQL)                  │
├─────────────────────────────────────────────────────────────┤
│   - Authentication & JWT tokens                             │
│   - Product database & reviews                              │
│   - User carts, wishlists, orders                           │
│   - Analytics & reporting                                   │
└─────────────────────────────────────────────────────────────┘
```

## Directory Structure & Responsibilities

```
ecommerce/
├── app/                          # Next.js app router (routes & pages)
│   ├── page.tsx                  # Home page (product listing)
│   ├── layout.tsx                # Root layout with providers
│   ├── api/                      # API routes (server-side)
│   │   ├── login/route.ts        # POST /api/login
│   │   ├── signup/route.ts       # POST /api/signup
│   │   ├── logout/route.ts       # POST /api/logout
│   │   ├── oauth/[provider]/route.ts  # OAuth callback
│   │   └── auth/callback/route.ts    # Supabase OAuth callback
│   ├── auth/
│   │   └── callback/route.ts     # OAuth provider callback handler
│   ├── products/                 # Product pages
│   │   ├── page.tsx              # Products listing (search, filter, sort)
│   │   └── [id]/page.tsx         # Product detail page
│   ├── categories/page.tsx        # Category listing & browsing
│   ├── cart/page.tsx             # Shopping cart
│   ├── checkout/page.tsx         # Checkout form & order summary
│   ├── wishlist/page.tsx         # Wishlist page
│   ├── login/page.tsx            # Login page
│   ├── register/page.tsx         # Signup page
│   ├── profile/page.tsx          # User profile (future)
│   ├── not-found.tsx             # 404 page
│   ├── loading.tsx               # Loading skeleton UI
│   └── globals.css               # Global CSS & Tailwind directives
│
├── components/                   # Reusable React components
│   ├── auth/
│   │   ├── AuthProvider.tsx      # Auth context & Supabase listener
│   │   ├── LoginPage.tsx         # Login form component
│   │   └── RegisterPage.tsx      # Signup form component
│   ├── layout/
│   │   ├── navbar.tsx            # Navigation bar (responsive)
│   │   ├── footer.tsx            # Footer
│   │   └── AppProviders.tsx      # Root providers (Toast, Auth, Error)
│   ├── checkout/
│   │   └── checkoutForm.tsx      # Checkout form with Zod validation
│   └── ui/
│       ├── productCard.tsx       # Product card component (memoized)
│       ├── productSkeleton.tsx   # Loading skeleton
│       ├── StarRating.tsx        # Star rating display
│       ├── CartButton.tsx        # Add to cart button
│       ├── cartLink.tsx          # Cart icon with item count
│       └── toast.tsx             # Toast notifications
│
├── hooks/                        # Custom React hooks
│   ├── useProducts.ts            # Fetch & filter products from Supabase
│   ├── useCart.ts                # Zustand cart store hook
│   ├── useWishlist.ts            # Zustand wishlist store hook
│   ├── auth/
│   │   ├── useAuthLogin.ts       # POST /api/login hook
│   │   ├── useLogin.ts           # Client login state (deprecated?)
│   │   ├── useLogout.ts          # Logout hook
│   │   └── useRegister.ts        # POST /api/signup hook
│   └── useAuth.ts (if exists)    # Auth context hook
│
├── store/                        # Zustand state stores (persistent)
│   ├── cartStore.ts              # Cart items, actions, localStorage persist
│   └── wishlistStore.ts          # Wishlist items, actions, localStorage persist
│
├── services/                     # Server-side business logic
│   ├── auth.ts                   # signup, login, logout (Zod validation)
│   └── products.ts               # getProducts, pagination (Supabase query)
│
├── lib/                          # Utility functions & helpers
│   ├── api.ts                    # fetchJson() centralized fetch + error handling
│   ├── logger.ts                 # Structured logging (console/JSON)
│   ├── errors.ts                 # AppError class, error handling
│   ├── products.ts               # Mock product data (temporary)
│   ├── seo.ts                    # SEO metadata & JSON-LD generators
│   └── supabase/
│       ├── client.ts             # Supabase client (browser)
│       ├── server.ts             # Supabase client (server)
│       └── getUser.ts            # Extract user from session (server)
│
├── types/                        # TypeScript type definitions
│   └── product.ts                # Product interface with specs, reviews
│
├── public/                       # Static assets (images, fonts)
│
├── docs/                         # Documentation
│   ├── SETUP.md                  # Installation & first-run guide
│   ├── AUTH_FLOW.md              # Authentication system details
│   ├── DATABASE_UPGRADE.md       # Mock data → Supabase migration
│   ├── TESTING.md                # Unit, E2E, accessibility tests
│   └── APP_FLOW.md               # This file
│
├── tests/                        # Unit & integration tests (Vitest)
│   ├── services/
│   ├── hooks/
│   └── components/
│
├── playwright/                   # E2E & accessibility tests (Playwright)
│   ├── e2e/
│   └── axe/
│
├── .github/
│   └── workflows/
│       └── ci.yml                # GitHub Actions CI/CD pipeline
│
├── middleware.ts                 # Next.js middleware (auth, request-id)
├── package.json                  # Dependencies & scripts
├── tsconfig.json                 # TypeScript configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── postcss.config.mjs            # PostCSS configuration
├── eslint.config.mjs             # ESLint configuration
├── next.config.ts                # Next.js configuration
└── README.md                     # Project overview
```

## User Journeys

### Journey 1: Browse Products (Unauthenticated)

```
User lands on homepage (/)
    ↓
Homepage shows featured products (from mock or Supabase)
    ↓
User clicks "Shop" in navbar
    ↓
Redirected to /products
    ↓
useProducts hook fetches products from Supabase
    ↓
ProductCard components render in grid (memoized for performance)
    ↓
User can:
  - Search by name (input → useProducts filter)
  - Filter by category (select → query param)
  - Sort by price/rating (select → re-fetch)
    ↓
User clicks product → navigate to /products/[id]
    ↓
Product detail page shows specs, reviews, images
    ↓
User clicks "Add to Cart" → cartStore.addItem(product)
    ↓
Cart stored in localStorage (no auth yet)
    ↓
Toast notification: "Added to cart"
    ↓
User clicks cart link → /cart page
    ↓
Cart page shows items, totals, quantity controls
    ↓
User clicks "Proceed to Checkout" → /checkout
    ↓
Checkout page shows form + order summary
    ↓
User sees "Sign in to continue" banner
    ↓
User clicks "Login" → redirected to /login
```

### Journey 2: Signup & Authentication

```
User visits /register
    ↓
RegisterPage shows form:
  - Full Name
  - Email
  - Password (strength requirement display)
  - Confirm Password
  - OAuth buttons (Google, GitHub)
    ↓
User fills form → validates with Zod schema (client-side)
    ↓
User clicks "Sign Up" → useRegister hook called
    ↓
POST /api/signup with form data
    ↓
services/auth.ts validates with Zod
    ↓
Supabase.auth.signUp(email, password) called
    ↓
User created in Supabase auth table
    ↓
Session token returned to client
    ↓
AuthProvider listens for auth change
    ↓
User state updated in AuthContext
    ↓
Protected routes become accessible
    ↓
Redirect to /products (or intended destination)
    ↓
User can now checkout (localStorage cart synced to DB later)
```

### Journey 3: Login via Credentials

```
User visits /login
    ↓
LoginPage shows:
  - Email input
  - Password input
  - "Forgot Password" link
  - OAuth buttons
  - Link to /register
    ↓
User enters credentials → useAuthLogin hook
    ↓
POST /api/login with { email, password }
    ↓
services/auth.ts validates with Zod
    ↓
Supabase.auth.signInWithPassword(email, password)
    ↓
Supabase validates against auth table
    ↓
Session token + refresh token returned
    ↓
Supabase client stores session in cookies (automatically)
    ↓
AuthProvider detects auth state change
    ↓
User set in AuthContext
    ↓
Toast: "Welcome back, [Name]"
    ↓
Redirect to /products (or /checkout if coming from cart)
    ↓
Middleware allows access to protected routes
```

### Journey 4: OAuth Login (Google Example)

```
User on /login page
    ↓
User clicks "Sign in with Google" button
    ↓
supabase.auth.signInWithOAuth({ provider: 'google' })
    ↓
Redirects to Google OAuth consent screen
    ↓
User grants permission
    ↓
Google redirects to: /auth/callback?code=...&state=...
    ↓
app/auth/callback/route.ts exchanges code for session
    ↓
supabase.auth.exchangeCodeForSession(code)
    ↓
Session stored in secure cookies
    ↓
Redirect to /products
    ↓
AuthProvider reads cookies, detects logged-in state
    ↓
User context populated with Google profile data
```

### Journey 5: Checkout to Order

```
User in cart with items
    ↓
Clicks "Proceed to Checkout"
    ↓
Middleware checks session (if not auth, redirects to /login)
    ↓
Checkout page (/checkout) renders
    ↓
checkoutForm shows:
  - Billing address
  - Payment method (simulated)
  - Order summary
  - Cart items + total
    ↓
User fills form → Zod validates (client + server)
    ↓
User clicks "Place Order"
    ↓
POST /api/checkout (future) or form submission
    ↓
Backend validates order (quantity, pricing, auth)
    ↓
Order created in Supabase orders table
    ↓
OrderItems created for each cart item
    ↓
Cart cleared from localStorage (or server)
    ↓
Toast: "Order placed successfully!"
    ↓
Redirect to /order/[id] (order confirmation page)
    ↓
User can view order details, status, tracking info
```

### Journey 6: Wishlist Management

```
User browsing products
    ↓
User clicks heart icon on product card
    ↓
wishlistStore.toggleWishlist(product) called
    ↓
Product added to wishlistStore (Zustand + localStorage)
    ↓
Heart icon turns red/filled
    ↓
Toast: "Added to wishlist"
    ↓
User clicks wishlist link in navbar
    ↓
Wishlist page (/wishlist) renders
    ↓
Shows all wishlisted products in grid
    ↓
User can:
  - Remove from wishlist (click X)
  - Move to cart (add to cart from wishlist)
  - View product details (click product)
    ↓
Wishlist persisted in localStorage (survives reload)
    ↓
On logout, wishlist cleared (optional behavior)
```

## Data Flow Examples

### Example 1: Fetching Products with Search

```
User types "pain relief" in search box
    ↓
onChange event → setState(searchQuery)
    ↓
useProducts hook detects change in query params or state
    ↓
useEffect runs:
  - filters = { search: "pain relief", category: selectedCategory }
  - calls getProducts(filters)
    ↓
getProducts (services/products.ts):
  - If mock: filter mockProducts array
  - If Supabase: query WHERE name ILIKE '%pain relief%'
    ↓
Results returned to component
    ↓
Component setState(products) → re-render
    ↓
ProductCard components render for each result (memoized)
    ↓
UI updates with filtered results
    ↓
No re-render of unchanged products (memo optimization)
```

### Example 2: Adding to Cart

```
User clicks "Add to Cart" on ProductCard
    ↓
onClick handler:
  - product data available in component props
  - useCart().addItem(product) called
    ↓
cartStore.addItem(product):
  - Check if product already in cart
  - If yes: increment quantity
  - If no: add new item with quantity=1
  - Update total price
    ↓
Zustand store triggers re-render of components using useCart()
    ↓
Store persists to localStorage automatically (persist middleware)
    ↓
CartLink component updates (shows new count badge)
    ↓
Toast notification: "Added to cart"
    ↓
User can see cart count in navbar
    ↓
On page reload, cart persists (from localStorage)
```

### Example 3: Error Handling Flow

```
User submits login form
    ↓
useAuthLogin calls fetchJson('/api/login', ...)
    ↓
POST request sent to /api/login route
    ↓
Route handler (app/api/login/route.ts):
  - Calls services/auth.logIn(credentials)
  - Try-catch block:
    - If validation error → throw AppError(message, 400)
    - If auth error → throw AppError(message, 401)
  - Catch block:
    - if (error instanceof AppError) → return error response with status
    - else → return 500 generic error
    ↓
fetchJson client sees error status
    ↓
Throws AppError from response
    ↓
useAuthLogin catch block:
  - logger.error('Login failed', { email, error })
  - setErrorMessage(error.message)
  - Toast.error(error.message)
    ↓
Component displays error message to user
    ↓
Request ID logged for debugging (middleware header)
```

## Performance Optimizations

### Component Level

1. **ProductCard Memoization:**

   ```typescript
   export default memo(ProductCard);
   ```

   Prevents re-render when parent updates unless props change.

2. **useCallback for Event Handlers:**

   ```typescript
   const handleWishlist = useCallback(() => {
     wishlistStore.toggleWishlist(product);
   }, [product, wishlistStore]);
   ```

   Prevents creating new function on each render.

3. **Dynamic Imports for Heavy Components:**

   ```typescript
   const ProductCard = dynamic(() => import("@/components/ui/productCard"));
   ```

   Lazy loads code-split component only when needed.

4. **Image Lazy Loading (Next.js Image):**
   ```typescript
   <Image
     src={imageUrl}
     loading="lazy"
     sizes="(max-width: 640px) 100vw, 50vw"
   />
   ```
   Defers off-screen image loading.

### Server Level

1. **Server-Side Filtering (Supabase):**
   - Filtering at DB level (WHERE clause) faster than JavaScript array filtering.
   - Pagination: fetch 20 products per page instead of all 1000+.

2. **Caching:**
   - API responses cached in Redis or CDN (future).
   - Revalidate on product updates.

3. **Compression:**
   - Gzip compression on API responses (Next.js default).
   - Image optimization (Next.js Image component).

## Error Handling Strategy

### Client-Side

```typescript
try {
  await fetchJson("/api/endpoint", data);
  toast.success("Success!");
} catch (error) {
  if (error instanceof AppError) {
    logger.warn("Expected error", {
      error: error.message,
      status: error.statusCode,
    });
    toast.error(error.message);
  } else {
    logger.error("Unexpected error", { error });
    toast.error("Something went wrong. Please try again.");
  }
}
```

### Server-Side

```typescript
export async function POST(req: NextRequest) {
  const requestId = req.headers.get("x-request-id");

  try {
    const result = await service.doSomething();
    logger.info("Success", { requestId, result });
    return NextResponse.json({ data: result });
  } catch (error) {
    if (error instanceof AppError) {
      logger.warn("Validation error", { requestId, error: error.message });
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    logger.error("Unexpected error", { requestId, error });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

## Related Documentation

- [`docs/SETUP.md`](./SETUP.md) - Getting started
- [`docs/AUTH_FLOW.md`](./AUTH_FLOW.md) - Authentication details
- [`docs/DATABASE_UPGRADE.md`](./DATABASE_UPGRADE.md) - Data persistence
- [`docs/TESTING.md`](./TESTING.md) - Testing strategies
