import { Request, Response, NextFunction } from "express";

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === "production" && statusCode === 500
      ? "Internal server error"
      : err.message;

  console.error(`[ERROR] ${statusCode} — ${err.message}`, err.stack);

  res.status(statusCode).json({
    error: { message, code: err.code },
  });
}

export function notFound(_req: Request, res: Response): void {
  res.status(404).json({ error: { message: "Route not found" } });
}
