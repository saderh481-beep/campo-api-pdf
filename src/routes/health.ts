import { Hono } from "hono";
import { browserPool } from "@/services/browser-pool.ts";
import { createRequestLogger } from "@/utils/logger.ts";

const health = new Hono();

const startTime = Date.now();

health.get("/", (c) => {
  return c.json({
    status: "ok",
    service: "campo-api-pdf",
    timestamp: new Date().toISOString(),
  });
});

health.get("/ready", async (c) => {
  // @ts-expect-error - Hono var typing issue
  const requestId = (c.var.requestId as string) || "health-ready";
  const log = createRequestLogger(requestId);

  const browserReady = await browserPool.testPage();
  const memoryUsage = process.memoryUsage();

  const status = browserReady ? "ready" : "degraded";
  const httpStatus = browserReady ? 200 : 503;

  log.debug({ browserReady, memoryUsage }, "Health check /ready");

  return c.json(
    {
      status,
      browser: browserReady ? "ready" : "not ready",
      memory: {
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + "MB",
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + "MB",
        rss: Math.round(memoryUsage.rss / 1024 / 1024) + "MB",
      },
      timestamp: new Date().toISOString(),
    },
    httpStatus
  );
});

health.get("/stats", (c) => {
  const poolStats = browserPool.getStats();
  const uptime = Math.floor((Date.now() - startTime) / 1000);

  return c.json({
    uptime: uptime + "s",
    pagePool: poolStats,
    timestamp: new Date().toISOString(),
  });
});

export default health;