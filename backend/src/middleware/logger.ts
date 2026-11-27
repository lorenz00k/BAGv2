import { pinoLogger } from "hono-pino";
import pino, { type DestinationStream, type LoggerOptions } from "pino";
import { env, isProduction } from "../env.js";
import pretty from "pino-pretty";

export const REDACT_PATHS = [
  "req.headers.cookie",
  "req.headers.authorization",
  'res.headers["set-cookie"]',
];

type CreateOptions = {
  production?: boolean;             // how it will be printed: pretty or just json
  level?: string;                   //Info, debug, ... -> what will be printed
  destination?: DestinationStream;  //only for tests
};

export function createBaseLogger({
  production = isProduction,
  level = env.LOG_LEVEL,
  destination,
}: CreateOptions = {}) {
  const options: LoggerOptions = {
    level,
    redact: { paths: REDACT_PATHS, censor: "[REDACTED]" },
  };

  if (production) {
    return destination ? pino(options, destination) : pino(options);
  }
  return pino(
    options,
    pretty({
      destination: destination ?? process.stdout,
      colorize: !destination,
    })
  );
}

const baseLogger = createBaseLogger();
export { baseLogger };

export const logger = pinoLogger({ pino: baseLogger });
