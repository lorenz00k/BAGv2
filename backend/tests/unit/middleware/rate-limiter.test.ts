import { describe, it, expect, afterEach, vi } from "vitest";
import { Hono, MiddlewareHandler } from "hono";
import { withNodeEnv } from "../helpers.js";
type Limiters = typeof import("../../../src/middleware/rate-limit.js");

afterEach(() => {
  vi.unstubAllEnvs();
});

// Fires `count` requests from the same client through the login limiter
// of a freshly loaded module and returns the status codes.
async function loginStatuses(
  nodeEnv: "production" | "development" | "test",
  count: number
) {
  const { loginRateLimiter } = await withNodeEnv(
    nodeEnv,
    () => import("../../../src/middleware/rate-limit.js")
  );
  const app = new Hono();
  app.use(loginRateLimiter);
  app.get("/", (c) => c.text("ok"));

  const statuses: number[] = [];
  for (let i = 0; i < count; i++) {
    const res = await app.request("/", {
      headers: { "x-forwarded-for": "1.2.3.4" },
    });
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

describe("client identification", () => {
  // Six login attempts from ONE connection, each with a different forged
  // X-Forwarded-For header. A real attacker would do exactly this.
  async function statusesFromOneSocket(
    pick: (m: Limiters) => MiddlewareHandler,
    count: number
  ) {
    const limiters = await withNodeEnv(
      "test",
      () => import("../../../src/middleware/rate-limit.js")
    );
    const app = new Hono();
    app.use(pick(limiters));
    app.get("/", (c) => c.text("ok"));

    // Hono passes the third argument on as c.env; this is how the Node server
    // hands over the connection, so the test can fake a real socket.
    const bindings = {
      incoming: { socket: { remoteAddress: "198.51.100.7" } },
    };
    const statuses: number[] = [];
    for (let i = 0; i < count; i++) {
      const res = await app.request(
        "/",
        { headers: { "x-forwarded-for": `10.0.0.${i}` } },
        bindings
      );
      statuses.push(res.status);
    }
    return statuses;
  }

  it("cannot be bypassed with a forged X-Forwarded-For header (login)", async () => {
    const statuses = await statusesFromOneSocket((m) => m.loginRateLimiter, 6);
    expect(statuses[5]).toBe(429);
  });

  it("cannot be bypassed with a forged X-Forwarded-For header (Vienna GIS)", async () => {
    const statuses = await statusesFromOneSocket(
      (m) => m.viennagisRateLimiter,
      31
    );
    expect(statuses[30]).toBe(429);
  });
});
