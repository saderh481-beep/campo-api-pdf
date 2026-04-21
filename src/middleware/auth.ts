import { createMiddleware } from "hono/factory";
import { jwtVerify } from "jose";
import { config } from "@/config/index.ts";
import { createRequestLogger } from "@/utils/logger.ts";
import type { AppContext } from "@/types/index.ts";

const JWT_SECRET_BYTES = new TextEncoder().encode(config.JWT_SECRET);

async function verifyJwt(token: string): Promise<{
  id: string;
  email: string;
  rol: string;
} | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET_BYTES);
    return {
      id: payload.sub as string,
      email: payload.email as string,
      rol: payload.rol as string,
    };
  } catch {
    return null;
  }
}

function verifyApiKey(apiKey: string, requestId: string): {
  id: string;
  email: string;
  rol: string;
} | null {
  const log = createRequestLogger(requestId);

  if (apiKey === config.API_KEY_WEB) {
    return {
      id: "api-web",
      email: "web-service@campo.local",
      rol: "service",
    };
  }

  if (apiKey === config.API_KEY_APP) {
    return {
      id: "api-app",
      email: "app-service@campo.local",
      rol: "app",
    };
  }

  log.warn({ apiKeyPrefix: apiKey.substring(0, 4) }, "Invalid API key attempt");
  return null;
}

export const authMiddleware = createMiddleware<AppContext>(async (c, next) => {
  const requestId = c.get("requestId") as string;
  const log = createRequestLogger(requestId || "unknown");

  const authHeader = c.req.header("Authorization");
  const apiKey = c.req.header("X-API-Key");

  if (apiKey) {
    const user = verifyApiKey(apiKey, requestId);
    if (user) {
      c.set("auth", user);
      log.debug({ method: "api-key", userId: user.id }, "Authenticated via API key");
      await next();
      return;
    }
  }

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const user = await verifyJwt(token);
    if (user) {
      c.set("auth", user);
      log.debug({ method: "jwt", userId: user.id }, "Authenticated via JWT");
      await next();
      return;
    }
  }

  log.warn({ hasAuthHeader: !!authHeader, hasApiKey: !!apiKey }, "Authentication failed");
  return c.json({ error: "Unauthorized", message: "Invalid or missing authentication" }, 401);
});