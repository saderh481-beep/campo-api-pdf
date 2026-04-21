import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { randomUUID } from "crypto";
import { getConfig } from "@/config/index.ts";
import { logger, createRequestLogger } from "@/utils/logger.ts";
import { getErrorMiddleware } from "@/middleware/error-handler.ts";
import { browserPool } from "@/services/browser-pool.ts";
import healthRoutes from "@/routes/health.ts";
import pdfRoutes from "@/routes/pdf.ts";

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
  try {
    logger.info("Initializing browser pool...");
    await browserPool.initialize();
    logger.info("Browser pool initialized");
  } catch (error) {
    logger.error({ error }, "Failed to initialize browser pool");
  }

  const port = config.PORT;

  logger.info({ port }, "Starting server...");

  const server = serve({
    fetch: app.fetch,
    port,
  });

  logger.info({ port, pid: process.pid }, "Server started");

  process.on("SIGTERM", async () => {
    logger.info("SIGTERM received, closing browser pool...");
    await browserPool.close();
    process.exit(0);
  });

  process.on("SIGINT", async () => {
    logger.info("SIGINT received, closing browser pool...");
    await browserPool.close();
    process.exit(0);
  });
};

startServer();

export default app;