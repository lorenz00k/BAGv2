import { vi, describe, it, expect } from "vitest";
import { eq } from "drizzle-orm";
import app from "../../src/app.js";
import { db } from "../../src/db/index.js";
import {
  users,
  sessions,
  verificationTokens,
} from "../../src/db/schema/index.js";
import { sendVerificationEmail } from "../../src/utils/email.js";
import { getCookie } from "./helpers.js";
import { loginWithCookie, isSessionValid } from "./api.js";
import {
  EMAIL,
  PASSWORD,
  post,
  withSession,
  createUser,
  login,
} from "./api.js";

describe("POST /api/auth/register", () => {
  it("creates the user, logs them in and sends a verification mail", async () => {
    const res = await post("/api/auth/register", {
      email: EMAIL,
      password: PASSWORD,
    });

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.user).toMatchObject({ email: EMAIL, emailVerified: false });
    expect(JSON.stringify(body)).not.toContain("passwordHash");

    // user is stored with an argon2 hash, not the plain password
    const [user] = await db.select().from(users).where(eq(users.email, EMAIL));
    expect(user?.passwordHash).toMatch(/^\$argon2id\$/);
    expect(user?.passwordHash).not.toContain(PASSWORD);
    expect(user?.emailVerified).toBe(false);

    // session cookie is set and a matching session exists
    const sid = getCookie(res, "session_id");
    expect(sid).toBeTruthy();
    expect(res.headers.getSetCookie().join(";")).toContain("HttpOnly");
    const sessionRows = await db
      .select()
      .from(sessions)
      .where(eq(sessions.userId, user!.id));
    expect(sessionRows).toHaveLength(1);

    // verification mail goes to the user, the token is stored only as a hash
    expect(sendVerificationEmail).toHaveBeenCalledTimes(1);
    const [mailTo, mailToken] = vi.mocked(sendVerificationEmail).mock.calls[0]!;
    expect(mailTo).toBe(EMAIL);
    const tokenRows = await db.select().from(verificationTokens);
    expect(tokenRows).toHaveLength(1);
    expect(tokenRows[0]?.tokenHash).not.toBe(mailToken);
  });

  it.each([
    ["an invalid email", { email: "nope", password: PASSWORD }],
    ["a too short password", { email: EMAIL, password: "short" }],
    ["a missing password", { email: EMAIL }],
  ])("rejects %s", async (_label, payload) => {
    const res = await post("/api/auth/register", payload);
    expect(res.status).toBe(400);
    expect(await db.select().from(users)).toHaveLength(0);
  });

  it("rejects an email that is already registered", async () => {
    await createUser();
    const res = await post("/api/auth/register", {
      email: EMAIL,
      password: PASSWORD,
    });
    expect(res.status).toBe(400);
    expect(await db.select().from(users)).toHaveLength(1);
  });

  it("stores the email trimmed and lowercased", async () => {
    await post("/api/auth/register", {
      email: "  Max@Example.com ",
      password: "correct-horse-battery",
    });

    expect((await db.select().from(users)).map((u) => u.email)).toEqual([
      "max@example.com",
    ]);
  });

  it("does not create a second account for another spelling of the same email", async () => {
    await post("/api/auth/register", {
      email: "max@example.com",
      password: "correct-horse-battery",
    });
    await post("/api/auth/register", {
      email: "MAX@EXAMPLE.COM",
      password: "correct-horse-battery",
    });

    expect(await db.select().from(users)).toHaveLength(1);
  });
  it.todo(
    "does not reveal whether an email is already registered (enumeration)"
  );
});

