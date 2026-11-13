import { defineConfig } from "vitest/config";
import { TEST_DATABASE_URL } from "./tests/integration/testDb.ts";
import { testEnv } from "./tests/testEnv";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/integration/**/*.test.ts"],
    globalSetup: ["tests/integration/globalSetup.ts"],
    setupFiles: ["tests/integration/setup.ts"],
    fileParallelism: false, // alle Testdateien teilen sich eine Datenbank
    env: {
      ...testEnv,
    },
  },
});
