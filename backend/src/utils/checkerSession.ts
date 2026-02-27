import crypto from "node:crypto";
import type { Context } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";

export const CHECKER_COOKIE_NAME = "sid";
export const CHECKER_TTL_SECONDS = 60 * 60 * 24; // 24h

export function createSid(): string {
  // base64url is cookie-safe
  return crypto.randomBytes(32).toString("base64url");
}

export function hashSid(sid: string): string {
  return crypto.createHash("sha256").update(sid).digest("hex");
}

export function readSid(c: Context): string | undefined {
  return getCookie(c, CHECKER_COOKIE_NAME);
}

export function setSidCookie(c: Context, sid: string) {
  setCookie(c, CHECKER_COOKIE_NAME, sid, {
    httpOnly: true,
    sameSite: "Lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: CHECKER_TTL_SECONDS,
  });
}

export function clearSidCookie(c: Context) {
  deleteCookie(c, CHECKER_COOKIE_NAME, { path: "/" });
}

export function computeExpiresAt(now = new Date()): Date {
  return new Date(now.getTime() + CHECKER_TTL_SECONDS * 1000);
}