import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as audit from "@/lib/audit";
import * as adminSupabase from "@/lib/supabase/admin";
import * as authAssert from "@/lib/auth/assertAdmin";
import {
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
} from "@/services/admin/product";

vi.mock("@/lib/supabase/admin");
vi.mock("@/lib/auth/assertAdmin");

describe("Admin audit integration (unit)", () => {
  beforeEach(() => {
    // mock assertAdmin to return a fake admin user
    (authAssert as any).assertAdmin = vi
      .fn()
      .mockResolvedValue({ id: "admin-1" });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("records audit on createAdminProduct", async () => {
    const spy = vi
      .spyOn(audit, "recordAudit")
      .mockResolvedValue(undefined as any);

    // mock supabase admin chain for insert().select().single()
    const single = vi
      .fn()
      .mockResolvedValue({ data: { id: "prod-1" }, error: null });
    const select = vi.fn(() => ({ single }));
    const insert = vi.fn(() => ({ select }));
    const from = vi.fn(() => ({ insert }));
    (adminSupabase as any).createAdminSupabase = vi.fn(() => ({ from }));

    const product = await createAdminProduct(
      { name: "X", price: 10, stock: 5, category: "C" } as any,
      { requestId: "r1" }
    );

    expect(spy).toHaveBeenCalledWith(
      "product.create",
      "admin-1",
      expect.objectContaining({ name: "X" })
    );
    expect(product?.id).toBe("prod-1");
  });

  it("records audit on updateAdminProduct", async () => {
    const spy = vi
      .spyOn(audit, "recordAudit")
      .mockResolvedValue(undefined as any);

    const eq = vi.fn().mockResolvedValue({ error: null });
    const update = vi.fn(() => ({ eq }));
    const from = vi.fn(() => ({ update }));
    (adminSupabase as any).createAdminSupabase = vi.fn(() => ({ from }));

    await updateAdminProduct(
      { id: "prod-1", name: "Y", price: 15, stock: 3, category: "C" } as any,
      { requestId: "r2" }
    );

    expect(spy).toHaveBeenCalledWith(
      "product.update",
      "admin-1",
      expect.objectContaining({ id: "prod-1" })
    );
  });

  it("records audit on deleteAdminProduct", async () => {
    const spy = vi
      .spyOn(audit, "recordAudit")
      .mockResolvedValue(undefined as any);

    const del = vi.fn().mockResolvedValue({ error: null });
    const eq = vi.fn(() => ({ del }));
    const from = vi.fn(() => ({ delete: () => ({ eq }) }));
    (adminSupabase as any).createAdminSupabase = vi.fn(() => ({ from }));

    await deleteAdminProduct("prod-2", { requestId: "r3" });

    expect(spy).toHaveBeenCalledWith(
      "product.delete",
      "admin-1",
      expect.objectContaining({ id: "prod-2" })
    );
  });
});
