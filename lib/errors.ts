export interface ErrorDetails {
  [key: string]: unknown;
}

export class AppError extends Error {
  status: number;
  code?: string;
  isOperational: boolean;
  details?: ErrorDetails;

  constructor(
    message: string,
    status = 500,
    opts?: { code?: string; details?: ErrorDetails; isOperational?: boolean }
  ) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = opts?.code;
    this.details = opts?.details;
    this.isOperational = opts?.isOperational ?? true;
  }

  toJSON() {
    return {
      message: this.message,
      status: this.status,
      code: this.code,
      details: this.details,
    } as const;
  }
}

export const isAppError = (err: unknown): err is AppError =>
  typeof err === "object" &&
  err !== null &&
  (err as { name?: unknown }).name === "AppError";

export default AppError;
