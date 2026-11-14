import { describe, it, expect } from "vitest";
import { resolveClientIp } from "../../../src/utils/clientIp.js";

const socket = "198.51.100.7";

describe("resolveClientIp", () => {
  it("uses the connection address and ignores the header without trusted proxies", () => {
    expect(
      resolveClientIp({
        forwardedFor: "6.6.6.6",
        remoteAddress: socket,
        trustedProxyCount: 0,
      })
    ).toBe(socket);
  });

  it("takes the last entry behind one proxy and ignores forged ones to its left", () => {
    expect(
      resolveClientIp({
        forwardedFor: "6.6.6.6, 203.0.113.9",
        remoteAddress: "10.0.0.1",
        trustedProxyCount: 1,
      })
    ).toBe("203.0.113.9");
  });

  it("counts from the right behind two proxies", () => {
    expect(
      resolveClientIp({
        forwardedFor: "6.6.6.6, 203.0.113.9, 35.1.2.3",
        remoteAddress: "10.0.0.1",
        trustedProxyCount: 2,
      })
    ).toBe("203.0.113.9");
  });

  it("falls back to the connection when the header has fewer entries than proxies", () => {
    // The request did not pass through all proxies, so the header is not trustworthy.
    expect(
      resolveClientIp({
        forwardedFor: "203.0.113.9",
        remoteAddress: socket,
        trustedProxyCount: 2,
      })
    ).toBe(socket);
  });

  it("falls back to the connection when a proxy is expected but there is no header", () => {
    expect(
      resolveClientIp({
        forwardedFor: undefined,
        remoteAddress: socket,
        trustedProxyCount: 1,
      })
    ).toBe(socket);
  });

  it("trims whitespace and skips empty entries", () => {
    expect(
      resolveClientIp({
        forwardedFor: " 6.6.6.6 , 203.0.113.9 ,",
        remoteAddress: "10.0.0.1",
        trustedProxyCount: 1,
      })
    ).toBe("203.0.113.9");
  });

  it("writes an IPv4-mapped IPv6 address as plain IPv4", () => {
    expect(
      resolveClientIp({
        forwardedFor: undefined,
        remoteAddress: "::ffff:198.51.100.7",
        trustedProxyCount: 0,
      })
    ).toBe("198.51.100.7");
  });

  it("returns undefined when there is nothing to go on", () => {
    expect(
      resolveClientIp({
        forwardedFor: undefined,
        remoteAddress: undefined,
        trustedProxyCount: 0,
      })
    ).toBeUndefined();
  });
});
