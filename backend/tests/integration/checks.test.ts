import { describe, it, expect } from "vitest";
import { eq } from "drizzle-orm";
import app from "../../src/app.js";
import { db } from "../../src/db/index.js";
import { checks } from "../../src/db/schema/index.js";
import { createUser, login } from "./api.js";

const OTHER_EMAIL = "other@example.com";
const UNKNOWN_ID = "00000000-0000-4000-8000-000000000000";

const call = (method: string, path: string, sid?: string, body?: unknown) =>
  app.request(`/api/checks${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(sid ? { Cookie: `session_id=${sid}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

// Two users, each logged in
async function twoUsers() {
  const me = await createUser();
  const other = await createUser(OTHER_EMAIL);
  return { me, other, sid: await login(), otherSid: await login(OTHER_EMAIL) };
}

// A check owned by someone else, created directly in the database
async function checkOf(userId: string, formData: Record<string, unknown> = {}) {
  const [check] = await db
    .insert(checks)
    .values({ userId, formData })
    .returning();
  return check!;
}

describe("authentication", () => {
  it.each([
    ["POST", ""],
    ["GET", ""],
    ["GET", `/${UNKNOWN_ID}`],
    ["PATCH", `/${UNKNOWN_ID}`],
    ["POST", `/${UNKNOWN_ID}/evaluate`],
    ["DELETE", `/${UNKNOWN_ID}`],
  ])("requires a session for %s /api/checks%s", async (method, path) => {
    expect((await call(method, path)).status).toBe(401);
  });
});

describe("POST /api/checks", () => {
  it("creates a draft with defaults", async () => {
    const { me, sid } = await twoUsers();
    const res = await call("POST", "", sid, {});

    expect(res.status).toBe(201);
    expect((await res.json()).check).toMatchObject({
      userId: me.id,
      status: "draft",
      currentStep: "0",
      formData: {},
    });
  });

  it("stores the given form data and step", async () => {
    const { sid } = await twoUsers();
    const res = await call("POST", "", sid, {
      formData: { betriebsart: "cafe" },
      currentStep: "3",
    });

    expect((await res.json()).check).toMatchObject({
      formData: { betriebsart: "cafe" },
      currentStep: "3",
    });
  });

  it("ignores a user id sent in the body", async () => {
    const { me, other, sid } = await twoUsers();
    const res = await call("POST", "", sid, { userId: other.id });

    expect((await res.json()).check.userId).toBe(me.id);
  });

  it("rejects form data that is not an object", async () => {
    const { sid } = await twoUsers();
    expect((await call("POST", "", sid, { formData: "nope" })).status).toBe(
      400
    );
    expect(await db.select().from(checks)).toHaveLength(0);
  });

  it("answers malformed JSON with 400", async () => {
    const { sid } = await twoUsers();
    const res = await app.request("/api/checks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `session_id=${sid}`,
      },
      body: "{not json",
    });
    expect(res.status).toBe(400);
  });
});

describe("GET /api/checks", () => {
  it("lists only the checks of the user, oldest first", async () => {
    const { me, other, sid } = await twoUsers();
    const first = await checkOf(me.id);
    const second = await checkOf(me.id);
    await checkOf(other.id);

    const body = await (await call("GET", "", sid)).json();
    expect(body.checks.map((c: { id: string }) => c.id)).toEqual([
      first.id,
      second.id,
    ]);
  });
});

describe("GET /api/checks/:id", () => {
  it("returns an own check", async () => {
    const { me, sid } = await twoUsers();
    const check = await checkOf(me.id, { a: 1 });

    const res = await call("GET", `/${check.id}`, sid);
    expect(res.status).toBe(200);
    expect((await res.json()).check).toMatchObject({
      id: check.id,
      formData: { a: 1 },
    });
  });

  it("answers 404 for the check of another user", async () => {
    const { other, sid } = await twoUsers();
    const theirs = await checkOf(other.id);

    expect((await call("GET", `/${theirs.id}`, sid)).status).toBe(404);
  });

  it.each([
    ["an unknown id", UNKNOWN_ID],
    ["an id that is not a uuid", "not-a-uuid"],
  ])("answers 404 for %s", async (_label, id) => {
    const { sid } = await twoUsers();
    expect((await call("GET", `/${id}`, sid)).status).toBe(404);
  });
});

