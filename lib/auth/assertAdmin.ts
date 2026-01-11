import AppError from "@/lib/errors";
import { getUser } from "@/lib/supabase/getUser";
import { createAdminSupabase } from "@/lib/supabase/admin";
import logger from "@/lib/logger";

export async function assertAdmin(ctx?: { requestId?: string }) {
  const log = logger.withContext({ requestId: ctx?.requestId });
  const user = await getUser();
  if (!user) {
    log.warn("Auth", "Unauthorized access attempt (no user)");
    throw new AppError("Unauthorized", 401, { code: "UNAUTHORIZED" });
  }

  const adminSupabase = createAdminSupabase();
  const { data, error } = await adminSupabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error) {
    log.error("Auth", "Failed to verify admin role", error);
    throw new AppError("Unable to verify permissions", 500, {
      code: "ROLE_CHECK_FAILED",
    });
  }

  if (data?.role !== "admin") {
    log.warn("Auth", "Unauthorized access attempt (not admin)", {
      userId: user.id,
    });
    throw new AppError("Forbidden", 403, { code: "FORBIDDEN" });
  }

  log.info({ userId: user.id }, "Auth", "Admin verified");
  return user;
}
