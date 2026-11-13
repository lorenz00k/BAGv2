import { defineConfig } from "vitest/config";
import { testEnv } from "./tests/testEnv";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
    silent: "passed-only",
    env: testEnv,
  },
});
