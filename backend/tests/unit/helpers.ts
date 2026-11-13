import {vi} from "vitest"

// Loads a module as if the process had started with this NODE_ENV.
// The caller passes the import so the path and the types stay in the test.
export async function withNodeEnv<T>(
  nodeEnv: "production" | "development" | "test",
  load: () => Promise<T>,
): Promise<T> {
  vi.resetModules();
  vi.stubEnv("NODE_ENV", nodeEnv);
  return load();
}