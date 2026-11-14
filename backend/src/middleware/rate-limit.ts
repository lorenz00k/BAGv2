import { rateLimiter, MemoryStore, type Store } from "hono-rate-limiter";
import type { MiddlewareHandler } from "hono";
import { env, isDevelopment } from "../env.js";
import { createClientKeyGenerator } from "../utils/clientIp.js";

const noLimit: MiddlewareHandler = (_, next) => next();

const keyGenerator = createClientKeyGenerator(env.TRUSTED_PROXY_COUNT);
type LimiterConfig = { windowMs: number; limit: number; message?: string };

type Options = {
  // Called once per limiter. Every limiter needs its own counters.
  createStore: (name: string) => Store;
  disabled: boolean;
};

export function createRateLimiters({ createStore, disabled }: Options) {
  const limiter = (
    name: string,
    { message, ...config }: LimiterConfig
  ): MiddlewareHandler =>
    disabled
      ? noLimit
      : rateLimiter({
          ...config,
          ...(message ? { message } : {}),
          standardHeaders: "draft-6",
          keyGenerator,
          store: createStore(name),
        });

  const generic = "Too many requests, please try again later";
  const minutes1 = 60 * 1000;
  const minutes15 = 15 * 60 * 1000;
  const minutes60 = 60 * 60 * 1000;

  return {
    global: limiter("global", { windowMs: minutes1, limit: 100 }),
    login: limiter("login", {
      windowMs: minutes15,
      limit: 5,
      message: "Too many login attempts, please try again later",
    }),
    register: limiter("register", {
      windowMs: minutes60,
      limit: 3,
      message: "Too many registration attempts, please try again later",
    }),
    forgotPassword: limiter("forgot-password", {
      windowMs: minutes15,
      limit: 3,
      message: generic,
    }),
    resetPassword: limiter("reset-password", {
      windowMs: minutes15,
      limit: 5,
      message: generic,
    }),
    verifyEmail: limiter("verify-email", {
      windowMs: minutes15,
      limit: 5,
      message: generic,
    }),
    resendVerification: limiter("resend-verification", {
      windowMs: minutes15,
      limit: 3,
      message: generic,
    }),
    viennagis: limiter("viennagis", {
      windowMs: minutes1,
      limit: 30,
      message: "Too many requests to Vienna GIS API",
    }),
  };
}

const limiters = createRateLimiters({
  createStore: () => new MemoryStore(),
  disabled: isDevelopment,
});

export const globalRateLimiter = limiters.global;
export const loginRateLimiter = limiters.login;
export const registerRateLimiter = limiters.register;
export const forgotPasswordRateLimiter = limiters.forgotPassword;
export const resetPasswordRateLimiter = limiters.resetPassword;
export const verifyEmailRateLimiter = limiters.verifyEmail;
export const resendVerificationRateLimiter = limiters.resendVerification;
export const viennagisRateLimiter = limiters.viennagis;
