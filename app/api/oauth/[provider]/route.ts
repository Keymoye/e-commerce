import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { randomUUID } from "crypto";

const redirectBase = process.env.NEXT_PUBLIC_SITE_URL!;

export async function GET(
  _req: Request,
  { params }: { params: { provider: string } }
) {
  const supabase = createServerSupabaseClient();
  const provider = params.provider as "google" | "github";

  // Generate PKCE code_verifier and store in HttpOnly cookie
  const codeVerifier = randomUUID(); // random string for PKCE
  const response = NextResponse.redirect(
    `${redirectBase}/auth/callback`
  );

  response.cookies.set("sb-code-verifier", codeVerifier, {
    httpOnly: true,
    secure: true,
    path: "/",
    sameSite: "lax",
  });

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${redirectBase}/auth/callback`,
      queryParams: {
        code_challenge: codeVerifier,
        code_challenge_method: "plain", // or 'S256' for stronger security
      },
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.redirect(data.url);
}
