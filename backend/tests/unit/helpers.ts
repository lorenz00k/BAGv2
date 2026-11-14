import { vi } from "vitest";

// Loads a module as if the process had started with this NODE_ENV.
// The caller passes the import so the path and the types stay in the test.
export async function withNodeEnv<T>(
  nodeEnv: "production" | "development" | "test",
  load: () => Promise<T>
): Promise<T> {
  vi.resetModules();
  vi.stubEnv("NODE_ENV", nodeEnv);
  // A production environment must have REDIS_URL (see env-schema). Nothing
  // listens on this address, which is fine for tests that only load modules.
  if (nodeEnv === "production") {
    vi.stubEnv("REDIS_URL", "redis://127.0.0.1:1");
  }
  return load();
}
