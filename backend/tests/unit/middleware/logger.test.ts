import { describe, it, expect, afterEach, vi } from "vitest";
import { Hono } from "hono";
import { setCookie } from "hono/cookie";
import { pinoLogger } from "hono-pino";
import { Writable } from "node:stream";
import {
  createBaseLogger,
  REDACT_PATHS,
} from "../../../src/middleware/logger.js";
import { withNodeEnv } from "../helpers.js";

afterEach(() => {
  vi.unstubAllEnvs();
});

it("uses LOG_LEVEL from the environment", async () => {
  vi.stubEnv("LOG_LEVEL", "warn");
  const { baseLogger } = await withNodeEnv(
    "production",
    () => import("../../../src/middleware/logger.js")
  );
  expect(baseLogger.level).toBe("warn");
});

describe.each([
  { mode: "production", production: true },
  { mode: "development", production: false },
])("request logging redaction ($mode)", ({ production }) => {
  function setup() {
    const lines: string[] = [];
    const destination = new Writable({
      write(chunk, _encoding, callback) {
        lines.push(chunk.toString());
        callback();
      },
    });

    const base = createBaseLogger({ production, level: "info", destination });

    const app = new Hono();
    app.use(pinoLogger({ pino: base }));
    app.get("/", (c) => c.text("ok"));
    app.post("/login", (c) => {
      setCookie(c, "session_id", "SECRET_SET_COOKIE", { httpOnly: true });
      return c.text("ok");
    });

    return {
      app,
      base,
      lines,
      output: () => lines.join(""),
      // wartet, bis der Logger etwas geschrieben hat (Dev-Ausgabe kommt asynchron)
      settle: () => vi.waitFor(() => expect(lines.length).toBeGreaterThan(0)),
    };
  }

  it("does not log the request cookie", async () => {
    const { app, output, settle } = setup();
    await app.request("/", {
      headers: { cookie: "session_id=SECRET_REQ_COOKIE" },
    });
    await settle();

    expect(output()).not.toContain("SECRET_REQ_COOKIE");
    expect(output()).toContain("[REDACTED]");
  });

  it("does not log the authorization header", async () => {
    const { app, output, settle } = setup();
    await app.request("/", {
      headers: { authorization: "Bearer SECRET_TOKEN" },
    });
    await settle();

    expect(output()).not.toContain("SECRET_TOKEN");
    expect(output()).toContain("[REDACTED]");
  });

  it("does not leak a Set-Cookie value through the request log", async () => {
    const { app, output, settle } = setup();
    await app.request("/login", { method: "POST" });
    await settle();

    expect(output()).not.toContain("SECRET_SET_COOKIE");
  });

  it("redacts every sensitive path on any logged object", async () => {
    const { base, output, settle } = setup();
    base.info(
      {
        req: { headers: { cookie: "SECRET_A", authorization: "SECRET_B" } },
        res: { headers: { "set-cookie": "SECRET_C" } },
      },
      "direct"
    );
    await settle();

    expect(output()).not.toMatch(/SECRET_[ABC]/);
    expect(output()).toContain("[REDACTED]");
  });

  it("still logs harmless headers", async () => {
    const { app, output, settle } = setup();
    await app.request("/", { headers: { origin: "http://localhost:3001" } });
    await settle();

    expect(output()).toContain("http://localhost:3001");
  });

  it.runIf(production)("writes one valid JSON object per line", async () => {
    const { app, lines, settle } = setup();
    await app.request("/", { headers: { cookie: "session_id=x" } });
    await settle();

    for (const line of lines) {
      expect(() => JSON.parse(line)).not.toThrow();
    }
  });
});

describe("redaction config", () => {
  it("keeps all sensitive paths in the redaction list", () => {
    expect(REDACT_PATHS).toEqual(
      expect.arrayContaining([
        "req.headers.cookie",
        "req.headers.authorization",
        'res.headers["set-cookie"]',
      ])
    );
  });
});
