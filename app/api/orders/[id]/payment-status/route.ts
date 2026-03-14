import { NextRequest, NextResponse } from "next/server";
import { withErrorHandler } from "@/errors/withErrorHandler";
import { AppError } from "@/errors/AppError";
import { createServerClient } from "@/lib/supabase/server";
 
export const GET = withErrorHandler(async (req: NextRequest, ctx: any) => {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw AppError.unauthorized();
  const params = await ctx?.params;
  const id = params?.id as string;
  const { data } = await supabase
    .from("payments")
    .select("status")
    .eq("order_id", id)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();
  return NextResponse.json({ data: { status: data?.status ?? "pending" } });
});