describe("POST /api/auth/login", () => {
  it("logs in with correct credentials", async () => {
    const user = await createUser();
    const res = await post("/api/auth/login", {
      email: EMAIL,
      password: PASSWORD,
    });

    expect(res.status).toBe(200);
    expect((await res.json()).user).toMatchObject({
      id: user.id,
      email: EMAIL,
    });
    expect(getCookie(res, "session_id")).toBeTruthy();
    expect(
      await db.select().from(sessions).where(eq(sessions.userId, user.id))
    ).toHaveLength(1);
  });

  it("answers wrong password and unknown email identically", async () => {
    await createUser();
    const wrongPassword = await post("/api/auth/login", {
      email: EMAIL,
      password: "wrong-password",
    });
    const unknownEmail = await post("/api/auth/login", {
      email: "other@example.com",
      password: PASSWORD,
    });

    expect(wrongPassword.status).toBe(401);
    expect(unknownEmail.status).toBe(401);
    expect(await unknownEmail.text()).toBe(await wrongPassword.text());
    expect(getCookie(wrongPassword, "session_id")).toBeUndefined();
  });

  it("rejects malformed input", async () => {
    const res = await post("/api/auth/login", {
      email: "nope",
      password: PASSWORD,
    });
    expect(res.status).toBe(400);
  });

  it("session rotation on login ends the old session and starts a new one", async () => {
    await createUser();
    const first = await login();

    const { res, sid: second } = await loginWithCookie(first);

    expect(res.status).toBe(200);
    expect(second).toBeDefined();
    expect(second).not.toBe(first);
    expect(await isSessionValid(first)).toBe(401);
    expect(await isSessionValid(second!)).toBe(200);
  });

  it("session rotation on login leaves exactly one session row for the user", async () => {
    const user = await createUser();
    const first = await login();
    await loginWithCookie(first);

    const rows = await db
      .select()
      .from(sessions)
      .where(eq(sessions.userId, user.id));

    expect(rows).toHaveLength(1);
  });

  it("session rotation on login keeps the old session when the login fails", async () => {
    await createUser();
    const first = await login();

    const { res } = await loginWithCookie(first, "wrong-password");

    expect(res.status).toBe(401);
    expect(await isSessionValid(first)).toBe(200);
  });

  it("session rotation on login still logs in when the cookie matches no session", async () => {
    await createUser();

    const { res, sid } = await loginWithCookie("not-a-real-session");

    expect(res.status).toBe(200);
    expect(await isSessionValid(sid!)).toBe(200);
  });

  it("answers invalid JSON with a client error, not a server error", async () => {
    const res = await app.request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{not json",
    });
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(500);
  });
});

describe("GET /api/auth/me", () => {
  it("returns the current user for a valid session", async () => {
    const user = await createUser();
    const sid = await login();

    const res = await app.request("/api/auth/me", {
      headers: withSession(sid),
    });
    expect(res.status).toBe(200);
    expect((await res.json()).user).toMatchObject({
      id: user.id,
      email: EMAIL,
    });
  });

  it("rejects requests without a session", async () => {
    expect((await app.request("/api/auth/me")).status).toBe(401);
  });

  it("rejects an unknown session id", async () => {
    const res = await app.request("/api/auth/me", {
      headers: withSession("made-up-session"),
    });
    expect(res.status).toBe(401);
  });

  it("rejects an expired session", async () => {
    await createUser();
    const sid = await login();
    await db.update(sessions).set({ expiresAt: new Date(Date.now() - 1000) });

    const res = await app.request("/api/auth/me", {
      headers: withSession(sid),
    });
    expect(res.status).toBe(401);
  });

  it("logs in with another spelling of the email", async () => {
    await createUser();

    const res = await post("/api/auth/login", {
      email: EMAIL.toUpperCase(),
      password: PASSWORD,
    });

    expect(res.status).toBe(200);
  });
});

describe("POST /api/auth/logout", () => {
  it("ends the session and clears the cookie", async () => {
    const user = await createUser();
    const sid = await login();

    const res = await post("/api/auth/logout", {}, withSession(sid));
    expect(res.status).toBe(200);
    expect(getCookie(res, "session_id")).toBe("");
    expect(
      await db.select().from(sessions).where(eq(sessions.userId, user.id))
    ).toHaveLength(0);

    const me = await app.request("/api/auth/me", { headers: withSession(sid) });
    expect(me.status).toBe(401);
  });

  it("succeeds even without a session", async () => {
    expect((await post("/api/auth/logout", {})).status).toBe(200);
  });
});
