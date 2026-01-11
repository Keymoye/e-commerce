import { withApiHandler } from "@/lib/apiHandler";
import { assertAdmin } from "@/lib/auth/assertAdmin";
import { getRecentAudits } from "@/lib/audit";

export const GET = withApiHandler(async (request: Request, { requestId }) => {
  // ensure admin
  await assertAdmin({ requestId });
  const audits = await getRecentAudits(50);
  return { status: 200, body: audits };
});
