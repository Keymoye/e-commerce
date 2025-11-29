import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { randomUUID, createHash } from "crypto";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
): Promise<NextResponse> {
  const supabase = await createServerSupabaseClient();
  const resolvedParams = await params;
  const provider = resolvedParams.provider as "google" | "github";

  // PKCE
  const codeVerifier = randomUUID();
  const codeChallenge = createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");

  // Extract origin dynamically
  const origin = new URL(req.url).origin;
  const redirectTo = `${origin}/auth/callback`;

  // OAuth URL
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      queryParams: {
        code_challenge: codeChallenge,
        code_challenge_method: "S256",
      },
    },
  });

  if (error || !data?.url) {
    return NextResponse.json(
      { error: error?.message ?? "OAuth error" },
      { status: 500 }
    );
  }

  // Redirect user to OAuth provider
  const res = NextResponse.redirect(data.url);

  // Set PKCE cookie (secure + sameSite)
  res.cookies.set("sb-code-verifier", codeVerifier, {
    httpOnly: true,
    secure: req.url.startsWith("https://"), // true on HTTPS
    sameSite: "none", // required for cross-site OAuth redirect
    path: "/",
  });

  return res;
}
