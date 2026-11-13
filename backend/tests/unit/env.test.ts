import { describe, it, expect, afterEach, vi } from "vitest";

afterEach(() => vi.unstubAllEnvs());

describe("env", () => {
  it("exposes the parsed variables", async () => {
    vi.resetModules();
    const { env } = await import("../../src/env.js");

    expect(env.PORT).toBe(3000);
    expect(env.FRONTEND_URL).toBe("http://localhost:3001");
  });

  it("refuses to load when a variable is invalid", async () => {
    vi.resetModules();
    vi.stubEnv("PORT", "abc");

    await expect(import("../../src/env.js")).rejects.toThrow(/PORT/);
  });

  it("is used by consumers: email refuses to load with an invalid FRONTEND_URL", async () => {
    vi.resetModules();
    vi.stubEnv("FRONTEND_URL", "nope");

    await expect(import("../../src/utils/email.js")).rejects.toThrow(
      /FRONTEND_URL/
    );
  });
});
