import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const redirectBase = process.env.NEXT_PUBLIC_SITE_URL!;

export async function GET(
  _req: Request,
  { params }: { params: { provider: string } }
) {
  const supabase = await createServerSupabaseClient();
  const provider = params.provider as "google" | "github";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${redirectBase}/auth/callback`,
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.redirect(data.url);
}
