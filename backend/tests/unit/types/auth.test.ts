import { describe, it, expect } from "vitest";
import { registerSchema, loginSchema } from "../../../src/types/auth.js";

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
