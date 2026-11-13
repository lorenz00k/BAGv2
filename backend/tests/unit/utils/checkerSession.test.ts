import { describe, it, expect, vi, afterEach } from "vitest";
import { Hono } from "hono";
import { withNodeEnv } from "./helpers.js";
const { returning } = vi.hoisted(() => ({ returning: vi.fn() }));

vi.mock("../../../src/db/index.js", () => ({
  db: { delete: () => ({ where: () => ({ returning }) }) },
}));

import {
  createSid,
  hashSid,
  computeExpiresAt,
  setSidCookie,
  clearSidCookie,
  readSid,
  cleanupExpiredCheckerSessions,
  CHECKER_TTL_SECONDS,
} from "../../../src/utils/checkerSession.js";

afterEach(() => {
  vi.unstubAllEnvs();
});

async function setCookieHeaderIn(nodeEnv: "production" | "development") {
  const { setSidCookie } = await withNodeEnv(
    nodeEnv,
    () => import("../../../src/utils/checkerSession.js")
  );
  const modeApp = new Hono();
  modeApp.get("/set", (c) => {
    setSidCookie(c, "my-sid");
    return c.text("ok");
  });
  return (await modeApp.request("/set")).headers.get("set-cookie") ?? "";
}

describe("createSid", () => {
  it("returns a cookie-safe base64url string of 43 characters", () => {
    expect(createSid()).toMatch(/^[A-Za-z0-9_-]{43}$/);
  });

  it("returns a different value each time", () => {
    expect(createSid()).not.toBe(createSid());
  });
});

describe("hashSid", () => {
  it("is deterministic and returns 64 hex characters", () => {
    expect(hashSid("abc")).toBe(hashSid("abc"));
    expect(hashSid("abc")).toMatch(/^[0-9a-f]{64}$/);
  });

  it("differs for different inputs and never contains the raw sid", () => {
    expect(hashSid("abc")).not.toBe(hashSid("abd"));
    expect(hashSid("abc")).not.toContain("abc");
  });
});

describe("computeExpiresAt", () => {
  it("adds exactly the TTL to the given time", () => {
    const now = new Date("2026-01-01T00:00:00.000Z");
    expect(computeExpiresAt(now).toISOString()).toBe(
      "2026-01-02T00:00:00.000Z"
    );
    expect(computeExpiresAt(now).getTime() - now.getTime()).toBe(
      CHECKER_TTL_SECONDS * 1000
    );
  });
});

describe("cookie helpers", () => {
  const app = new Hono();
  app.get("/set", (c) => {
    setSidCookie(c, "my-sid");
    return c.text("ok");
  });
  app.get("/clear", (c) => {
    clearSidCookie(c);
    return c.text("ok");
  });
  app.get("/read", (c) => c.text(readSid(c) ?? "none"));

  it("sets an HttpOnly, SameSite=Lax cookie that lasts 24 hours", async () => {
    const res = await app.request("/set");
    const cookie = res.headers.get("set-cookie") ?? "";
    expect(cookie).toContain("sid=my-sid");
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=Lax");
    expect(cookie).toContain("Path=/");
    expect(cookie).toContain(`Max-Age=${CHECKER_TTL_SECONDS}`);
  });

  it("marks the cookie Secure in production", async () => {
    expect(await setCookieHeaderIn("production")).toContain("Secure");
  });

  it("does not mark the cookie Secure in development", async () => {
    expect(await setCookieHeaderIn("development")).not.toContain("Secure");
  });

  it("clears the cookie", async () => {
    const cookie =
      (await app.request("/clear")).headers.get("set-cookie") ?? "";
    expect(cookie).toContain("sid=;");
  });

  it("reads the sid from the request cookie", async () => {
    const res = await app.request("/read", {
      headers: { Cookie: "sid=abc123" },
    });
    expect(await res.text()).toBe("abc123");
  });
});

describe("cleanupExpiredCheckerSessions", () => {
  it("returns the number of deleted sessions", async () => {
    returning.mockResolvedValueOnce([{ id: 1 }, { id: 2 }, { id: 3 }]);
    expect(await cleanupExpiredCheckerSessions()).toBe(3);
  });
});
