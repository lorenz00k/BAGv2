import { describe, it, expect } from "vitest";
import { registerSchema, loginSchema, changePasswordSchema, resetPasswordSchema } from "../../../src/types/auth.js";

describe("registerSchema", () => {
  it("accepts a valid email and password", () => {
    expect(
      registerSchema.safeParse({
        email: "user@example.com",
        password: "12345678",
      }).success
    ).toBe(true);
  });

  it.each([
    ["no at sign", "userexample.com"],
    ["no domain", "user@"],
    ["empty", ""],
  ])("rejects an invalid email (%s)", (_label, email) => {
    expect(
      registerSchema.safeParse({ email, password: "12345678" }).success
    ).toBe(false);
  });

  it.each([
    [7, false],
    [8, true],
    [100, true],
    [101, false],
  ])("checks password length %i -> valid: %s", (length, valid) => {
    const result = registerSchema.safeParse({
      email: "user@example.com",
      password: "a".repeat(length),
    });
    expect(result.success).toBe(valid);
  });

  const emailOfLength = (n: number) =>
    "a".repeat(n - "@example.com".length) + "@example.com";

  it.each([
    [254, true],
    [255, false],
  ])("checks email length %i -> valid: %s", (length, valid) => {
    expect(
      registerSchema.safeParse({
        email: emailOfLength(length),
        password: "correct-horse-battery",
      }).success
    ).toBe(valid);
  });

  it("rejects missing fields", () => {
    expect(registerSchema.safeParse({}).success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("accepts any password, the check happens against the stored hash", () => {
    expect(
      loginSchema.safeParse({ email: "user@example.com", password: "x" })
        .success
    ).toBe(true);
  });

  it("rejects an invalid email", () => {
    expect(
      loginSchema.safeParse({ email: "nope", password: "x" }).success
    ).toBe(false);
  });
});

describe("email normalization", () => {
  it.each([
    ["registerSchema", registerSchema],
    ["loginSchema", loginSchema],
  ])("%s trims and lowercases the email", (_name, schema) => {
    const parsed = schema.parse({
      email: "  Max@Example.COM ",
      password: "correct-horse-battery",
    });

    expect(parsed.email).toBe("max@example.com");
  });

  it.each([
    ["registerSchema", registerSchema],
    ["loginSchema", loginSchema],
  ])("%s still rejects an invalid email after trimming", (_name, schema) => {
    expect(
      schema.safeParse({
        email: " not-an-email ",
        password: "correct-horse-battery",
      }).success
    ).toBe(false);
  });
});

describe.each([
  [
    "changePasswordSchema",
    (pw: string) =>
      changePasswordSchema.safeParse({
        currentPassword: "old",
        newPassword: pw,
      }),
  ],
  [
    "resetPasswordSchema",
    (pw: string) =>
      resetPasswordSchema.safeParse({ token: "abc", password: pw }),
  ],
])("%s password length", (_name, parse) => {
  it.each([
    [7, false],
    [8, true],
    [100, true],
    [101, false],
  ])("length %i -> valid: %s", (length, valid) => {
    expect(parse("a".repeat(length)).success).toBe(valid);
  });
});
