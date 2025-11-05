import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Missing OAuth code" }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();

  // This line performs the token exchange and sets cookies in the response
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("OAuth exchange failed:", error.message);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // 🧠 IMPORTANT: Return Supabase’s cookies with your redirect response
  const response = NextResponse.redirect(new URL("/", request.url));
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Ensure Supabase’s cookies propagate correctly
  const cookies = await request.headers.get("cookie");
  if (cookies) {
    response.headers.set("Set-Cookie", cookies);
  }

  return response;
}
