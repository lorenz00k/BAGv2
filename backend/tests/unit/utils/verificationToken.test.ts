import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const { values, limit, deleteWhere } = vi.hoisted(() => ({
  values: vi.fn().mockResolvedValue(undefined),
  limit: vi.fn(),
  deleteWhere: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../../src/db/index.js", () => ({
  db: {
    insert: () => ({ values }),
    select: () => ({ from: () => ({ where: () => ({ limit }) }) }),
    delete: () => ({ where: deleteWhere }),
  },
}));

import {
  generateToken,
  hashToken,
  createVerificationToken,
  verifyToken,
} from "../../../src/utils/verificationToken.js";

const HOUR_MS = 60 * 60 * 1000;

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("generateToken", () => {
  it("returns a url-safe token of 43 characters", () => {
    expect(generateToken()).toMatch(/^[A-Za-z0-9_-]{43}$/);
  });

  it("returns a different token each time", () => {
    expect(generateToken()).not.toBe(generateToken());
  });
});

describe("hashToken", () => {
  it("is deterministic and returns 64 hex characters", () => {
    expect(hashToken("abc")).toBe(hashToken("abc"));
    expect(hashToken("abc")).toMatch(/^[0-9a-f]{64}$/);
  });

  it("differs for different tokens and hides the original", () => {
    expect(hashToken("abc")).not.toBe(hashToken("abd"));
    expect(hashToken("abc")).not.toContain("abc");
  });
});

describe("createVerificationToken", () => {
  it("returns the plain token but stores only its hash", async () => {
    const token = await createVerificationToken("user-1", "email_verification");

    const stored = values.mock.calls[0]![0];
    expect(stored.userId).toBe("user-1");
    expect(stored.type).toBe("email_verification");
    expect(stored.tokenHash).toBe(hashToken(token));
    expect(Object.values(stored)).not.toContain(token);
  });

  it.each([
    ["email_verification", 24 * HOUR_MS],
    ["password_reset", 1 * HOUR_MS],
  ] as const)("sets the expiry for %s", async (type, ttl) => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));

    await createVerificationToken("user-1", type);

    const stored = values.mock.calls[0]![0];
    expect(stored.expiresAt.getTime()).toBe(new Date("2026-01-01T00:00:00.000Z").getTime() + ttl);
  });
});

describe("verifyToken", () => {
  it("returns null and deletes nothing when no valid record exists", async () => {
    limit.mockResolvedValueOnce([]);
    expect(await verifyToken("unknown", "password_reset")).toBeNull();
    expect(deleteWhere).not.toHaveBeenCalled();
  });

  it("returns the record and deletes it so the token works only once", async () => {
    const record = { id: "rec-1", userId: "user-1", type: "password_reset" };
    limit.mockResolvedValueOnce([record]);

    expect(await verifyToken("some-token", "password_reset")).toEqual(record);
    expect(deleteWhere).toHaveBeenCalledTimes(1);
  });
});