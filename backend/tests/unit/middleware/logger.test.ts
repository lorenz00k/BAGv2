import { it, expect, afterEach, vi } from "vitest";
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
