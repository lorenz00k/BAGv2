import type { ErrorHandler } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import pino from "pino";

const errorLogger = pino({
  level: "error",
});

export const errorHandler: ErrorHandler = (err, c) => {
  // Logge Fehler mit pino
  errorLogger.error({
    msg: err.message,
    path: c.req.path,
    method: c.req.method,
    stack: err.stack,
  });

  // Unterscheide zwischen bekannten und unbekannten Fehlern
  const status = "status" in err ? (err.status as ContentfulStatusCode) : 500;
  const message = status === 500 ? "Internal Server Error" : err.message;

  return c.json(
    {
      success: false,
      error: message,
    },
    status
  );
};
