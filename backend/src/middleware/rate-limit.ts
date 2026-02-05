import { rateLimiter } from "hono-rate-limiter";

// Global: 100 Requests pro Minute pro IP
export const globalRateLimiter = rateLimiter({
  windowMs: 60 * 1000, // 1 Minute
  limit: 100,
  standardHeaders: "draft-6",
  keyGenerator: (c) => c.req.header("x-forwarded-for") || "unknown",
});

// Login: 5 Versuche pro 15 Minuten
export const loginRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 Minuten
  limit: 5,
  standardHeaders: "draft-6",
  keyGenerator: (c) => c.req.header("x-forwarded-for") || "unknown",
  message: "Too many login attempts, please try again later",
});

// Register: 3 Versuche pro Stunde
export const registerRateLimiter = rateLimiter({
  windowMs: 60 * 60 * 1000, // 1 Stunde
  limit: 3,
  standardHeaders: "draft-6",
  keyGenerator: (c) => c.req.header("x-forwarded-for") || "unknown",
  message: "Too many registration attempts, please try again later",
});