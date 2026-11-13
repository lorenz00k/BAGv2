import { describe, it, expect } from "vitest";
import { Hono } from "hono";
import { createCorsMiddleware } from "../../../src/middleware/cors.js";

type Options = Parameters<typeof createCorsMiddleware>[0];

async function allowedOrigin(options: Options, origin?: string) {
  const app = new Hono();
  app.use(createCorsMiddleware(options));
  app.get("/", (c) => c.text("ok"));

  const res = await app.request("/", { headers: origin ? { Origin: origin } : {} });
  return res.headers.get("access-control-allow-origin");
}

const production: Options = { frontendUrl: "https://app.example.com", allowAnyLocalhost: false };
const development: Options = { ...production, allowAnyLocalhost: true };

describe("createCorsMiddleware", () => {
  it("allows the configured frontend", async () => {
    expect(await allowedOrigin(production, "https://app.example.com")).toBe(
      "https://app.example.com",
    );
  });

  it("compares against the origin of the configured URL, not its path", async () => {
    const options = { ...production, frontendUrl: "https://app.example.com/app" };
    expect(await allowedOrigin(options, "https://app.example.com")).toBe(
      "https://app.example.com",
    );
  });

  it.each([
    "https://evil.example",
    "http://app.example.com",
    "https://app.example.com.evil.example",
  ])("does not allow %s", async (origin) => {
    expect(await allowedOrigin(production, origin)).toBeNull();
  });

  it("sends no CORS headers to requests without an origin", async () => {
    expect(await allowedOrigin(production)).toBeNull();
  });

  it("does not allow localhost when the mode is not development", async () => {
    expect(await allowedOrigin(production, "http://localhost:4000")).toBeNull();
  });

  describe("in development", () => {
    it("allows any localhost port", async () => {
      expect(await allowedOrigin(development, "http://localhost:4000")).toBe(
        "http://localhost:4000",
      );
    });

    it.each([
      "http://localhost.evil.com",
      "http://localhostevil.com",
      "http://localhost@evil.com",
    ])("does not allow the lookalike origin %s", async (origin) => {
      expect(await allowedOrigin(development, origin)).toBeNull();
    });
  });
});