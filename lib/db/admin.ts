import 'server-only';

/**
 * ADMIN CLIENT — SUPABASE SERVICE ROLE KEY
 * @layer L4 Infrastructure
 * @restriction Import ONLY from services/admin/* — never from components, hooks, API routes, or pages directly
 * @security This key bypasses Row Level Security. Never expose to the browser.
 */
import { createClient } from "@supabase/supabase-js";

export function createAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
      },
    }
  );
}
