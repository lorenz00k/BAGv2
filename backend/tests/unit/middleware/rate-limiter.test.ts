import { describe, it, expect, afterEach, vi } from "vitest";
import { Hono, MiddlewareHandler } from "hono";
import { withNodeEnv } from "../helpers.js";
import { MemoryStore, type Store } from "hono-rate-limiter";
import { createRateLimiters } from "../../../src/middleware/rate-limit.js";
import { withFallback } from "../../../src/utils/rateLimitStore.js";

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

  it("limit login attempts in production, even when Redis is unreachable", async () => {
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

describe("createRateLimiters", () => {
  const bindings = { incoming: { socket: { remoteAddress: "198.51.100.7" } } };

  // Sends `times` requests from the same client through one limiter.
  async function hit(limiter: MiddlewareHandler, times: number) {
    const app = new Hono();
    app.use(limiter);
    app.get("/", (c) => c.text("ok"));

    const statuses: number[] = [];
    for (let i = 0; i < times; i++) {
      statuses.push((await app.request("/", {}, bindings)).status);
    }
    return statuses;
  }

  const memory = { createStore: () => new MemoryStore(), disabled: false };

  it("asks for a separate store for every limiter", () => {
    const names: string[] = [];
    createRateLimiters({
      disabled: false,
      createStore: (name) => {
        names.push(name);
        return new MemoryStore();
      },
    });

    expect(new Set(names).size).toBe(names.length);
    expect(names).toEqual(
      expect.arrayContaining(["global", "login", "register", "viennagis"])
    );
  });

  it("does not mix the counters of different limiters", async () => {
    const limiters = createRateLimiters(memory);

    // Use up the login limit (5 attempts, the 6th is refused) ...
    expect((await hit(limiters.login, 6))[5]).toBe(429);
    // ... the same client may still register.
    expect(await hit(limiters.register, 1)).toEqual([200]);
  });

  it("counts in the store it is given", async () => {
    const increment = vi.fn(async () => ({
      totalHits: 999,
      resetTime: new Date(Date.now() + 1000),
    }));
    const fakeStore: Store = {
      increment,
      decrement: async () => {},
      resetKey: async () => {},
    };

    const limiters = createRateLimiters({
      disabled: false,
      createStore: () => fakeStore,
    });

    expect(await hit(limiters.login, 1)).toEqual([429]);
    expect(increment).toHaveBeenCalled();
  });

  it("limits nothing and creates no stores when disabled", async () => {
    const createStore = vi.fn(() => new MemoryStore());
    const limiters = createRateLimiters({ disabled: true, createStore });

    expect((await hit(limiters.login, 10)).every((s) => s === 200)).toBe(true);
    expect(createStore).not.toHaveBeenCalled();
  });

  it("survives a failing store only when it is wrapped in a fallback", async () => {
    const failing = (): Store => {
      const fail = () => Promise.reject(new Error("redis down"));
      return { increment: fail, decrement: fail, resetKey: fail };
    };

    // The library does not catch store errors: the request ends in a 500.
    const bare = createRateLimiters({ disabled: false, createStore: failing });
    expect(await hit(bare.login, 1)).toEqual([500]);

    // With a fallback the route keeps working and the limit still holds.
    const wrapped = createRateLimiters({
      disabled: false,
      createStore: () => withFallback(failing(), new MemoryStore(), () => {}),
    });
    const statuses = await hit(wrapped.login, 6);
    expect(statuses.slice(0, 5)).toEqual([200, 200, 200, 200, 200]);
    expect(statuses[5]).toBe(429);
  });
});
