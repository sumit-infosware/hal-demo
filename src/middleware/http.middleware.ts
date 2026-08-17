import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";
import { env } from "../config/env.js";
import { AppError } from "../errors/errors.js";
import { errorBody } from "../http/ApiResponse.js";

/** Zod validation middleware: validates a single request part. */
export const validate =
  <T>(schema: ZodType<T>, part: "body" | "query" | "params" = "body") =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[part]);
    if (!result.success) {
      return next(
        new AppError(
          "Validation failed",
          400,
          "VALIDATION_ERROR",
          result.error.issues.map((i) => ({ field: i.path.join("."), message: i.message })),
        ),
      );
    }
    req[part] = result.data;
    next();
  };

/** CSRF protection for cookie-authenticated mutations. */
export function csrfProtection(req: Request, _res: Response, next: NextFunction): void {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
  if (req.headers.authorization) return next(); // Bearer-token clients skip CSRF
  if (req.cookies?.refresh_token) {
    const origin = req.headers.origin ?? req.headers.referer ?? req.headers.host;
    const allowed = env.corsOrigins.some(
      (o) =>
        origin === o || origin === new URL(o).host || (origin as string).includes(new URL(o).host),
    );
    const hasHeader = Boolean(req.header("x-requested-with"));
    if (!allowed || !hasHeader) {
      return next(new AppError("CSRF validation failed", 403, "CSRF_FAILED"));
    }
  }
  next();
}

/** Express error middleware — normalizes any thrown error into the envelope. */
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  const appErr = err instanceof AppError ? err : new AppError("Something went wrong", 500);
  const requestId = req.requestId;
  const stack = env.isDev && appErr.statusCode >= 500 ? (err as Error)?.stack : undefined;
  const body = errorBody(
    appErr.statusCode,
    appErr.code,
    appErr.message,
    appErr.details,
    requestId,
    stack,
  );

  // Only log 5xx and unexpected errors; hide details from clients in production.
  if (appErr.statusCode >= 500) {
    console.error(`[${requestId}] ${appErr.code}`, err);
  }
  res.status(appErr.statusCode).json(body);
}

/** Not-found handler. */
export function notFound(_req: Request, res: Response): void {
  res
    .status(404)
    .json(errorBody(404, "NOT_FOUND", "Route not found", undefined, undefined, undefined));
}
