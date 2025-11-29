import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (!code) return NextResponse.json({ error: "Missing OAuth code" }, { status: 400 });

  const supabase = await createServerSupabaseClient();

  const codeVerifier = request.cookies.get("sb-code-verifier")?.value;
  if (!codeVerifier) return NextResponse.json({ error: "Missing PKCE code_verifier cookie" }, { status: 400 });

  const { data, error } = await supabase.auth.exchangeCodeForSession(code, codeVerifier);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const origin = url.origin;
  const res = NextResponse.redirect(`${origin}/`);

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

  res.cookies.delete("sb-code-verifier");

  return res;
}
