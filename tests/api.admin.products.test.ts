import { POST } from "@/app/api/admin/products/route";

describe("Admin products API", () => {
  it("POST requires authentication (returns 401)", async () => {
    const req = new Request("http://localhost/api/admin/products", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const res = await (POST as any)(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });
});
