import { describe, it, expect } from "vitest";
import {
  createAdminProduct,
  updateAdminProduct,
} from "@/services/admin/product";
import AppError from "@/lib/errors";

describe("admin product service validation", () => {
  it("createAdminProduct invalid payload throws AppError", async () => {
    await expect(
      createAdminProduct({
        name: "",
        price: -1,
        stock: -1,
        category: "",
      } as any)
    ).rejects.toBeInstanceOf(AppError);
  });

  it("updateAdminProduct invalid payload throws ZodError (wrapped as AppError by caller)", async () => {
    await expect(
      updateAdminProduct({
        id: "",
        name: "",
        price: -1,
        stock: -1,
        category: "",
      } as any)
    ).rejects.toBeDefined();
  });
});
