// services/admin/products.ts
"use server";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { productSchema, createProductSchema } from "./product.schemas";
import { Product } from "@/types/product";
import { z } from "zod";
import logger from "@/lib/logger";
import AppError from "@/lib/errors";
import { assertAdmin } from "@/lib/auth/assertAdmin";
import { recordAudit } from "@/lib/audit";

type Ctx = { requestId?: string; userId?: string } | undefined;

export async function getAdminProducts(
  page: number,
  pageSize: number,
  ctx?: Ctx
) {
  const log = logger.withContext(ctx ?? {});
  const supabase = createAdminSupabase();

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  try {
    const { data, count, error } = await supabase
      .from("products")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      log.error("AdminProducts", "Failed to fetch admin products", {
        reason: error.message,
      });
      throw new AppError(error.message ?? "Failed to fetch products", 500, {
        code: "DB_ERROR",
      });
    }

    return {
      products: data ?? [],
      totalPages: Math.max(1, Math.ceil((count ?? 0) / pageSize)),
    };
  } catch (err: unknown) {
    log.error("AdminProducts", "Unexpected error in getAdminProducts", err);
    throw err instanceof AppError
      ? err
      : new AppError("Internal server error", 500);
  }
}

export async function getAdminProductById(
  id: string,
  ctx?: Ctx
): Promise<Product | null> {
  const log = logger.withContext(ctx ?? {});
  const supabase = createAdminSupabase();

  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      log.warn("AdminProducts", "Product not found", { id });
      return null;
    }
    return data;
  } catch (err: unknown) {
    log.error("AdminProducts", "Unexpected error in getAdminProductById", err);
    throw new AppError("Internal server error", 500);
  }
}

export async function updateAdminProduct(
  data: z.infer<typeof productSchema>,
  ctx?: Ctx
) {
  const log = logger.withContext(ctx ?? {});
  // ensure caller is admin
  const adminUser = await assertAdmin(ctx);

  const parsed = productSchema.parse(data);
  const supabase = createAdminSupabase();

  try {
    const { error } = await supabase
      .from("products")
      .update({
        name: parsed.name,
        price: parsed.price,
        stock: parsed.stock,
        category: parsed.category,
      })
      .eq("id", parsed.id);

    if (error) {
      log.error("AdminProducts", "Failed to update product", {
        id: parsed.id,
        reason: error.message,
      });
      throw new AppError(error.message ?? "Update failed", 500, {
        code: "DB_ERROR",
      });
    }

    import("@/lib/metrics").then(({ incrementCounter }) =>
      incrementCounter("admin.product.update")
    );
    recordAudit("product.update", adminUser.id, { id: parsed.id });
    log.info({ userId: adminUser.id }, "AdminProducts", "Product updated", {
      id: parsed.id,
    });

    return true;
  } catch (err: unknown) {
    log.error("AdminProducts", "Unexpected error in updateAdminProduct", err);
    throw err instanceof AppError
      ? err
      : new AppError("Internal server error", 500);
  }
}

export async function createAdminProduct(
  data: z.infer<typeof createProductSchema>,
  ctx?: Ctx
) {
  const log = logger.withContext(ctx ?? {});
  // ensure caller is admin
  const adminUser = await assertAdmin(ctx);

  const parsed = createProductSchema.parse(data);
  const supabase = createAdminSupabase();

  try {
    const { data: product, error } = await supabase
      .from("products")
      .insert([parsed])
      .select()
      .single();

    if (error) {
      log.error("AdminProducts", "Failed to create product", {
        reason: error.message,
      });
      throw new AppError(error.message ?? "Create failed", 500, {
        code: "DB_ERROR",
      });
    }

    // audit metric and log
    import("@/lib/metrics").then(({ incrementCounter }) =>
      incrementCounter("admin.product.create")
    );
    // store an audit entry (best-effort)
    recordAudit("product.create", adminUser.id, {
      id: product?.id,
      name: parsed?.name,
    });
    log.info({ userId: adminUser.id }, "AdminProducts", "Product created", {
      id: product?.id,
    });

    return product;
  } catch (err: unknown) {
    log.error("AdminProducts", "Unexpected error in createAdminProduct", err);
    throw err instanceof AppError
      ? err
      : new AppError("Internal server error", 500);
  }
}

export async function deleteAdminProduct(productId: string, ctx?: Ctx) {
  const log = logger.withContext(ctx ?? {});
  const adminUser = await assertAdmin(ctx);
  const supabase = createAdminSupabase();
  try {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (error) {
      log.error("AdminProducts", "Failed to delete product", {
        id: productId,
        reason: error.message,
      });
      throw new AppError(error.message ?? "Delete failed", 500, {
        code: "DB_ERROR",
      });
    }

    import("@/lib/metrics").then(({ incrementCounter }) =>
      incrementCounter("admin.product.delete")
    );
    recordAudit("product.delete", adminUser.id, { id: productId });
    log.info({ userId: adminUser.id }, "AdminProducts", "Product deleted", {
      id: productId,
    });

    return true;
  } catch (err: unknown) {
    log.error("AdminProducts", "Unexpected error in deleteAdminProduct", err);
    throw err instanceof AppError
      ? err
      : new AppError("Internal server error", 500);
  }
}
