import type { Store } from "hono-rate-limiter";

type FailureHandler = (error: unknown, operation: string) => void;

// Uses `primary` (for example Redis) and switches to `fallback` (memory) for
// any call where the primary fails, so a broken shared store does not take
// every route down with it. While the primary is down, each server instance
// counts on its own, so limits are looser but still enforced.
export function withFallback(
  primary: Store,
  fallback: Store,
  onFailure: FailureHandler
): Store {
  async function run<T>(
    operation: string,
    use: (store: Store) => T | Promise<T>
  ): Promise<T> {
    try {
      return await use(primary);
    } catch (error) {
      onFailure(error, operation);
      return await use(fallback);
    }
  }

  return {
    init: (options) => {
      try {
        primary.init?.(options);
      } catch (error) {
        onFailure(error, "init");
      }
      fallback.init?.(options);
    },
    get: (key) => run("get", (store) => store.get?.(key)),
    increment: (key) => run("increment", (store) => store.increment(key)),
    decrement: (key) => run("decrement", (store) => store.decrement(key)),
    resetKey: (key) => run("resetKey", (store) => store.resetKey(key)),
  };
}
