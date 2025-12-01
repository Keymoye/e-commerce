# Testing Guide

Comprehensive testing strategy for the Keystore e-commerce application, including unit tests, integration tests, E2E tests, and accessibility checks.

## Overview

The project uses:

- **Vitest** for unit and integration tests
- **Playwright** for end-to-end (E2E) tests
- **Axe** for accessibility testing
- **GitHub Actions** for CI/CD test execution

## Test Structure

```
tests/
├── services/
│   ├── auth.test.ts          # Authentication service tests
│   └── products.test.ts       # Product service tests
├── hooks/
│   ├── useProducts.test.ts
│   └── useCart.test.ts
└── components/
    └── productCard.test.ts

playwright/
├── e2e/
│   ├── auth.spec.ts           # Login, signup, OAuth
│   ├── products.spec.ts        # Product browsing
│   ├── cart.spec.ts            # Add/remove from cart
│   └── checkout.spec.ts        # Checkout flow
└── axe/
    └── axe.spec.ts             # Accessibility audit
```

## Running Tests

### Unit Tests (Vitest)

```bash
# Run all unit tests
pnpm run test:run

# Run in watch mode (re-run on file changes)
pnpm run test

# Run specific test file
pnpm run test:run tests/services/auth.test.ts

# Run with coverage report
pnpm run test:coverage
```

**Coverage Report:**

```
Statements  : 78.5% ( 200/255 )
Branches    : 72.1% ( 120/166 )
Functions   : 85.2% ( 87/102 )
Lines       : 79.3% ( 195/246 )
```

Target: Maintain >80% coverage on core services and hooks.

### E2E Tests (Playwright)

```bash
# Start dev server first
pnpm run dev

# In another terminal, run E2E tests
npx playwright test

# Run specific test file
npx playwright test playwright/e2e/auth.spec.ts

# Run in UI mode (visual debugging)
npx playwright test --ui

# Run with headed browser (see what's happening)
npx playwright test --headed --project=chromium
```

### Accessibility Tests (Axe)

```bash
# Part of Playwright tests
npx playwright test playwright/axe/

# Or run all tests with axe checks
npx playwright test
```

## Example: Writing Unit Tests

### Test: Auth Service

**File:** `tests/services/auth.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { signUp, logIn } from "@/services/auth";
import { AppError } from "@/lib/errors";

// Mock Supabase
vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
    },
  }),
}));

describe("Auth Service", () => {
  describe("signUp", () => {
    it("should successfully create user account", async () => {
      const user = await signUp({
        email: "test@example.com",
        password: "SecurePass123!",
        fullName: "Test User",
      });

      expect(user.email).toBe("test@example.com");
      expect(user.id).toBeDefined();
    });

    it("should reject invalid email", async () => {
      expect(async () => {
        await signUp({
          email: "invalid-email",
          password: "SecurePass123!",
          fullName: "Test",
        });
      }).rejects.toThrow("Invalid email");
    });

    it("should reject weak password", async () => {
      expect(async () => {
        await signUp({
          email: "test@example.com",
          password: "weak",
          fullName: "Test",
        });
      }).rejects.toThrow("Password must be at least 8 characters");
    });
  });

  describe("logIn", () => {
    it("should return session on successful login", async () => {
      const session = await logIn({
        email: "test@example.com",
        password: "SecurePass123!",
      });

      expect(session.access_token).toBeDefined();
      expect(session.user.email).toBe("test@example.com");
    });

    it("should throw error on invalid credentials", async () => {
      expect(async () => {
        await logIn({
          email: "test@example.com",
          password: "wrong-password",
        });
      }).rejects.toThrow(AppError);
    });
  });
});
```

### Test: useCart Hook

**File:** `tests/hooks/useCart.test.ts`

