import { randomUUID } from "node:crypto";
import { describe, it, expect, vi, afterAll } from "vitest";
import type { Redis } from "ioredis";
import { MemoryStore, RedisStore } from "hono-rate-limiter";
import { createRedis, toRateLimitClient } from "../../src/utils/redisClient.js";
import { withFallback } from "../../src/utils/rateLimitStore.js";
import { TEST_REDIS_URL } from "./testRedis.js";

// RedisStore only reads windowMs from the options
const options = { windowMs: 60_000 } as never;
const connections: Redis[] = [];

// Waits until the connection is ready: the store loads its scripts when it is
// created, and that fails while the client is still connecting.
async function connect(url = TEST_REDIS_URL): Promise<Redis> {
  const redis = createRedis(url, () => {});
  connections.push(redis);
  if (redis.status !== "ready") {
    await new Promise<void>((resolve) => redis.once("ready", () => resolve()));
  }
  return redis;
}

function storeOn(redis: Redis, prefix = `rl:test:${randomUUID()}:`) {
  const store = new RedisStore({ client: toRateLimitClient(redis), prefix });
  store.init(options);
  return store;
}

afterAll(() => {
  connections.forEach((redis) => redis.disconnect());
});

describe("RedisStore through the ioredis adapter", () => {
  it("counts hits per key and sets an expiry", async () => {
    const redis = await connect();
    const store = storeOn(redis);

    expect((await store.increment("a")).totalHits).toBe(1);
    expect((await store.increment("a")).totalHits).toBe(2);
    expect((await store.increment("b")).totalHits).toBe(1);

    const ttl = await redis.pttl(`${store.prefix}a`);
    expect(ttl).toBeGreaterThan(0);
    expect(ttl).toBeLessThanOrEqual(60_000);
  });

  it("counts atomically under parallel requests", async () => {
    const store = storeOn(await connect());

    const results = await Promise.all(
      Array.from({ length: 50 }, () => store.increment("a"))
    );

    expect(new Set(results.map((r) => r.totalHits)).size).toBe(50);
  });

  it("shares one counter between two server instances", async () => {
    const prefix = `rl:test:${randomUUID()}:`;
    const instanceA = storeOn(await connect(), prefix);
    const instanceB = storeOn(await connect(), prefix);

    await instanceA.increment("client");
    expect((await instanceB.increment("client")).totalHits).toBe(2);
  });

  it("fails at once when Redis is unreachable, so the fallback takes over", async () => {
    const broken = createRedis("redis://127.0.0.1:1", () => {});
    connections.push(broken);

    // Without enableOfflineQueue: false the client would queue the command
    // and fail only after a few hundred milliseconds, on every request.
    const started = Date.now();
    await expect(storeOn(broken).increment("a")).rejects.toThrow();
    expect(Date.now() - started).toBeLessThan(150);

    const onFailure = vi.fn();
    const guarded = withFallback(storeOn(broken), new MemoryStore(), onFailure);
    guarded.init?.(options);

    expect((await guarded.increment("a")).totalHits).toBe(1);
    expect(onFailure).toHaveBeenCalled();
  });
});
