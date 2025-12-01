export class AppError extends Error {
  status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.name = "AppError";
    this.status = status;
  }
}

export const isAppError = (err: unknown): err is AppError =>
  typeof err === "object" &&
  err !== null &&
  (err as { name?: unknown }).name === "AppError";

export default AppError;
