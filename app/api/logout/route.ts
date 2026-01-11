import { NextResponse } from "next/server";
import { logoutService } from "@/services/auth";
import { withApiHandler } from "@/lib/apiHandler";

export const POST = withApiHandler(async (_req: Request, { requestId }) => {
  await logoutService({ requestId });
  return NextResponse.json({ message: "Logout successful" });
});
