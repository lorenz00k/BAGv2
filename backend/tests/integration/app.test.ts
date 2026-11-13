import { describe, it, expect } from "vitest";
import app from "../../src/app.js";
import { testEnv } from "../testEnv.js";

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

  it("allows the configured frontend together with credentials", async () => {
    const res = await request(testEnv.FRONTEND_URL);
    expect(allowOrigin(res)).toBe(testEnv.FRONTEND_URL);
    expect(res.headers.get("access-control-allow-credentials")).toBe("true");
  });

  it("does not allow a foreign origin", async () => {
    expect(allowOrigin(await request("https://evil.example"))).toBeNull();
  });

  it("does not allow an unknown localhost port outside development", async () => {
    expect(allowOrigin(await request("http://localhost:4000"))).toBeNull();
  });

  it("sends no CORS headers to requests without an origin", async () => {
    expect(allowOrigin(await request())).toBeNull();
  });

  it("answers the preflight request of the configured frontend", async () => {
    const res = await app.request("/api/auth/login", {
      method: "OPTIONS",
      headers: {
        Origin: testEnv.FRONTEND_URL,
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "Content-Type",
      },
    });

    expect(res.status).toBe(204);
    expect(allowOrigin(res)).toBe(testEnv.FRONTEND_URL);
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
});
