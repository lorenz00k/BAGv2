import { defineConfig } from "vitest/config";
import { TEST_DATABASE_URL } from "./tests/integration/testDb.ts";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/integration/**/*.test.ts"],
    globalSetup: ["tests/integration/globalSetup.ts"],
    setupFiles: ["tests/integration/setup.ts"],
    fileParallelism: false,   // alle Testdateien teilen sich eine Datenbank
    env: {
      NODE_ENV: "test",
      DATABASE_URL: TEST_DATABASE_URL,
      FRONTEND_URL: "http://localhost:3001",
      RESEND_API_KEY: "re_test",
      RESEND_FROM_EMAIL: "noreply@example.com",
    },
  },
});