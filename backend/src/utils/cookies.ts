import type { Context } from "hono";
import { setCookie, deleteCookie } from "hono/cookie";
import { SESSION_TTL_SECONDS } from "./session.js";

export const SESSION_COOKIE_NAME = "session_id";

// The attributes every cookie of this app shares. Read at call time, not at import.
export function baseCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "Lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };
}

export function setSessionCookie(c: Context, sessionId: string) {
  setCookie(c, SESSION_COOKIE_NAME, sessionId, {
    ...baseCookieOptions(),
    maxAge: SESSION_TTL_SECONDS,
  });
}

export function clearSessionCookie(c: Context) {
  deleteCookie(c, SESSION_COOKIE_NAME, { path: "/" });
}