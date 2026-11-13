import { describe, it, expect, afterEach, vi } from "vitest";
import { Hono } from "hono";
import { withNodeEnv } from "../helpers.js";

afterEach(() => {
  vi.unstubAllEnvs();
});

// Fires `count` requests from the same client through the login limiter
// of a freshly loaded module and returns the status codes.
async function loginStatuses(nodeEnv: "production" | "development" | "test", count: number) {
  const { loginRateLimiter } = await withNodeEnv(nodeEnv, () =>
    import("../../../src/middleware/rate-limit.js"),
  );
  const app = new Hono();
  app.use(loginRateLimiter);
  app.get("/", (c) => c.text("ok"));

  const statuses: number[] = [];
  for (let i = 0; i < count; i++) {
    const res = await app.request("/", { headers: { "x-forwarded-for": "1.2.3.4" } });
    statuses.push(res.status);
  }
  return statuses;
}

describe("rate limiters", () => {
  it("do not limit in development", async () => {
    const statuses = await loginStatuses("development", 10);
    expect(statuses.every((s) => s === 200)).toBe(true);
  });

  it("limit login attempts in production", async () => {
    const statuses = await loginStatuses("production", 6);
    expect(statuses.slice(0, 5)).toEqual([200, 200, 200, 200, 200]);
    expect(statuses[5]).toBe(429);
  });

  it("stay active in test mode", async () => {
    const statuses = await loginStatuses("test", 6);
    expect(statuses[5]).toBe(429);
  });
});