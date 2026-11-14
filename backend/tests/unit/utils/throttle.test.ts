import { describe, it, expect, vi } from "vitest";
import { throttle } from "../../../src/utils/throttle.js";

describe("throttle", () => {
  it("passes the first call and drops calls within the interval", () => {
    let now = 0;
    const fn = vi.fn();
    const throttled = throttle(fn, 1000, () => now);

    throttled("a");
    now = 999;
    throttled("b");

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("a");
  });

  it("passes a call again once the interval has passed", () => {
    let now = 0;
    const fn = vi.fn();
    const throttled = throttle(fn, 1000, () => now);

    throttled("a");
    now = 1000;
    throttled("b");

    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith("b");
  });
});
