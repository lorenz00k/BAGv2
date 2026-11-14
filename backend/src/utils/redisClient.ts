import { Redis } from "ioredis";
import type { RedisClient } from "hono-rate-limiter";

export function createRedis(
  url: string,
  onError: (error: Error) => void
): Redis {
  const redis = new Redis(url, {
    // Fail at once while disconnected instead of queueing commands. A queue
    // makes every request wait, and the in-memory fallback would come too late.
    enableOfflineQueue: false,
    maxRetriesPerRequest: 1,
  });
  // Without a listener ioredis prints every connection error itself.
  redis.on("error", onError);
  return redis;
}

// hono-rate-limiter expects a client shaped like @upstash/redis. ioredis wants
// the number of keys as an extra argument, hence the small adapter.
// Only increment and decrement are used by the limiter middleware.
export function toRateLimitClient(redis: Redis): RedisClient {
  return {
    scriptLoad: async (script) =>
      (await redis.script("LOAD", script)) as string,
    evalsha: async <TArgs extends unknown[], TData = unknown>(
      sha1: string,
      keys: string[],
      args: TArgs
    ) =>
      (await redis.evalsha(
        sha1,
        keys.length,
        ...keys,
        ...(args as string[])
      )) as TData,
    decr: (key) => redis.decr(key),
    del: (key) => redis.del(key),
  };
}
