import { test, expect } from "@playwright/test";

test("homepage loads and shows products", async ({ page, baseURL }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/ecommerce|shop|products/i);
  // Basic smoke test: find product card element
  const cards = await page.locator('[data-testid="product-card"]').first();
  await expect(cards).toBeVisible();
});
