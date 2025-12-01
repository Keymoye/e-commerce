import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    exclude: ["playwright/**", "tests/e2e/**", "tests/axe/**"],
  },
});
