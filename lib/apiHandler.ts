import { NextResponse } from "next/server";
import logger from "./logger";
import AppError from "./errors";
import { reportServerError } from "./errorReporter";

export type HandlerContext = {
  requestId: string;
};

export type ApiHandlerFn = (
  request: Request,
  ctx: HandlerContext
) => Promise<NextResponse | { status?: number; body?: unknown }>;

export function withApiHandler(fn: ApiHandlerFn) {
  return async function (request: Request) {
    const requestId =
      request.headers.get("x-request-id") ??
      (typeof crypto !== "undefined" && (crypto as any).randomUUID
        ? (crypto as any).randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);

    try {
      const result = await fn(request, { requestId });

      if (result instanceof NextResponse) {
        result.headers.set("x-request-id", requestId);
        return result;
      }

      const status = result.status ?? 200;
      const body = result.body ?? result;
      const res = NextResponse.json(body, { status });
      res.headers.set("x-request-id", requestId);
      return res;
    } catch (err: unknown) {
      const status = (err as any)?.status ?? 500;
      const message =
        status >= 500
          ? "Internal server error"
          : ((err as Error)?.message ?? "Error");

      logger.error({ requestId }, "API error", err);

      // Report to an external error provider (Sentry) asynchronously when configured
      reportServerError(err, { requestId }).catch(() => null);

      const payload: Record<string, unknown> = {
        error: message,
        requestId,
      };

      return NextResponse.json(payload, { status });
    }
  };
}
