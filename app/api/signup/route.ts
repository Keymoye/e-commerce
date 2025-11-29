import { NextResponse } from "next/server";
import { signupService } from "@/services/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await signupService(body);
    return NextResponse.json(
      { message: "Account created successfully", ...result },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    const status = (err as { status?: number })?.status ?? 500;
    return NextResponse.json({ error: message }, { status });
  }
}
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, fullName } = body;

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { message: "Account created successfully", user: data.user },
      { status: 200 }
    );
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error ? err.message : "Something went wrong";
    console.error("Signup error:", errorMsg);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
