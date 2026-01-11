import { describe, expect, it } from "vitest";
import AppError from "@/lib/errors";

describe("AppError", () => {
  it("sets properties and serializes to JSON", () => {
    const err = new AppError("Not found", 404, {
      code: "NOT_FOUND",
      details: { id: 1 },
    });
    expect(err.message).toBe("Not found");
    expect(err.status).toBe(404);
    expect(err.code).toBe("NOT_FOUND");
    expect(err.details).toEqual({ id: 1 });
    expect(err.toJSON()).toEqual({
      message: "Not found",
      status: 404,
      code: "NOT_FOUND",
      details: { id: 1 },
    });
  });
});
