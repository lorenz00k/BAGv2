import { z } from "zod";

const emailSchema = z.string().trim().toLowerCase().max(254, "Email too long").pipe(z.email());

export const registerSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password too long"),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
