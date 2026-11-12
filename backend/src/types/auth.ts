import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(254, "Email too long")
  .pipe(z.email());

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(100, "Password too long");

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password required"),
  newPassword: passwordSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token required"),
  password: passwordSchema,
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