describe("PATCH /api/checks/:id", () => {
  it("updates form data, step and status", async () => {
    const { me, sid } = await twoUsers();
    const check = await checkOf(me.id);

    const res = await call("PATCH", `/${check.id}`, sid, {
      formData: { betriebsart: "bar" },
      currentStep: "5",
      status: "completed",
    });

    expect(res.status).toBe(200);
    const [stored] = await db
      .select()
      .from(checks)
      .where(eq(checks.id, check.id));
    expect(stored).toMatchObject({
      formData: { betriebsart: "bar" },
      currentStep: "5",
      status: "completed",
    });
    expect(stored!.updatedAt.getTime()).toBeGreaterThanOrEqual(
      check.updatedAt.getTime()
    );
  });

  it("rejects an invalid status", async () => {
    const { me, sid } = await twoUsers();
    const check = await checkOf(me.id);

    expect(
      (await call("PATCH", `/${check.id}`, sid, { status: "archived" })).status
    ).toBe(400);
  });

  it("cannot change the check of another user", async () => {
    const { other, sid } = await twoUsers();
    const theirs = await checkOf(other.id, { secret: true });

    const res = await call("PATCH", `/${theirs.id}`, sid, {
      formData: { hacked: true },
    });
    expect(res.status).toBe(404);

    const [stored] = await db
      .select()
      .from(checks)
      .where(eq(checks.id, theirs.id));
    expect(stored?.formData).toEqual({ secret: true });
  });

  it("answers 404 for an id that is not a uuid", async () => {
    const { sid } = await twoUsers();
    expect((await call("PATCH", "/not-a-uuid", sid, {})).status).toBe(404);
  });
});

describe("POST /api/checks/:id/evaluate", () => {
  it("answers 404 for the check of another user", async () => {
    const { other, sid } = await twoUsers();
    const theirs = await checkOf(other.id);

    expect((await call("POST", `/${theirs.id}/evaluate`, sid)).status).toBe(
      404
    );
  });

  it("rejects a check whose form data is invalid", async () => {
    const { me, sid } = await twoUsers();
    const check = await checkOf(me.id, { sector: "spaceStation", areaSqm: -5 });

    const res = await call("POST", `/${check.id}/evaluate`, sid);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("Invalid form data");
  });

  it("evaluates a valid check, stores the result and marks it as completed", async () => {
    const { me, sid } = await twoUsers();
    const check = await checkOf(me.id, {
      sector: "gastronomyHotel",
      hospitalitySubtype: "otherGastro",
      areaSqm: 80,
      isStationary: "yes",
      operatingPattern: "gfvoWindow",
    });

    const res = await call("POST", `/${check.id}/evaluate`, sid);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect([
      "noFacility",
      "freistellungGFVO",
      "needsPermit",
      "individualAssessment",
    ]).toContain(body.result.classification);
    expect(body.check.status).toBe("completed");

    const [stored] = await db
      .select()
      .from(checks)
      .where(eq(checks.id, check.id));
    expect(stored?.status).toBe("completed");
    expect(stored?.formData).toHaveProperty("result");
  });

  it("can evaluate a check again, although its form data now contains the result", async () => {
    const { me, sid } = await twoUsers();
    const check = await checkOf(me.id, { sector: "retail", areaSqm: 40 });

    expect((await call("POST", `/${check.id}/evaluate`, sid)).status).toBe(200);
    expect((await call("POST", `/${check.id}/evaluate`, sid)).status).toBe(200);
  });

  it("answers 404 for an id that is not a uuid", async () => {
    const { sid } = await twoUsers();
    expect((await call("POST", "/not-a-uuid/evaluate", sid)).status).toBe(404);
  });
});

describe("DELETE /api/checks/:id", () => {
  it("deletes an own check", async () => {
    const { me, sid } = await twoUsers();
    const check = await checkOf(me.id);

    const res = await call("DELETE", `/${check.id}`, sid);
    expect(res.status).toBe(200);
    expect(await db.select().from(checks)).toHaveLength(0);
  });

  it("cannot delete the check of another user", async () => {
    const { other, sid } = await twoUsers();
    const theirs = await checkOf(other.id);

    expect((await call("DELETE", `/${theirs.id}`, sid)).status).toBe(404);
    expect(await db.select().from(checks)).toHaveLength(1);
  });

  it("answers 404 for an id that is not a uuid", async () => {
    const { sid } = await twoUsers();
    expect((await call("DELETE", "/not-a-uuid", sid)).status).toBe(404);
  });
});
