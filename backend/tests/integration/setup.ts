import { beforeEach, vi } from "vitest";
import { resetDatabase } from "./helpers.js";

vi.mock("../../src/utils/email.js", () => ({
  sendVerificationEmail: vi.fn().mockResolvedValue(undefined),
  sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
}));

// Replace every exported limiter with a pass-through middleware
vi.mock("../../src/middleware/rate-limit.js", async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  const passThrough = async (_c: unknown, next: () => Promise<void>) => next();
  return Object.fromEntries(Object.keys(actual).map((key) => [key, passThrough]));
});

beforeEach(async () => {
  vi.clearAllMocks();
  await resetDatabase();
});