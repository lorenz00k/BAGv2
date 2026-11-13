import { describe, it, expect, afterEach, vi } from "vitest";
import { Hono } from "hono";
import { setSessionCookie, clearSessionCookie } from "../../../src/utils/cookies.js";

const app = new Hono();
app.get("/set", (c) => { setSessionCookie(c, "abc"); return c.text("ok"); });
app.get("/clear", (c) => { clearSessionCookie(c); return c.text("ok"); });

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

  it("marks the cookie Secure only in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(await setCookieHeader("/set")).toContain("Secure");

    vi.stubEnv("NODE_ENV", "development");
    expect(await setCookieHeader("/set")).not.toContain("Secure");
  });
});

describe("clearSessionCookie", () => {
  it("expires the cookie on the same path", async () => {
    const cookie = await setCookieHeader("/clear");

    expect(cookie).toContain("session_id=;");
    expect(cookie).toContain("Path=/");
  });
});