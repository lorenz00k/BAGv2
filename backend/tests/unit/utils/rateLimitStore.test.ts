import { describe, it, expect, vi } from "vitest";
import { MemoryStore, type Store } from "hono-rate-limiter";
import { withFallback, createStoreFactory } from "../../../src/utils/rateLimitStore.js";

// MemoryStore only reads windowMs from the options
const options = { windowMs: 60_000 } as never;

// A store whose every call fails, like a Redis that is down
function failingStore(): Store {
  const fail = () => Promise.reject(new Error("redis down"));
  return {
    increment: vi.fn(fail),
    decrement: vi.fn(fail),
    resetKey: vi.fn(fail),
  };
}

describe("withFallback", () => {
  it("uses the primary store while it works", async () => {
    const primary = new MemoryStore();
    const fallback = new MemoryStore();
    const onFailure = vi.fn();
    const store = withFallback(primary, fallback, onFailure);
    store.init?.(options);

    expect((await store.increment("a")).totalHits).toBe(1);
    expect(primary.get("a")?.totalHits).toBe(1);
    expect(fallback.get("a")).toBeUndefined();
    expect(onFailure).not.toHaveBeenCalled();
  });

  it("keeps counting in the fallback when the primary fails, and reports it", async () => {
    const onFailure = vi.fn();
    const store = withFallback(failingStore(), new MemoryStore(), onFailure);
    store.init?.(options);

    expect((await store.increment("a")).totalHits).toBe(1);
    expect((await store.increment("a")).totalHits).toBe(2);
    expect(onFailure).toHaveBeenCalledTimes(2);
    expect(onFailure).toHaveBeenCalledWith(expect.any(Error), "increment");
  });

  it("does not throw when the primary fails to initialise", () => {
    const primary: Store = {
      ...failingStore(),
      init: () => {
        throw new Error("cannot connect");
      },
    };
    const onFailure = vi.fn();

    expect(() =>
      withFallback(primary, new MemoryStore(), onFailure).init?.(options)
    ).not.toThrow();
    expect(onFailure).toHaveBeenCalledWith(expect.any(Error), "init");
  });
});

describe("createStoreFactory", () => {
  it("counts in memory without a Redis URL, separately per limiter", async () => {
    const onFailure = vi.fn();
    const { createStore, close } = createStoreFactory(undefined, onFailure);
    const login = createStore("login");
    const register = createStore("register");
    login.init?.(options);
    register.init?.(options);

    expect((await login.increment("a")).totalHits).toBe(1);
    expect((await login.increment("a")).totalHits).toBe(2);
    expect((await register.increment("a")).totalHits).toBe(1);
    expect(onFailure).not.toHaveBeenCalled();
    await close();
  });
});
