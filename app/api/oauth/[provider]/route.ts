import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { randomUUID, createHash } from "crypto";

export async function GET(
  req: Request,
  { params }: { params: { provider: string } }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const provider = params.provider as "google" | "github";

    // PKCE: generate verifier
    const codeVerifier = randomUUID();

    // PKCE: generate challenge (S256)
    const codeChallenge = createHash("sha256")
      .update(codeVerifier)
      .digest("base64url");

    const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`;

    // Get OAuth URL
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

    if (error) {
      console.error("OAuth init error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Create redirect response TO provider OAuth page
    const res = NextResponse.redirect(data.url);

    // Set PKCE cookie
    res.cookies.set("sb-code-verifier", codeVerifier, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
    });

    return res;
  } catch (e: any) {
    console.error("Route crashed:", e);
    return NextResponse.json(
      { error: "Server error initializing OAuth" },
      { status: 500 }
    );
  }
}
