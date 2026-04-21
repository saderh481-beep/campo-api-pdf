import { createMiddleware } from "hono/factory";
import { createRequestLogger, maskSensitiveData } from "../utils/logger.ts";
import type { AppContext } from "../types/index.ts";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(404, message, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = "Bad request") {
    super(400, message, "BAD_REQUEST");
    this.name = "BadRequestError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized") {
    super(401, message, "UNAUTHORIZED");
    this.name = "UnauthorizedError";
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = "Internal server error") {
    super(500, message, "INTERNAL_SERVER_ERROR");
    this.name = "InternalServerError";
  }
}

export class TimeoutError extends AppError {
  constructor(message: string = "Operation timed out") {
    super(408, message, "TIMEOUT");
    this.name = "TimeoutError";
  }
}

export function handleZodError(zodError: unknown): string {
  if (typeof zodError === "object" && zodError !== null && "issues" in zodError) {
    const issues = (zodError as { issues: Array<{ message: string }> }).issues;
    return issues.map((i) => i.message).join(", ");
  }
  return "Invalid data";
}

export const errorHandlerMiddleware = createMiddleware<AppContext>(async (c, next) => {
  await next();

  const res = c.res;
  const requestId = c.get("requestId") as string;
  const log = createRequestLogger(requestId || "unknown");

  if (res.status >= 400) {
    log.warn(
      {
        status: res.status,
        path: c.req.path,
        method: c.req.method,
      },
      "Request error"
    );
  }
});

export function getErrorMiddleware() {
  return async function errorMiddleware(
    c: any,
    next: () => Promise<void>
  ) {
    const requestId = c.get("requestId") || "unknown";
    const log = createRequestLogger(requestId);

    try {
      await next();
    } catch (err) {
      const requestId = c.get("requestId") || "unknown";
      const log = createRequestLogger(requestId);

      if (err instanceof AppError) {
        log.warn({ error: err.message, code: err.code }, "App error");
        return c.json(
          {
            error: err.name,
            message: err.message,
            code: err.code,
          },
          err.statusCode
        );
      }

      if (err && typeof err === "object" && "issues" in err) {
        const message = handleZodError(err);
        log.warn({ error: message }, "Validation error");
        return c.json(
          {
            error: "ValidationError",
            message,
          },
          400
        );
      }

      log.error({ err }, "Unhandled error");
      return c.json(
        {
          error: "InternalServerError",
          message: "An unexpected error occurred",
        },
        500
      );
    }
  };
}