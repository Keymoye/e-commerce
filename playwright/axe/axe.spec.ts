import { test } from "@playwright/test";
import { injectAxe, checkA11y } from "@axe-core/playwright";

test("homepage has no critical accessibility issues", async ({ page }) => {
  await page.goto("/");
  await injectAxe(page);
  await checkA11y(page, null, { detailedReport: true });
});
