import { vi, describe, it, expect } from "vitest";
import { eq } from "drizzle-orm";
import app from "../../src/app.js";
import { db } from "../../src/db/index.js";
import { users, sessions, verificationTokens } from "../../src/db/schema/index.js";
import { sendVerificationEmail, sendPasswordResetEmail } from "../../src/utils/email.js";
import { getCookie } from "./helpers.js";
import {
  EMAIL, PASSWORD, post, withSession, createUser, login,
  lastVerificationToken, lastResetToken,
} from "./api.js";

const NEW_PASSWORD = "a-brand-new-password";

async function register() {
  const res = await post("/api/auth/register", { email: EMAIL, password: PASSWORD });
  return { sid: getCookie(res, "session_id")!, token: lastVerificationToken() };
}

const isVerified = async () =>
  (await db.select().from(users).where(eq(users.email, EMAIL)))[0]?.emailVerified;

describe("POST /api/auth/verify-email", () => {
  it("verifies the email and consumes the token", async () => {
    const { token } = await register();

    const res = await post("/api/auth/verify-email", { token });
    expect(res.status).toBe(200);
    expect(await isVerified()).toBe(true);
    expect(await db.select().from(verificationTokens)).toHaveLength(0);
  });

  it("accepts a token only once", async () => {
    const { token } = await register();
    await post("/api/auth/verify-email", { token });

    expect((await post("/api/auth/verify-email", { token })).status).toBe(400);
  });

  it.each([
    ["an unknown token", { token: "made-up-token" }],
    ["a missing token", {}],
    ["a token that is not a string", { token: 123 }],
  ])("rejects %s", async (_label, payload) => {
    await register();
    expect((await post("/api/auth/verify-email", payload)).status).toBe(400);
    expect(await isVerified()).toBe(false);
  });

  it("rejects an expired token", async () => {
    const { token } = await register();
    await db.update(verificationTokens).set({ expiresAt: new Date(Date.now() - 1000) });

    expect((await post("/api/auth/verify-email", { token })).status).toBe(400);
    expect(await isVerified()).toBe(false);
  });

  it("rejects a password reset token", async () => {
    await createUser();
    await post("/api/auth/forgot-password", { email: EMAIL });

    const res = await post("/api/auth/verify-email", { token: lastResetToken() });
    expect(res.status).toBe(400);
    expect(await isVerified()).toBe(false);
  });

  it.todo("lets only one of two parallel requests redeem the same token");
});

describe("POST /api/auth/resend-verification", () => {
  it("requires a session", async () => {
    expect((await post("/api/auth/resend-verification", {})).status).toBe(401);
  });

  it("sends a new token and invalidates the old one", async () => {
    const { sid, token: oldToken } = await register();

    const res = await post("/api/auth/resend-verification", {}, withSession(sid));
    expect(res.status).toBe(200);
    expect(sendVerificationEmail).toHaveBeenCalledTimes(2);
    const newToken = lastVerificationToken();
    expect(newToken).not.toBe(oldToken);

    expect((await post("/api/auth/verify-email", { token: oldToken })).status).toBe(400);
    expect((await post("/api/auth/verify-email", { token: newToken })).status).toBe(200);
  });

  it("does not send a mail when the email is already verified", async () => {
    const { sid, token } = await register();
    await post("/api/auth/verify-email", { token });

    const res = await post("/api/auth/resend-verification", {}, withSession(sid));
    expect(res.status).toBe(200);
    expect((await res.json()).message).toBe("Already verified");
    expect(sendVerificationEmail).toHaveBeenCalledTimes(1);
  });
});

describe("POST /api/auth/forgot-password", () => {
  it("sends a reset mail to a registered email", async () => {
    await createUser();
    const res = await post("/api/auth/forgot-password", { email: EMAIL });

    expect(res.status).toBe(200);
    expect(sendPasswordResetEmail).toHaveBeenCalledTimes(1);
    expect(vi.mocked(sendPasswordResetEmail).mock.calls[0]?.[0]).toBe(EMAIL);
  });

  it("answers an unknown email exactly like a known one and sends nothing", async () => {
    await createUser();
    const known = await post("/api/auth/forgot-password", { email: EMAIL });
    const unknown = await post("/api/auth/forgot-password", { email: "nobody@example.com" });

    expect(unknown.status).toBe(known.status);
    expect(await unknown.text()).toBe(await known.text());
    expect(sendPasswordResetEmail).toHaveBeenCalledTimes(1); // only for the known one
  });

  it("replaces an earlier reset token", async () => {
    await createUser();
    await post("/api/auth/forgot-password", { email: EMAIL });
    const first = lastResetToken();
    await post("/api/auth/forgot-password", { email: EMAIL });

    const res = await post("/api/auth/reset-password", { token: first, password: NEW_PASSWORD });
    expect(res.status).toBe(400);
  });

  it("rejects a missing email", async () => {
    expect((await post("/api/auth/forgot-password", {})).status).toBe(400);
  });
});

describe("POST /api/auth/reset-password", () => {
  async function requestReset() {
    await createUser();
    await post("/api/auth/forgot-password", { email: EMAIL });
    return lastResetToken();
  }

  it("sets the new password and the old one stops working", async () => {
    const token = await requestReset();

    const res = await post("/api/auth/reset-password", { token, password: NEW_PASSWORD });
    expect(res.status).toBe(200);

    expect((await post("/api/auth/login", { email: EMAIL, password: PASSWORD })).status).toBe(401);
    expect((await post("/api/auth/login", { email: EMAIL, password: NEW_PASSWORD })).status).toBe(200);
  });

  it("logs out every existing session of the user", async () => {
    const sid = await (async () => {
      await createUser();
      return login();
    })();
    await post("/api/auth/forgot-password", { email: EMAIL });

    await post("/api/auth/reset-password", { token: lastResetToken(), password: NEW_PASSWORD });

    expect(await db.select().from(sessions)).toHaveLength(0);
    expect((await app.request("/api/auth/me", { headers: withSession(sid) })).status).toBe(401);
  });

  it("accepts a token only once", async () => {
    const token = await requestReset();
    await post("/api/auth/reset-password", { token, password: NEW_PASSWORD });

    const again = await post("/api/auth/reset-password", { token, password: "yet-another-password" });
    expect(again.status).toBe(400);
  });

  it("rejects a too short password without consuming the token", async () => {
    const token = await requestReset();

    expect((await post("/api/auth/reset-password", { token, password: "short" })).status).toBe(400);
    expect((await post("/api/auth/reset-password", { token, password: NEW_PASSWORD })).status).toBe(200);
  });

  it("rejects a too long password without consuming the token", async () => {
    const token = await requestReset();

    expect((await post("/api/auth/reset-password", { token, password: "a".repeat(101) })).status).toBe(400);
    expect((await post("/api/auth/reset-password", { token, password: NEW_PASSWORD })).status).toBe(200);
  });

  it.each([
    ["an unknown token", { token: "made-up-token", password: NEW_PASSWORD }],
    ["a missing token", { password: NEW_PASSWORD }],
  ])("rejects %s", async (_label, payload) => {
    await requestReset();
    expect((await post("/api/auth/reset-password", payload)).status).toBe(400);
  });

  it("rejects an email verification token", async () => {
    await createUser();
    await post("/api/auth/register", { email: "other@example.com", password: PASSWORD });

    const res = await post("/api/auth/reset-password", {
      token: lastVerificationToken(),
      password: NEW_PASSWORD,
    });
    expect(res.status).toBe(400);
  });

  it.todo("rejects a password longer than 100 characters like registration does");
});