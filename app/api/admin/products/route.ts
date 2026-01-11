import { withApiHandler } from "@/lib/apiHandler";
import { createAdminProduct, getAdminProducts } from "@/services/admin/product";

export const GET = withApiHandler(async (request: Request, { requestId }) => {
  const url = new URL(request.url);
  const page = Number(url.searchParams.get("page") ?? "1");
  const pageSize = Number(url.searchParams.get("pageSize") ?? "10");
  const res = await getAdminProducts(page, pageSize, { requestId });
  return { status: 200, body: res };
});

export const POST = withApiHandler(async (request: Request, { requestId }) => {
  const body = await request.json();
  const product = await createAdminProduct(body, { requestId });
  return { status: 201, body: product };
});
