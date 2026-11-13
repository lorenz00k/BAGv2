import { describe, it, expect } from "vitest";
import { parseEnv } from "../../src/env-schema.js";

const valid = {
  PORT: "3000",
  DATABASE_URL: "postgresql://user:pw@localhost:5433/db",
  FRONTEND_URL: "http://localhost:3001",
  RESEND_API_KEY: "re_test",
};

describe("parseEnv", () => {
  it("accepts a minimal environment, converts the port and applies defaults", () => {
    const env = parseEnv(valid);

    expect(env.PORT).toBe(3000);
    expect(env.NODE_ENV).toBe("development");
    expect(env.LOG_LEVEL).toBe("info");
    expect(env.RESEND_FROM_EMAIL).toBe("onboarding@resend.dev");
  });

  it.each(["PORT", "DATABASE_URL", "FRONTEND_URL", "RESEND_API_KEY"])(
    "rejects a missing %s and names it",
    (name) => {
      const { [name]: _removed, ...rest } = valid as Record<string, string>;
      expect(() => parseEnv(rest)).toThrow(new RegExp(name));
    }
  );

  it.each([
    ["a non-numeric port", { PORT: "abc" }],
    ["port 0", { PORT: "0" }],
    ["a port above 65535", { PORT: "70000" }],
    ["a database url with another scheme", { DATABASE_URL: "mysql://x" }],
    ["a frontend url with a trailing slash", { FRONTEND_URL: "http://localhost:3001/" }],
    ["an unknown NODE_ENV", { NODE_ENV: "staging" }],
  ])("rejects %s", (_label, override) => {
    expect(() => parseEnv({ ...valid, ...override })).toThrow("Invalid environment");
  });

  it("reports every problem at once", () => {
    expect(() => parseEnv({ ...valid, PORT: "abc", RESEND_API_KEY: "" })).toThrow(
      /PORT[\s\S]*RESEND_API_KEY/
    );
  });
});