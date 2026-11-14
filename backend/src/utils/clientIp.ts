import type { Context } from "hono";
import { getConnInfo } from "@hono/node-server/conninfo";

type ClientIpInput = {
  forwardedFor: string | undefined; // raw X-Forwarded-For header
  remoteAddress: string | undefined; // address of the TCP connection
  trustedProxyCount: number; // reverse proxies that append to the header
};

// Node writes an IPv4 address on a dual-stack socket as "::ffff:1.2.3.4"
function normalize(address: string): string {
  const trimmed = address.trim();
  return trimmed.startsWith("::ffff:") ? trimmed.slice(7) : trimmed;
}

export function resolveClientIp({
  forwardedFor,
  remoteAddress,
  trustedProxyCount,
}: ClientIpInput): string | undefined {
  const direct = remoteAddress ? normalize(remoteAddress) : undefined;
  if (trustedProxyCount === 0 || !forwardedFor) return direct;

  const entries = forwardedFor.split(",").map(normalize).filter(Boolean);

  // Fewer entries than trusted proxies: the request did not pass through all
  // of them (for example it hit the server directly), so do not trust it.
  if (entries.length < trustedProxyCount) return direct;

  // Each trusted proxy appended one entry on the right. Everything further
  // left was written by the client or by proxies we cannot vouch for.
  return entries[entries.length - trustedProxyCount];
}

function remoteAddressOf(c: Context): string | undefined {
  try {
    return getConnInfo(c).remote.address;
  } catch {
    return undefined; // no socket, e.g. for in-process requests in tests
  }
}

export function createClientKeyGenerator(trustedProxyCount: number) {
  return (c: Context): string =>
    resolveClientIp({
      forwardedFor: c.req.header("x-forwarded-for"),
      remoteAddress: remoteAddressOf(c),
      trustedProxyCount,
    }) ?? "unknown";
}
