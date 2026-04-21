import pino from "pino";
import { config } from "@/config/index.ts";

const loggerOptions: pino.LoggerOptions = {
  level: config.LOG_LEVEL,
  transport: process.env.NODE_ENV !== "production"
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      }
    : undefined,
};

export const logger = pino(loggerOptions);

export function createRequestLogger(requestId: string): pino.Logger {
  return logger.child({ requestId });
}

export function maskSensitiveData(data: Record<string, unknown>): Record<string, unknown> {
  const masked = { ...data };
  const sensitiveKeys = ["api_key", "jwt", "token", "secret", "password"];

  for (const key of Object.keys(masked)) {
    const lowerKey = key.toLowerCase();
    if (sensitiveKeys.some((sk) => lowerKey.includes(sk)) && typeof masked[key] === "string") {
      const str = masked[key] as string;
      if (str.length > 4) {
        masked[key] = str.substring(0, 4) + "****";
      } else {
        masked[key] = "****";
      }
    }
  }

  return masked;
}