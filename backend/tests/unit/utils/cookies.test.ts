import { describe, it, expect, afterEach, vi } from "vitest";
import { Hono } from "hono";
import { withNodeEnv } from "../helpers.js";
import {
  setSessionCookie,
  clearSessionCookie,
} from "../../../src/utils/cookies.js";

const app = new Hono();
app.get("/set", (c) => {
  setSessionCookie(c, "abc");
  return c.text("ok");
});
app.get("/clear", (c) => {
  clearSessionCookie(c);
  return c.text("ok");
});

const setCookieHeader = async (path: string) =>
  (await app.request(path)).headers.get("set-cookie")!;

afterEach(() => vi.unstubAllEnvs());

describe("setSessionCookie", () => {
  it("sets an HttpOnly, SameSite=Lax cookie for the whole site that lasts 30 days", async () => {
    const cookie = await setCookieHeader("/set");

    expect(cookie).toContain("session_id=abc");
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=Lax");
    expect(cookie).toContain("Path=/");
    expect(cookie).toContain(`Max-Age=${30 * 24 * 60 * 60}`);
  });

  it("sets Secure in production", async () => {
    const { baseCookieOptions } = await withNodeEnv(
      "production",
      () => import("../../../src/utils/cookies.js")
    );
    expect(baseCookieOptions().secure).toBe(true);
  });

  it("does not set Secure in development", async () => {
    const { baseCookieOptions } = await withNodeEnv(
      "development",
      () => import("../../../src/utils/cookies.js")
    );
    expect(baseCookieOptions().secure).toBe(false);
  });
});

describe("clearSessionCookie", () => {
  it("expires the cookie on the same path", async () => {
    const cookie = await setCookieHeader("/clear");

    expect(cookie).toContain("session_id=;");
    expect(cookie).toContain("Path=/");
  });
});
