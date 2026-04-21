import { z } from "zod";
import type { EnvConfig } from "@/types/index.ts";

const EnvSchema = z.object({
  PORT: z.coerce.number().default(3002),
  JWT_SECRET: z.string().min(32),
  API_KEY_WEB: z.string().min(8),
  API_KEY_APP: z.string().min(8),
  BROWSER_MAX_PAGES: z.coerce.number().default(3),
  BROWSER_TIMEOUT: z.coerce.number().default(30000),
  BROWSER_IMG_TIMEOUT: z.coerce.number().default(10000),
  CHROMIUM_PATH: z.string().optional(),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
});

function loadConfig(): EnvConfig {
  const raw = {
    PORT: process.env.PORT ?? "3002",
    JWT_SECRET: process.env.JWT_SECRET ?? "default-jwt-secret-change-in-production",
    API_KEY_WEB: process.env.API_KEY_WEB ?? "dev-web-key",
    API_KEY_APP: process.env.API_KEY_APP ?? "dev-app-key",
    BROWSER_MAX_PAGES: process.env.BROWSER_MAX_PAGES ?? "3",
    BROWSER_TIMEOUT: process.env.BROWSER_TIMEOUT ?? "30000",
    BROWSER_IMG_TIMEOUT: process.env.BROWSER_IMG_TIMEOUT ?? "10000",
    CHROMIUM_PATH: process.env.CHROMIUM_PATH,
    LOG_LEVEL: process.env.LOG_LEVEL ?? "info",
  };

  const parsed = EnvSchema.parse(raw);

  return {
    PORT: parsed.PORT,
    JWT_SECRET: parsed.JWT_SECRET,
    API_KEY_WEB: parsed.API_KEY_WEB,
    API_KEY_APP: parsed.API_KEY_APP,
    BROWSER_MAX_PAGES: parsed.BROWSER_MAX_PAGES,
    BROWSER_TIMEOUT: parsed.BROWSER_TIMEOUT,
    BROWSER_IMG_TIMEOUT: parsed.BROWSER_IMG_TIMEOUT,
    CHROMIUM_PATH: parsed.CHROMIUM_PATH ?? "",
    LOG_LEVEL: parsed.LOG_LEVEL,
  };
}

export const config = loadConfig();

export function getConfig(): EnvConfig {
  return config;
}