```typescript
import { renderHook, act } from "@testing-library/react";
import { useCart } from "@/hooks/useCart";

describe("useCart Hook", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should initialize with empty cart", () => {
    const { result } = renderHook(() => useCart());
    expect(result.current.items).toEqual([]);
    expect(result.current.total).toBe(0);
  });

  it("should add item to cart", () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addItem({
        id: "1",
        name: "Product",
        price: 100,
      });
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.total).toBe(100);
  });

  it("should update quantity if item already in cart", () => {
    const { result } = renderHook(() => useCart());
    const product = { id: "1", name: "Product", price: 100 };

    act(() => {
      result.current.addItem(product);
      result.current.addItem(product);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(2);
    expect(result.current.total).toBe(200);
  });

  it("should remove item from cart", () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addItem({ id: "1", name: "Product", price: 100 });
      result.current.removeItem("1");
    });

    expect(result.current.items).toHaveLength(0);
    expect(result.current.total).toBe(0);
  });
});
```

## Example: Writing E2E Tests

### Test: Auth Flow

**File:** `playwright/e2e/auth.spec.ts`

```typescript
import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/login");
  });

  test("should signup with valid credentials", async ({ page }) => {
    // Click signup link
    await page.click('a:has-text("Create an account")');
    await expect(page).toHaveURL(/\/register/);

    // Fill form
    await page.fill('input[name="fullName"]', "John Doe");
    await page.fill('input[name="email"]', `test-${Date.now()}@example.com`);
    await page.fill('input[name="password"]', "SecurePass123!");
    await page.fill('input[name="confirmPassword"]', "SecurePass123!");

    // Submit
    await page.click('button[type="submit"]');

    // Should redirect to products
    await expect(page).toHaveURL(/\/products/, { timeout: 10000 });
  });

  test("should login with valid credentials", async ({ page }) => {
    // Fill form
    await page.fill('input[name="email"]', "existing@example.com");
    await page.fill('input[name="password"]', "SecurePass123!");

    // Submit
    await page.click('button[type="submit"]');

    // Should redirect to products
    await expect(page).toHaveURL(/\/products/);

    // User menu should show email
    await expect(page.locator("text=existing@example.com")).toBeVisible();
  });

  test("should show error on invalid credentials", async ({ page }) => {
    await page.fill('input[name="email"]', "nonexistent@example.com");
    await page.fill('input[name="password"]', "wrongpassword");
    await page.click('button[type="submit"]');

    // Error message should appear
    await expect(page.locator("text=Invalid email or password")).toBeVisible();
  });
});
```

### Test: Product Browsing

**File:** `playwright/e2e/products.spec.ts`

```typescript
import { test, expect } from "@playwright/test";

test.describe("Product Browsing", () => {
  test("should display all products", async ({ page }) => {
    await page.goto("http://localhost:3000/products");

    // Wait for products to load
    const products = page.locator('[data-testid="product-card"]');
    await expect(products.first()).toBeVisible();

    // Should have at least 1 product
    expect(await products.count()).toBeGreaterThan(0);
  });

  test("should filter by category", async ({ page }) => {
    await page.goto("http://localhost:3000/products");

    // Select category filter
    await page.selectOption('select[name="category"]', "Powders");

    // Wait for filtered results
    await page.waitForTimeout(300);

    // Products should be from Powders category
    const categoryTags = page.locator('[data-testid="product-category"]');
    await expect(categoryTags.first()).toContainText("Powders");
  });

  test("should search products", async ({ page }) => {
    await page.goto("http://localhost:3000/products");

    // Search for product
    await page.fill('input[placeholder="Search products..."]', "Cureline");
    await page.waitForTimeout(300);

    // Should show search results
    const product = page.locator("text=Cureline");
    await expect(product).toBeVisible();
  });

  test("should navigate to product detail", async ({ page }) => {
    await page.goto("http://localhost:3000/products");

    // Click first product
    await page.click('[data-testid="product-card"]');

    // Should navigate to product page
    await expect(page).toHaveURL(/\/products\/\w+/);

    // Product details should be visible
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator('[data-testid="product-price"]')).toBeVisible();
  });
});
```

### Test: Shopping Cart

**File:** `playwright/e2e/cart.spec.ts`

