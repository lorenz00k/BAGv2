import { describe, it, expect, vi, beforeEach } from "vitest";

const { values, returning } = vi.hoisted(() => ({
  values: vi.fn().mockResolvedValue(undefined),
  returning: vi.fn(),
}));

vi.mock("../../../src/db/index.js", () => {
  const tx = {
    insert: () => ({ values }),
    delete: () => ({ where: () => ({ returning }) }),
  };
  return { db: { transaction: (fn: (t: typeof tx) => unknown) => fn(tx) } };
});

import { mergeAnonymousChecker } from "../../../src/utils/sessionMerge.ts";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("mergeAnonymousChecker", () => {
  it("does nothing without a session cookie", async () => {
    await mergeAnonymousChecker(undefined, "user-1");
    expect(returning).not.toHaveBeenCalled();
    expect(values).not.toHaveBeenCalled();
  });

  it("does nothing when no anonymous session exists", async () => {
    returning.mockResolvedValueOnce([]);
    await mergeAnonymousChecker("sid", "user-1");
    expect(values).not.toHaveBeenCalled();
  });

  it("saves a finished session as a completed check for the user and deletes it", async () => {
    const answers = { betriebsart: "restaurant" };
    returning.mockResolvedValueOnce([{ id: "s1", status: "finished", answers }]);

    await mergeAnonymousChecker("sid", "user-1");

    expect(values).toHaveBeenCalledWith({
      userId: "user-1",
      status: "completed",
      currentStep: "0",
      formData: answers,
    });
    expect(returning).toHaveBeenCalledTimes(1);
  });

  it("saves an unfinished session as a draft", async () => {
    returning.mockResolvedValueOnce([{ id: "s1", status: "in_progress", answers: { a: 1 } }]);
    await mergeAnonymousChecker("sid", "user-1");
    expect(values.mock.calls[0]![0].status).toBe("draft");
  });

  it.each([
    ["empty answers", {}],
    ["null answers", null],
  ])("creates no check for %s but still deletes the session", async (_label, answers) => {
    returning.mockResolvedValueOnce([{ id: "s1", status: "finished", answers }]);
    await mergeAnonymousChecker("sid", "user-1");
    expect(values).not.toHaveBeenCalled();
    expect(returning).toHaveBeenCalledTimes(1);
  });
});