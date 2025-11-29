import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");

    if (!code) {
      return NextResponse.json({ error: "Missing OAuth code" }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();
      // ✅ Read cookie properly
    const codeVerifier = req.cookies.get("sb-code-verifier")?.value;

    if (!codeVerifier) {
      return NextResponse.json(
        { error: "Missing PKCE code_verifier cookie" },
        { status: 400 }
      );
    }

    // Exchange code + PKCE for session
    const { data, error } = await supabase.auth.exchangeCodeForSession(
      code,
      codeVerifier
    );

    if (error) {
      console.error("Exchange error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const res = NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/`
    );

    // Set access/refresh tokens securely
    res.cookies.set("sb-access-token", data.session!.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
    });

    res.cookies.set("sb-refresh-token", data.session!.refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
    });

    // Remove PKCE cookie
    res.cookies.delete("sb-code-verifier");

    return res;
  } catch (err) {
    console.error("Callback crashed:", err);
    return NextResponse.json({ error: "Callback crashed" }, { status: 500 });
  }
}
