import { describe, it, expect } from "vitest";
import app from "../../src/app.js";
import { db } from "../../src/db/index.js";
import { sessions } from "../../src/db/schema/index.js";
import { EMAIL, post, createUser, login, lastVerificationToken } from "./api.js";

const me = (sid?: string) =>
  app.request("/api/user/me", { headers: sid ? { Cookie: `session_id=${sid}` } : {} });

describe("GET /api/user/me", () => {
  it("returns the profile of the logged-in user", async () => {
    const user = await createUser();
    const sid = await login();

    const res = await me(sid);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.user).toMatchObject({ id: user.id, email: EMAIL, emailVerified: false });
    expect(Number.isNaN(Date.parse(body.user.createdAt))).toBe(false);
  });

  it("never exposes the password hash", async () => {
    await createUser();
    const sid = await login();

    const text = await (await me(sid)).text();
    expect(text).not.toContain("passwordHash");
    expect(text).not.toContain("argon2");
  });

  it("returns the user of the session, not another one", async () => {
    await createUser();
    const other = await createUser("other@example.com");
    const sid = await login("other@example.com");

    expect((await (await me(sid)).json()).user.id).toBe(other.id);
  });

  it("shows the verified state after the email was verified", async () => {
    await post("/api/auth/register", { email: EMAIL, password: "correct-horse-battery" });
    const sid = await login(EMAIL, "correct-horse-battery");
    await post("/api/auth/verify-email", { token: lastVerificationToken() });

    expect((await (await me(sid)).json()).user.emailVerified).toBe(true);
  });

  it("requires a session", async () => {
    expect((await me()).status).toBe(401);
  });

  it("rejects an unknown session", async () => {
    expect((await me("made-up-session")).status).toBe(401);
  });

  it("rejects an expired session", async () => {
    await createUser();
    const sid = await login();
    await db.update(sessions).set({ expiresAt: new Date(Date.now() - 1000) });

    expect((await me(sid)).status).toBe(401);
  });
});