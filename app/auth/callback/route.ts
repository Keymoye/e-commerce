import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Missing OAuth code" }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();

  // Exchange the code for a session and set cookies automatically
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("OAuth exchange failed:", error.message);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Everything succeeded — cookies are now set
  return NextResponse.redirect("/");
}
