import { test, expect } from "@playwright/test";

test("homepage loads and shows products", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/ecommerce|shop|products/i);
  const cards = await page.locator('[data-testid="product-card"]').first();
  await expect(cards).toBeVisible();
});
