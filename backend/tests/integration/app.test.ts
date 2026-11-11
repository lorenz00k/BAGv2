import { describe, it, expect, afterEach, vi } from "vitest";
import app from "../../src/app.js";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("GET /health", () => {
  it("reports that the server is running", async () => {
    const res = await app.request("/health");
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.status).toBe("ok");
    expect(Number.isNaN(Date.parse(body.timeStamp))).toBe(false);
  });
});

describe("GET /", () => {
  it("answers with a text", async () => {
    const res = await app.request("/");
    expect(res.status).toBe(200);
    expect((await res.text()).length).toBeGreaterThan(0);
  });
});

describe("CORS", () => {
  const request = (origin?: string, path = "/health") =>
    app.request(path, { headers: origin ? { Origin: origin } : {} });

  const allowOrigin = (res: Response) =>
    res.headers.get("access-control-allow-origin");

  it.each(["https://betriebsanlage-check.at", "http://localhost:3001"])(
    "allows the origin %s together with credentials",
    async (origin) => {
      const res = await request(origin);
      expect(allowOrigin(res)).toBe(origin);
      expect(res.headers.get("access-control-allow-credentials")).toBe("true");
    }
  );

  it.each([
    "https://evil.example",
    "http://betriebsanlage-check.at",
    "https://betriebsanlage-check.at.evil.example",
  ])("does not allow the origin %s", async (origin) => {
    expect(allowOrigin(await request(origin))).toBeNull();
  });

  it("sends no CORS headers to requests without an origin", async () => {
    expect(allowOrigin(await request())).toBeNull();
  });

  it("answers the preflight request of an allowed origin", async () => {
    const res = await app.request("/api/auth/login", {
      method: "OPTIONS",
      headers: {
        Origin: "https://betriebsanlage-check.at",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "Content-Type",
      },
    });

    expect(res.status).toBe(204);
    expect(allowOrigin(res)).toBe("https://betriebsanlage-check.at");
    expect(res.headers.get("access-control-allow-methods")).toContain("POST");
    expect(res.headers.get("access-control-allow-headers")).toContain(
      "Content-Type"
    );
    expect(res.headers.get("access-control-allow-credentials")).toBe("true");
    expect(res.headers.get("access-control-max-age")).toBe("86400");
  });

  it("does not grant the preflight request of a foreign origin", async () => {
    const res = await app.request("/api/auth/login", {
      method: "OPTIONS",
      headers: {
        Origin: "https://evil.example",
        "Access-Control-Request-Method": "POST",
      },
    });

    expect(allowOrigin(res)).toBeNull();
  });

  describe("in development", () => {
    it("allows any localhost port", async () => {
      vi.stubEnv("NODE_ENV", "development");
      expect(allowOrigin(await request("http://localhost:4000"))).toBe(
        "http://localhost:4000"
      );
    });

    it("does not allow an unknown localhost port outside development", async () => {
      expect(allowOrigin(await request("http://localhost:4000"))).toBeNull();
    });

    it.todo(
      "does not allow lookalike origins such as http://localhost.evil.com"
    );
  });
});
