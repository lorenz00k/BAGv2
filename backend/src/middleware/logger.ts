import { pinoLogger } from "hono-pino";
import pino from "pino";
import { env, isProduction } from "../env.js";

const devLogger = pino({
  level: env.LOG_LEVEL,
  transport: { target: "pino-pretty" },
});

const prodLogger = pino({ level: env.LOG_LEVEL });

const baseLogger = isProduction ? prodLogger : devLogger;
export { baseLogger };

export const logger = pinoLogger({ pino: baseLogger });
