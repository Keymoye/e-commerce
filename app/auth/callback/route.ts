import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Missing OAuth code" }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();
  const codeVerifier = request.cookies.get("sb-code-verifier")?.value;

  if (!codeVerifier) {
    return NextResponse.json({ error: "Missing code verifier" }, { status: 400 });
  }

  // Exchange OAuth code for session
  const { data, error } = await supabase.auth.exchangeCodeForSession(code, codeVerifier);

  if (error) {
    console.error("❌ OAuth exchange failed:", error.message);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const redirectBase = process.env.NEXT_PUBLIC_SITE_URL!;
  const response = NextResponse.redirect(`${redirectBase}/`);

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

  // Clear code_verifier cookie after use
  response.cookies.delete("sb-code-verifier");

  return response;
}
