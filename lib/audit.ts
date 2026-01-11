import { createAdminSupabase } from "@/lib/supabase/admin";
import logger from "@/lib/logger";

/**
 * Record an admin audit entry. Assumes a table `admin_audits` exists with columns:
 * - id (uuid)
 * - action (text)
 * - user_id (uuid)
 * - details (jsonb)
 * - created_at (timestamp)
 *
 * Create the table in your DB or adjust to your audit schema before enabling.
 */
export async function recordAudit(
  action: string,
  userId?: string,
  details?: Record<string, unknown>
) {
  try {
    const supabase = createAdminSupabase();
    await supabase
      .from("admin_audits")
      .insert([{ action, user_id: userId ?? null, details }]);
  } catch (e) {
    // audit failures should not block the request; log and continue
    logger.warn("Failed to write audit entry", e);
  }
}

export async function getRecentAudits(limit = 50) {
  try {
    const supabase = createAdminSupabase();
    const { data, error } = await supabase
      .from("admin_audits")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      // if table doesn't exist or query fails, return empty array and log
      logger.warn("Failed to fetch admin audits", error);
      return [] as any[];
    }

    return data ?? [];
  } catch (e) {
    logger.warn("Failed to fetch admin audits", e);
    return [] as any[];
  }
}

export default { recordAudit, getRecentAudits };
