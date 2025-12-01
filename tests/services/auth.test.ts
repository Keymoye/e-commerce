import { describe, it, expect } from "vitest";
import { loginSchema, signupSchema } from "../../services/auth";

describe("auth schemas", () => {
  it("rejects invalid login payload", () => {
    const res = loginSchema.safeParse({
      email: "not-an-email",
      password: "123",
    });
    expect(res.success).toBe(false);
  });

  it("accepts valid login payload", () => {
    const res = loginSchema.safeParse({ email: "a@b.com", password: "abcdef" });
    expect(res.success).toBe(true);
  });

  it("rejects invalid signup payload", () => {
    const res = signupSchema.safeParse({
      fullName: "",
      email: "x",
      password: "1",
    });
    expect(res.success).toBe(false);
  });

  it("accepts valid signup payload", () => {
    const res = signupSchema.safeParse({
      fullName: "Alice",
      email: "a@b.com",
      password: "abcdef",
    });
    expect(res.success).toBe(true);
  });
});
