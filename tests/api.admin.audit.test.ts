import { GET } from "@/app/api/admin/audit/route";

describe("Admin audit API", () => {
  it("GET requires admin auth (returns 401 when unauthenticated)", async () => {
    const req = new Request("http://localhost/api/admin/audit");
    const res = await (GET as any)(req);
    expect(res.status).toBe(401);
  });
});
