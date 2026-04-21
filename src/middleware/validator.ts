import { createMiddleware } from "hono/factory";
import { z } from "zod";
import type { AppContext } from "@/types/index.ts";

export function validateBody<T extends z.ZodType>(schema: T) {
  return createMiddleware<AppContext>(async (c, next) => {
    try {
      const body = await c.req.json();
      const parsed = schema.parse(body);
      c.set("validatedBody", parsed);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const issues = err.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
        return c.json(
          {
            error: "ValidationError",
            message: issues.join(", "),
          },
          400
        );
      }
      return c.json(
        {
          error: "ValidationError",
          message: "Invalid request body",
        },
        400
      );
    }
    await next();
  });
}

export function validateQuery<T extends z.ZodType>(schema: T) {
  return createMiddleware<AppContext>(async (c, next) => {
    try {
      const query = c.req.query();
      const parsed = schema.parse(query);
      c.set("validatedQuery", parsed);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const issues = err.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
        return c.json(
          {
            error: "ValidationError",
            message: issues.join(", "),
          },
          400
        );
      }
      return c.json(
        {
          error: "ValidationError",
          message: "Invalid query parameters",
        },
        400
      );
    }
    await next();
  });
}