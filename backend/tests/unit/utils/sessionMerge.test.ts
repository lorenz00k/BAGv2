import { describe, it, expect, vi, beforeEach } from "vitest";

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

import { mergeAnonymousChecker } from "../../../src/utils/sessionMerge.ts";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("mergeAnonymousChecker", () => {
  it("does nothing without a session cookie", async () => {
    await mergeAnonymousChecker(undefined, "user-1");
    expect(limit).not.toHaveBeenCalled();
    expect(values).not.toHaveBeenCalled();
    expect(deleteWhere).not.toHaveBeenCalled();
  });

  it("does nothing when no anonymous session exists", async () => {
    limit.mockResolvedValueOnce([]);
    await mergeAnonymousChecker("sid", "user-1");
    expect(values).not.toHaveBeenCalled();
    expect(deleteWhere).not.toHaveBeenCalled();
  });

  it("saves a finished session as a completed check for the user and deletes it", async () => {
    const answers = { betriebsart: "restaurant" };
    limit.mockResolvedValueOnce([{ id: "s1", status: "finished", answers }]);

    await mergeAnonymousChecker("sid", "user-1");

    expect(values).toHaveBeenCalledWith({
      userId: "user-1",
      status: "completed",
      currentStep: "0",
      formData: answers,
    });
    expect(deleteWhere).toHaveBeenCalledTimes(1);
  });

  it("saves an unfinished session as a draft", async () => {
    limit.mockResolvedValueOnce([{ id: "s1", status: "in_progress", answers: { a: 1 } }]);
    await mergeAnonymousChecker("sid", "user-1");
    expect(values.mock.calls[0]![0].status).toBe("draft");
  });

  it.each([
    ["empty answers", {}],
    ["null answers", null],
  ])("creates no check for %s but still deletes the session", async (_label, answers) => {
    limit.mockResolvedValueOnce([{ id: "s1", status: "finished", answers }]);
    await mergeAnonymousChecker("sid", "user-1");
    expect(values).not.toHaveBeenCalled();
    expect(deleteWhere).toHaveBeenCalledTimes(1);
  });
});