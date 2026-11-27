import type { ErrorHandler } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { ZodError } from "zod";
import { baseLogger } from "./logger.js";

const logger = baseLogger.child({ name: "error-handler" });

export const errorHandler: ErrorHandler = (err, c) => {
  // Zod-Validierungsfehler → 400
  if (err instanceof ZodError) {
    return c.json(
      {
        success: false,
        error: err.issues?.[0]?.message ?? "Validation error",
      },
      400
    );
  }
  if (err instanceof SyntaxError) {
    return c.json(
      {
        success: false,
        error: "Invalid JSON",
      },
      400
    );
  }
  logger.error({
    err, 
    path: c.req.path,
    method: c.req.method,
  }, "Unhandled request error");

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
