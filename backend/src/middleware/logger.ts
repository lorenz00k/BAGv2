import { pinoLogger } from "hono-pino";
import pino from "pino";

const isDev = process.env.NODE_ENV !== "production";

const devLogger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport: { target: "pino-pretty" },
});

const prodLogger = pino({
  level: process.env.LOG_LEVEL || "info",
});

export const logger = pinoLogger({
  pino: isDev ? devLogger : prodLogger,
});