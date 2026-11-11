import { describe, it, expect } from "vitest";
import { eq } from "drizzle-orm";
import app from "../../src/app.js";
import { db } from "../../src/db/index.js";
import { getCookie } from "./helpers.js";
import { users, sessions, checks } from "../../src/db/schema/index.js";
import { EMAIL, PASSWORD, post, createUser, login } from "./api.js";

const NEW_PASSWORD = "a-brand-new-password";
const OTHER_EMAIL = "other@example.com";

const call = (method: string, path: string, sid?: string, body?: unknown) =>
  app.request(`/api/account${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(sid ? { Cookie: `session_id=${sid}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

const listSessions = async (sid: string) =>
  (await (await call("GET", "/sessions", sid)).json()).sessions as {
    id: string;
    isCurrent: boolean;
  }[];

describe("authentication", () => {
  it.each([
    ["POST", "/change-password"],
    ["GET", "/sessions"],
    ["DELETE", "/sessions/some-id"],
    ["DELETE", ""],
  ])("requires a session for %s /api/account%s", async (method, path) => {
    expect((await call(method, path)).status).toBe(401);
  });
});

describe("POST /api/account/change-password", () => {
  it("changes the password", async () => {
    await createUser();
    const sid = await login();

    const res = await call("POST", "/change-password", sid, {
      currentPassword: PASSWORD,
      newPassword: NEW_PASSWORD,
    });
    expect(res.status).toBe(200);

    expect(
      (await post("/api/auth/login", { email: EMAIL, password: PASSWORD }))
        .status
    ).toBe(401);
    expect(
      (await post("/api/auth/login", { email: EMAIL, password: NEW_PASSWORD }))
        .status
    ).toBe(200);
  });

  it("rejects a wrong current password and keeps the old one", async () => {
    await createUser();
    const sid = await login();

    const res = await call("POST", "/change-password", sid, {
      currentPassword: "wrong",
      newPassword: NEW_PASSWORD,
    });
    expect(res.status).toBe(401);
    expect(
      (await post("/api/auth/login", { email: EMAIL, password: PASSWORD }))
        .status
    ).toBe(200);
  });

  it.each([
    [
      "a too short new password",
      { currentPassword: PASSWORD, newPassword: "short" },
    ],
    ["a missing new password", { currentPassword: PASSWORD }],
    ["a missing current password", { newPassword: NEW_PASSWORD }],
  ])("rejects %s", async (_label, payload) => {
    await createUser();
    const sid = await login();
    expect((await call("POST", "/change-password", sid, payload)).status).toBe(
      400
    );
  });

  it("ends all other sessions but keeps the current one", async () => {
    await createUser();
    const current = await login();
    const other = await login();

    await call("POST", "/change-password", current, {
      currentPassword: PASSWORD,
      newPassword: NEW_PASSWORD,
    });

    expect((await call("GET", "/sessions", current)).status).toBe(200);
    expect((await call("GET", "/sessions", other)).status).toBe(401);
  });

  it.todo(
    "rejects a new password longer than 100 characters like registration does"
  );
});

describe("GET /api/account/sessions", () => {
  it("lists the own sessions and marks the current one", async () => {
    await createUser();
    const first = await login();
    await login();

    const list = await listSessions(first);
    expect(list).toHaveLength(2);
    expect(list.filter((s) => s.isCurrent)).toHaveLength(1);
    expect(list.find((s) => s.isCurrent)?.id).toBe(first);
  });

  it("does not list sessions of other users", async () => {
    await createUser();
    await createUser(OTHER_EMAIL);
    const sid = await login();
    await login(OTHER_EMAIL);

    expect(await listSessions(sid)).toHaveLength(1);
  });

  it.todo(
    "does not expose the raw session ids, which are the login credentials"
  );
});

describe("DELETE /api/account/sessions/:id", () => {
  it("ends another session of the user", async () => {
    await createUser();
    const current = await login();
    const other = await login();

    const res = await call("DELETE", `/sessions/${other}`, current);
    expect(res.status).toBe(200);
    expect((await call("GET", "/sessions", other)).status).toBe(401);
  });

  it("refuses to end the current session", async () => {
    await createUser();
    const sid = await login();

    expect((await call("DELETE", `/sessions/${sid}`, sid)).status).toBe(400);
    expect((await call("GET", "/sessions", sid)).status).toBe(200);
  });

  it("cannot end a session of another user", async () => {
    await createUser();
    await createUser(OTHER_EMAIL);
    const mine = await login();
    const theirs = await login(OTHER_EMAIL);

    expect((await call("DELETE", `/sessions/${theirs}`, mine)).status).toBe(
      404
    );
    expect((await call("GET", "/sessions", theirs)).status).toBe(200);
  });

  it("answers an unknown session id with 404", async () => {
    await createUser();
    const sid = await login();
    expect((await call("DELETE", "/sessions/made-up", sid)).status).toBe(404);
  });
});

describe("DELETE /api/account", () => {
  it("requires the password", async () => {
    await createUser();
    const sid = await login();

    expect((await call("DELETE", "", sid, {})).status).toBe(400);
    expect((await call("DELETE", "", sid, { password: "wrong" })).status).toBe(
      401
    );
    expect(await db.select().from(users)).toHaveLength(1);
  });

  it("deletes the user with their sessions and checks", async () => {
    const user = await createUser();
    const sid = await login();
    await db
      .insert(checks)
      .values({ userId: user.id, formData: { betriebsart: "cafe" } });

    const res = await call("DELETE", "", sid, { password: PASSWORD });
    expect(res.status).toBe(200);
    expect(getCookie(res, "session_id")).toBe("");

    expect(await db.select().from(users)).toHaveLength(0);
    expect(await db.select().from(sessions)).toHaveLength(0);
    expect(await db.select().from(checks)).toHaveLength(0);
    expect(
      (await post("/api/auth/login", { email: EMAIL, password: PASSWORD }))
        .status
    ).toBe(401);
  });

  it("leaves other users untouched", async () => {
    await createUser();
    const other = await createUser(OTHER_EMAIL);
    const sid = await login();
    await db.insert(checks).values({ userId: other.id, formData: {} });

    await call("DELETE", "", sid, { password: PASSWORD });

    expect(
      await db.select().from(users).where(eq(users.email, OTHER_EMAIL))
    ).toHaveLength(1);
    expect(await db.select().from(checks)).toHaveLength(1);
  });
});
