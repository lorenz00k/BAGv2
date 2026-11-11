import { describe, it, expect, vi, beforeEach } from "vitest";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";

// Replace the logger, so the tests stay quiet and can check what gets logged
const { error: logError } = vi.hoisted(() => ({ error: vi.fn() }));
vi.mock("pino", () => ({ default: () => ({ error: logError }) }));

import { errorHandler } from "../../../src/middleware/error-handler.js";

// A tiny app whose only route throws the given error
function appThrowing(error: unknown) {
  const app = new Hono();
  app.get("/boom", () => {
    throw error;
  });
  app.onError(errorHandler);
  return app;
}

const call = (error: unknown) => appThrowing(error).request("/boom");

beforeEach(() => {
  logError.mockClear();
});

describe("errorHandler", () => {
  it("answers a validation error with 400 and the first message", async () => {
    const result = z.object({ email: z.email() }).safeParse({ email: "nope" });
    const zodError = result.error!;

    const res = await call(zodError);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      success: false,
      error: zodError.issues[0]!.message,
    });
    expect(logError).not.toHaveBeenCalled();
  });

  it("answers invalid JSON with 400", async () => {
    const res = await call(new SyntaxError("Unexpected token"));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ success: false, error: "Invalid JSON" });
    expect(logError).not.toHaveBeenCalled();
  });

  it.each([
    [400, "Bad input"],
    [401, "Invalid credentials"],
    [404, "Check not found"],
  ])(
    "passes the status and message of an HTTPException with %i",
    async (status, message) => {
      const res = await call(
        new HTTPException(status as 400 | 401 | 404, { message })
      );
      expect(res.status).toBe(status);
      expect(await res.json()).toEqual({ success: false, error: message });
    }
  );

  it("hides the details of an unexpected error and logs them", async () => {
    const res = await call(
      new Error("connection to db with password hunter2 failed")
    );
    expect(res.status).toBe(500);

    const text = await res.text();
    expect(text).toContain("Internal Server Error");
    expect(text).not.toContain("hunter2");

    expect(logError).toHaveBeenCalledTimes(1);
    expect(logError.mock.calls[0]![0]).toMatchObject({
      path: "/boom",
      method: "GET",
    });
  });

  it("hides the message of an HTTPException with status 500", async () => {
    const res = await call(
      new HTTPException(500, { message: "internal detail" })
    );
    expect(res.status).toBe(500);
    expect(await res.text()).not.toContain("internal detail");
  });
});
