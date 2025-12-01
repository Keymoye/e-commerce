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
