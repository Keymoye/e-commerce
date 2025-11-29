import { NextResponse } from "next/server";
import { logoutService } from "@/services/auth";

export async function POST() {
  try {
    await logoutService();
    return NextResponse.json({ message: "Logout successful" });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Internal server error";
    const status = (err as { status?: number })?.status ?? 500;
    return NextResponse.json({ error: message }, { status });
  }
}
