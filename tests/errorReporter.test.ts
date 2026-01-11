import { describe, expect, it } from "vitest";
import { reportClientError, reportServerError } from "@/lib/errorReporter";

describe("errorReporter no-op", () => {
  it("resolves when Sentry not configured", async () => {
    await expect(
      reportClientError(new Error("client"))
    ).resolves.toBeUndefined();
    await expect(
      reportServerError(new Error("server"))
    ).resolves.toBeUndefined();
  });
});
