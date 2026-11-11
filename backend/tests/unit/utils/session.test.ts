import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import {
  createSession,
  validateSession,
  cleanupExpiredSessions,
  getUserIdFromSession,
} from "../../../src/utils/session.ts";

const { values, limit, deleteWhere, returning } = vi.hoisted(() => {
  const returning = vi.fn();
  return {
    values: vi.fn().mockResolvedValue(undefined),
    limit: vi.fn(),
    returning,
    deleteWhere: vi.fn(() => ({ returning })),
  };
});

vi.mock("../../../src/db/index.js", () => ({
  db: {
    insert: () => ({ values }),
    select: () => ({ from: () => ({ where: () => ({ limit }) }) }),
    delete: () => ({ where: deleteWhere }),
  },
}));

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("createSession", async () => {
  it("returns a cookie-safe session id of 43 characters", async () => {
    const id = await createSession("user-1");
    expect(id).toMatch(/^[A-Za-z0-9_-]{43}$/);
  });
  it("returns a different id for every session", async () => {
    expect(await createSession("user-1")).not.toBe(
      await createSession("user-1")
    );
  });

  it("stores the session for the user with a 30 day expiry", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));

    await createSession("user-1");
    const stored = values.mock.calls[0]![0]; // '!' needed for noUncheckedIndexedAccess
    expect(stored.userId).toBe("user-1");
    expect(stored.expiresAt.getTime()).toBe(
      new Date("2026-01-01T00:00:00.000Z").getTime() + THIRTY_DAYS_MS
    );
  });
});

describe("validateSession", async () => {
  it("returns null when the session does not exist", async () => {
    limit.mockResolvedValueOnce([]);
    expect(await validateSession("missing")).toBeNull();
    expect(deleteWhere).not.toHaveBeenCalled();
  });

  it("returns the session when it has not expired", async () => {
    const session = {
      id: "s1",
      userId: "u1",
      expiresAt: new Date(Date.now() + 60_000),
    };
    limit.mockResolvedValueOnce([session]);
    expect(await validateSession("s1")).toEqual(session);
    expect(deleteWhere).not.toHaveBeenCalled();
  });

  it("returns null and deletes the session when it has expired", async () => {
    const session = {
      id: "s1",
      userId: "u1",
      expiresAt: new Date(Date.now() - 60_000),
    };
    limit.mockResolvedValueOnce([session]);
    expect(await validateSession("s1")).toBeNull();
    expect(deleteWhere).toHaveBeenCalledTimes(1);
  });
});

describe("cleanupExpiredSessions", () => {
  it("returns the number of deleted sessions", async () => {
    returning.mockResolvedValueOnce([{ id: "a" }, { id: "b" }]);
    expect(await cleanupExpiredSessions()).toBe(2);
  });
});

describe("getUserIdFromSession", () => {
  it("returns the user id for a known session", async () => {
    limit.mockResolvedValueOnce([{ userId: "u1" }]);
    expect(await getUserIdFromSession("s1")).toBe("u1");
  });

  it("returns null for an unknown session", async () => {
    limit.mockResolvedValueOnce([]);
    expect(await getUserIdFromSession("nope")).toBeNull();
  });
});
