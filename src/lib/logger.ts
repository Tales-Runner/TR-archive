/**
 * Structured logger for server-side API routes.
 *
 * Outputs JSON lines so logs are easily parseable by log aggregators
 * (Vercel, Datadog, CloudWatch, etc.).
 *
 * Usage:
 *   import { logger } from "@/lib/logger";
 *   logger.info("Fetched notices", { count: 12 });
 *   logger.error("Upstream failed", { status: 502, url });
 */

type LogLevel = "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  msg: string;
  ts: string;
  [key: string]: unknown;
}

function emit(level: LogLevel, msg: string, meta?: Record<string, unknown>) {
  const entry: LogEntry = {
    level,
    msg,
    ts: new Date().toISOString(),
    ...meta,
  };

  const line = JSON.stringify(entry);

  switch (level) {
    case "error":
      console.error(line);
      break;
    case "warn":
      console.warn(line);
      break;
    default:
      console.log(line);
  }
}

export const logger = {
  info: (msg: string, meta?: Record<string, unknown>) => emit("info", msg, meta),
  warn: (msg: string, meta?: Record<string, unknown>) => emit("warn", msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => emit("error", msg, meta),
} as const;
