import { rateLimiter } from "hono-rate-limiter";
import type { MiddlewareHandler } from "hono";

const isDev = process.env.NODE_ENV === "development";
const noLimit: MiddlewareHandler = (_, next) => next();

const keyGenerator = (c: any) =>
  c.req.header("x-forwarded-for")?.split(",")[0] ?? c.req.header("x-real-ip") ?? "unknown";

export const globalRateLimiter = isDev ? noLimit : rateLimiter({
  windowMs: 60 * 1000,
  limit: 100,
  standardHeaders: "draft-6",
  keyGenerator,
});

export const loginRateLimiter = isDev ? noLimit : rateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-6",
  keyGenerator,
  message: "Too many login attempts, please try again later",
});

export const registerRateLimiter = isDev ? noLimit : rateLimiter({
  windowMs: 60 * 60 * 1000,
  limit: 3,
  standardHeaders: "draft-6",
  keyGenerator,
  message: "Too many registration attempts, please try again later",
});

export const forgotPasswordRateLimiter = isDev ? noLimit : rateLimiter({
  windowMs: 15 * 60 * 1000,  // 15 Minuten
  limit: 3,
  standardHeaders: "draft-6",
  keyGenerator,
  message: "Too many requests, please try again later",
});

export const resetPasswordRateLimiter = isDev ? noLimit : rateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-6",
  keyGenerator,
  message: "Too many requests, please try again later",
});

export const verifyEmailRateLimiter = isDev ? noLimit : rateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-6",
  keyGenerator,
  message: "Too many requests, please try again later",
});

export const resendVerificationRateLimiter = isDev ? noLimit : rateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 3,
  standardHeaders: "draft-6",
  keyGenerator,
  message: "Too many requests, please try again later",
});