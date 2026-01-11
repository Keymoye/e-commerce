import { NextResponse } from "next/server";
import { signupService } from "@/services/auth";
import { withApiHandler } from "@/lib/apiHandler";

export const POST = withApiHandler(async (req: Request, { requestId }) => {
  const body = await req.json();
  const result = await signupService(body, { requestId });
  return NextResponse.json(
    { message: "Account created successfully", ...result },
    { status: 200 }
  );
});
