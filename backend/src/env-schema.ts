import { z } from "zod";

const envSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    PORT: z.coerce.number().int().min(1).max(65535),
    DATABASE_URL: z
      .string()
      .regex(
        /^postgres(ql)?:\/\//,
        "must start with postgres:// or postgresql://"
      ),
    FRONTEND_URL: z
      .url()
      .refine((u) => !u.endsWith("/"), "must not end with a slash"),
    RESEND_API_KEY: z.string().min(1),
    RESEND_FROM_EMAIL: z
      .string()
      .transform((v) => v.trim() || "onboarding@resend.dev")
      .default("onboarding@resend.dev"),
    LOG_LEVEL: z
      .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
      .default("info"),
    // How many reverse proxies in front of the server append to X-Forwarded-For.
    // 0 = no proxy, the header is ignored and the connection address is used.
    TRUSTED_PROXY_COUNT: z.coerce.number().int().min(0).max(5).default(0),
    REDIS_URL: z
      .string()
      .regex(/^rediss?:\/\//, "must start with redis:// or rediss://")
      .optional(),
  })
  .refine(
    (env) => env.NODE_ENV !== "production" || env.REDIS_URL !== undefined,
    {
      path: ["REDIS_URL"],
      message: "is required when NODE_ENV is production",
    }
  );

export type Env = z.infer<typeof envSchema>;

export function parseEnv(source: Record<string, string | undefined>): Env {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    const problems = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid environment:\n${problems}`);
  }
  return result.data;
}
