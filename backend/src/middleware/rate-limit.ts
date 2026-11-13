import { rateLimiter } from "hono-rate-limiter";
import type { Context, MiddlewareHandler } from "hono";
import { isDevelopment } from "../env.js";

const noLimit: MiddlewareHandler = (_, next) => next();

const keyGenerator = (c: Context): string =>
  c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ||
  c.req.header("x-real-ip") ||
  "unknown";

export const globalRateLimiter = isDevelopment
  ? noLimit
  : rateLimiter({
      windowMs: 60 * 1000,
      limit: 100,
      standardHeaders: "draft-6",
      keyGenerator,
    });

export const loginRateLimiter = isDevelopment
  ? noLimit
  : rateLimiter({
      windowMs: 15 * 60 * 1000,
      limit: 5,
      standardHeaders: "draft-6",
      keyGenerator,
      message: "Too many login attempts, please try again later",
    });

export const registerRateLimiter = isDevelopment
  ? noLimit
  : rateLimiter({
      windowMs: 60 * 60 * 1000,
      limit: 3,
      standardHeaders: "draft-6",
      keyGenerator,
      message: "Too many registration attempts, please try again later",
    });

export const forgotPasswordRateLimiter = isDevelopment
  ? noLimit
  : rateLimiter({
      windowMs: 15 * 60 * 1000, // 15 Minuten
      limit: 3,
      standardHeaders: "draft-6",
      keyGenerator,
      message: "Too many requests, please try again later",
    });

export const resetPasswordRateLimiter = isDevelopment
  ? noLimit
  : rateLimiter({
      windowMs: 15 * 60 * 1000,
      limit: 5,
      standardHeaders: "draft-6",
      keyGenerator,
      message: "Too many requests, please try again later",
    });

export const verifyEmailRateLimiter = isDevelopment
  ? noLimit
  : rateLimiter({
      windowMs: 15 * 60 * 1000,
      limit: 5,
      standardHeaders: "draft-6",
      keyGenerator,
      message: "Too many requests, please try again later",
    });

export const resendVerificationRateLimiter = isDevelopment
  ? noLimit
  : rateLimiter({
      windowMs: 15 * 60 * 1000,
      limit: 3,
      standardHeaders: "draft-6",
      keyGenerator,
      message: "Too many requests, please try again later",
    });
