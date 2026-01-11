import { describe, it, expect } from "vitest";
import { loginService, signupService } from "@/services/auth";
import AppError from "@/lib/errors";

describe("auth services validation", () => {
  it("login invalid payload throws AppError", async () => {
    await expect(
      loginService({ email: "bad", password: "short" })
    ).rejects.toBeInstanceOf(AppError);
  });

  it("signup invalid payload throws AppError", async () => {
    await expect(
      signupService({ fullName: "", email: "x", password: "123" })
    ).rejects.toBeInstanceOf(AppError);
  });
});
