import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Missing OAuth code" }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();

  // Exchange OAuth code for session
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("❌ OAuth exchange failed:", error.message);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // ✅ Build redirect response
  const redirectBase =
    process.env.NEXT_PUBLIC_SITE_URL! || "http://localhost:3000";

  const response = NextResponse.redirect(`${redirectBase}/`);

  // ✅ Set Supabase cookies from the response of exchangeCodeForSession
  if (data.session) {
    const { access_token, refresh_token } = data.session;
    response.cookies.set("sb-access-token", access_token, {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    });
    response.cookies.set("sb-refresh-token", refresh_token, {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    });
  }

  console.log("✅ OAuth session established successfully");

  return response;
}