```typescript
import { test, expect } from "@playwright/test";

test.describe("Shopping Cart", () => {
  test("should add product to cart", async ({ page }) => {
    await page.goto("http://localhost:3000/products");

    // Add first product to cart
    await page.click(
      '[data-testid="product-card"] button:has-text("Add to Cart")'
    );

    // Toast notification
    await expect(page.locator("text=Added to cart")).toBeVisible();

    // Cart count should increase
    await expect(page.locator('[data-testid="cart-count"]')).toHaveText("1");
  });

  test("should view cart and proceed to checkout", async ({ page }) => {
    // Add product
    await page.goto("http://localhost:3000/products");
    await page.click(
      '[data-testid="product-card"] button:has-text("Add to Cart")'
    );

    // Go to cart
    await page.click('a[href="/cart"]');
    await expect(page).toHaveURL("/cart");

    // Cart should show product
    const cartItem = page.locator('[data-testid="cart-item"]');
    await expect(cartItem).toBeVisible();

    // Update quantity
    await page.fill('input[type="number"]', "2");
    await expect(page.locator('[data-testid="cart-total"]')).toContainText(
      "2x"
    );

    // Proceed to checkout
    await page.click('button:has-text("Proceed to Checkout")');
    await expect(page).toHaveURL("/checkout");
  });
});
```

## Accessibility Testing with Axe

**File:** `playwright/axe/axe.spec.ts`

```typescript
import { test, expect } from "@playwright/test";
import { injectAxe, checkA11y } from "axe-playwright";

test.describe("Accessibility", () => {
  test("homepage should have no accessibility violations", async ({ page }) => {
    await page.goto("http://localhost:3000");

    // Inject Axe
    await injectAxe(page);

    // Check for violations
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: {
        html: true,
      },
    });
  });

  test("products page should be accessible", async ({ page }) => {
    await page.goto("http://localhost:3000/products");
    await injectAxe(page);
    await checkA11y(page);
  });

  test("checkout page should be accessible", async ({ page }) => {
    await page.goto("http://localhost:3000/checkout");
    await injectAxe(page);
    await checkA11y(page);
  });
});
```

## CI/CD Integration

Tests run automatically on push via `.github/workflows/ci.yml`:

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install

      # Unit tests
      - run: pnpm run test:run --coverage
      - uses: codecov/codecov-action@v3

      # E2E tests
      - run: pnpm run build
      - run: npx playwright install
      - run: npx playwright test

      # Upload reports
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright/report/
```

## Testing Best Practices

### 1. Test Naming

```typescript
// ✅ Good
it("should add item to cart and update total price", () => {});

// ❌ Bad
it("test cart", () => {});
```

### 2. Test Organization

```typescript
// ✅ Group related tests
describe("Cart", () => {
  describe("addItem", () => {
    it("should add new item", () => {});
    it("should update quantity if exists", () => {});
  });

  describe("removeItem", () => {
    it("should remove item", () => {});
  });
});
```

### 3. Setup & Cleanup

```typescript
// ✅ Use beforeEach/afterEach
beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

afterEach(() => {
  vi.resetAllMocks();
});
```

### 4. Test Data

```typescript
// ✅ Use fixtures/factories
const mockProduct = {
  id: "1",
  name: "Test Product",
  price: 99.99,
};

// ❌ Avoid magic strings
const product = { id: "1", name: "Test Product", price: 99.99 };
```

### 5. Assertions

```typescript
// ✅ Specific assertions
expect(cart.items).toHaveLength(1);
expect(cart.total).toBe(100);

// ❌ Vague assertions
expect(cart).toBeTruthy();
```

## Coverage Goals

| Category   | Target | Current |
| ---------- | ------ | ------- |
| Services   | 90%+   | 92%     |
| Hooks      | 85%+   | 88%     |
| Components | 75%+   | 72%     |
| Overall    | 80%+   | 84%     |

## Debugging Failed Tests

### Vitest

```bash
# Run with verbose output
pnpm run test:run -- --reporter=verbose

# Run single test file with logging
pnpm run test -- --inspect-brk tests/services/auth.test.ts
```

### Playwright

```bash
# Debug mode with inspector
npx playwright test --debug

# Trace recording for failed tests
npx playwright test --trace on

# View trace
npx playwright show-trace trace.zip
```

## Related Documentation

- [`docs/SETUP.md`](./SETUP.md) for dev environment
- [`docs/CI_PIPELINE.md`](./CI_PIPELINE.md) for CI/CD details (if created)
- Vitest docs: https://vitest.dev
- Playwright docs: https://playwright.dev
- Axe docs: https://www.deque.com/axe/core-documentation/
