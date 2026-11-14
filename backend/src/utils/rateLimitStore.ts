import { MemoryStore, RedisStore, type Store } from "hono-rate-limiter";
import type { Redis } from "ioredis";
import { createRedis, toRateLimitClient } from "./redisClient.js";

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

// Builds the store for each limiter: Redis with an in-memory fallback when a
// URL is configured, plain memory otherwise. The Redis connection is created
// on first use and shared by all limiters, so nothing connects while the
// limiters are switched off (development).
export function createStoreFactory(
  redisUrl: string | undefined,
  onFailure: FailureHandler
) {
  let redis: Redis | undefined;

  return {
    createStore(name: string): Store {
      if (!redisUrl) return new MemoryStore();

      redis ??= createRedis(redisUrl, (error) =>
        onFailure(error, "connection")
      );
      return withFallback(
        new RedisStore({
          client: toRateLimitClient(redis),
          prefix: `rl:${name}:`,
        }),
        new MemoryStore(),
        onFailure
      );
    },
    async close(): Promise<void> {
      await redis?.quit().catch(() => redis?.disconnect());
    },
  };
}
