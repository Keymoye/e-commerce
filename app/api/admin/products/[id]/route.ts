import { withApiHandler } from "@/lib/apiHandler";
import {
  getAdminProductById,
  updateAdminProduct,
  deleteAdminProduct,
} from "@/services/admin/product";

function extractIdFromUrl(request: Request) {
  const url = new URL(request.url);
  const parts = url.pathname.split("/").filter(Boolean);
  return parts[parts.length - 1];
}

export const GET = withApiHandler(async (request: Request, { requestId }) => {
  const id = extractIdFromUrl(request);
  const product = await getAdminProductById(id, { requestId });
  if (!product) return { status: 404, body: { error: "Not found" } };
  return { status: 200, body: product };
});

export const PUT = withApiHandler(async (request: Request, { requestId }) => {
  const id = extractIdFromUrl(request);
  const body = await request.json();
  await updateAdminProduct({ ...body, id }, { requestId });
  return { status: 200, body: { ok: true } };
});

export const DELETE = withApiHandler(
  async (request: Request, { requestId }) => {
    const id = extractIdFromUrl(request);
    await deleteAdminProduct(id, { requestId });
    return { status: 200, body: { ok: true } };
  }
);
