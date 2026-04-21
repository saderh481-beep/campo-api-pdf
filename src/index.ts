import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { randomUUID } from "crypto";
import { getConfig } from "./config/index.ts";
import { logger, createRequestLogger } from "./utils/logger.ts";
import { getErrorMiddleware } from "./middleware/error-handler.ts";
import { browserPool } from "./services/browser-pool.ts";
import healthRoutes from "./routes/health.ts";
import pdfRoutes from "./routes/pdf.ts";

const app = new Hono<{ Variables: { requestId: string } }>();

const config = getConfig();

app.use("*", async (c, next) => {
  const requestId = c.req.header("Request-Id") || randomUUID();
  c.set("requestId", requestId);

  const log = createRequestLogger(requestId);

  log.debug(
    {
      method: c.req.method,
      path: c.req.path,
    },
    "Incoming request"
  );

  await next();
});

app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "X-API-Key", "Request-Id"],
  })
);

app.use(getErrorMiddleware());

app.get("/", (c) => {
  return c.json({
    service: "campo-api-pdf",
    version: "1.0.0",
    docs: "/health",
  });
});

app.route("/", healthRoutes);
app.route("/api/v1/pdf", pdfRoutes);

app.notFound((c) => {
  return c.json(
    {
      error: "NotFound",
      message: `Route ${c.req.path} not found`,
    },
    404
  );
});

const startServer = async () => {
  const port = config.PORT;
  const maxRetries = 5;
  const baseDelay = 1000;

  try {
    logger.info("Initializing browser pool...");
    await browserPool.initialize();
    logger.info("Browser pool initialized");
  } catch (error) {
    logger.error({ error }, "Failed to initialize browser pool");
    await browserPool.close();
    process.exit(1);
  }

  const startWithRetry = async (attempt: number): Promise<void> => {
    try {
      logger.info({ port, attempt }, "Starting server...");

      const server = serve({
        fetch: app.fetch,
        port,
      });

      logger.info({ port, pid: process.pid }, "Server started");
      return;
    } catch (error: unknown) {
      const err = error as { code?: string; port?: number };
      if (err.code === "EADDRINUSE" && attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
        logger.warn({ port, attempt, nextRetry: Math.round(delay) }, "Port in use, retrying...");
        await new Promise((resolve) => setTimeout(resolve, delay));
        return startWithRetry(attempt + 1);
      }
      if (err.code === "EADDRINUSE") {
        logger.error({ port }, "Failed to start server: port permanently in use");
        await browserPool.close();
        process.exit(1);
      }
      logger.error({ error }, "Failed to start server");
      await browserPool.close();
      process.exit(1);
    }
  };

  await startWithRetry(0);

  const shutdown = async () => {
    logger.info("Shutdown signal received, closing browser pool...");
    await browserPool.close();
    process.exit(0);
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
};

startServer();

export default app;