import { describe, it, expect } from "vitest";
import { eq } from "drizzle-orm";
import app from "../../src/app.js";
import { db } from "../../src/db/index.js";
import { checks, checkerSessions } from "../../src/db/schema/checks.js";
import { createSid, hashSid } from "../../src/utils/checkerSession.js";
import {
  SectorValues,
  HospitalitySubtypeValues,
  OperatingPatternValues,
} from "../../src/services/checker/evaluate.js";
import { getCookie } from "./helpers.js";
import { createUser, login } from "./api.js";

const HOUR = 60 * 60 * 1000;

// A sector that needs no extra details (no subtype, no accommodation fields)
const PLAIN_SECTOR = SectorValues.find(
  (sector) => !["gastronomyHotel", "workshop", "accommodation"].includes(sector)
)!;

// Every field the evaluation requires
const completeAnswers = () => ({
  sector: PLAIN_SECTOR,
  areaSqm: 80,
  personCount: 10,
  isStationary: true,
  isOnlyTemporary: false,
  zoningClarified: true,
  buildingConsentPresent: true,
  operatingPattern: OperatingPatternValues[0],
  hasExternalVentilation: false,
  storesRegulatedHazardous: false,
  storesLabelledHazardous: false,
  usesLoudMusic: false,
  ippcOrSevesoRelevant: false,
  expectedImpairments: false,
  locatedInInfrastructureSite: false,
  locatedInApprovedComplex: false,
  existingPermitHistory: false,
});

const call = (
  method: string,
  path: string,
  cookies: Record<string, string> = {},
  body?: unknown
) => {
  const cookie = Object.entries(cookies)
    .map(([name, value]) => `${name}=${value}`)
    .join("; ");
  return app.request(`/api/checker${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
};

// An anonymous session as the checker page creates it; returns the cookie value
async function createAnonymousSession(expiresInMs = HOUR) {
  const sid = createSid();
  await db.insert(checkerSessions).values({
    sidHash: hashSid(sid),
    expiresAt: new Date(Date.now() + expiresInMs),
  });
  return sid;
}

const rowOf = async (sid: string) =>
  (
    await db
      .select()
      .from(checkerSessions)
      .where(eq(checkerSessions.sidHash, hashSid(sid)))
  )[0];

const checksOf = (userId: string) =>
  db.select().from(checks).where(eq(checks.userId, userId));

// A logged-in user together with an anonymous checker session
async function loggedInChecker() {
  const user = await createUser();
  return {
    user,
    session_id: await login(),
    sid: await createAnonymousSession(),
  };
}

describe("POST /api/checker/session", () => {
  it("starts a session and sets the cookie, storing only a hash", async () => {
    const res = await call("POST", "/session");
    expect(res.status).toBe(200);

    const sid = getCookie(res, "sid");
    expect(sid).toBeTruthy();
    expect(res.headers.getSetCookie().join(";")).toContain("HttpOnly");

    const rows = await db.select().from(checkerSessions);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.sidHash).toBe(hashSid(sid!));
    expect(rows[0]?.sidHash).not.toBe(sid);
  });

  it("reuses an existing session and extends it", async () => {
    const sid = await createAnonymousSession();
    const before = await rowOf(sid);

    const res = await call("POST", "/session", { sid });
    expect(res.status).toBe(200);

    expect(await db.select().from(checkerSessions)).toHaveLength(1);
    const after = await rowOf(sid);
    expect(after?.id).toBe(before?.id);
    expect(after!.expiresAt.getTime()).toBeGreaterThan(
      before!.expiresAt.getTime()
    );
  });

  it.each([
    ["an unknown", async () => createSid()],
    ["an expired", async () => createAnonymousSession(-HOUR)],
  ])("starts a new session for %s cookie", async (_label, makeSid) => {
    const oldSid = await makeSid();

    const res = await call("POST", "/session", { sid: oldSid });
    expect(res.status).toBe(200);

    const newSid = getCookie(res, "sid");
    expect(newSid).toBeTruthy();
    expect(newSid).not.toBe(oldSid);
    expect(await rowOf(newSid!)).toBeDefined();
  });
});

describe("GET /api/checker/state", () => {
  it("requires the session cookie", async () => {
    expect((await call("GET", "/state")).status).toBe(401);
  });

  it("answers 404 for an unknown session", async () => {
    expect((await call("GET", "/state", { sid: createSid() })).status).toBe(
      404
    );
  });

  it("returns the state of a valid session", async () => {
    const sid = await createAnonymousSession();
    expect((await call("GET", "/state", { sid })).status).toBe(200);
  });

  it("deletes an expired session and clears the cookie", async () => {
    const sid = await createAnonymousSession(-HOUR);

    const res = await call("GET", "/state", { sid });
    expect(res.status).toBe(404);
    expect(getCookie(res, "sid")).toBe("");
    expect(await rowOf(sid)).toBeUndefined();
  });
});

describe("PUT /api/checker/answers", () => {
  const put = (
    sid: string,
    answers: unknown,
    extra: Record<string, string> = {}
  ) => call("PUT", "/answers", { sid, ...extra }, { answers });

  it.each([
    ["requires the session cookie", {}, 401],
    ["answers 404 for an unknown session", { sid: createSid() }, 404],
  ])("%s", async (_label, cookies, status) => {
    expect(
      (await call("PUT", "/answers", cookies, { answers: {} })).status
    ).toBe(status);
  });

  it("saves the answers", async () => {
    const sid = await createAnonymousSession();

    const res = await put(sid, { sector: PLAIN_SECTOR, areaSqm: 80 });
    expect(res.status).toBe(200);
    expect((await rowOf(sid))?.answers).toEqual({
      sector: PLAIN_SECTOR,
      areaSqm: 80,
    });
  });

  it("replaces earlier answers instead of merging them", async () => {
    const sid = await createAnonymousSession();
    await put(sid, { sector: PLAIN_SECTOR, areaSqm: 80 });
    await put(sid, { personCount: 5 });

    expect((await rowOf(sid))?.answers).toEqual({ personCount: 5 });
  });

  it("extends the session", async () => {
    const sid = await createAnonymousSession();
    const before = await rowOf(sid);

    await put(sid, {});
    expect((await rowOf(sid))!.expiresAt.getTime()).toBeGreaterThan(
      before!.expiresAt.getTime()
    );
  });

  it("drops answers that do not belong to the chosen sector", async () => {
    const sid = await createAnonymousSession();

    await put(sid, {
      sector: PLAIN_SECTOR,
      hospitalitySubtype: HospitalitySubtypeValues[0],
      bedCount: 10,
    });
    expect((await rowOf(sid))?.answers).toEqual({ sector: PLAIN_SECTOR });
  });

  it.each([
    ["an unknown field", { somethingElse: 1 }],
    ["a wrong type", { areaSqm: "80" }],
    ["a negative number", { areaSqm: -1 }],
    ["a decimal number", { personCount: 1.5 }],
    ["an unknown sector", { sector: "spaceStation" }],
  ])("rejects %s with the list of issues", async (_label, answers) => {
    const sid = await createAnonymousSession();

    const res = await put(sid, answers);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.message).toBe("Validation failed");
    expect(body.issues.length).toBeGreaterThan(0);
    expect((await rowOf(sid))?.answers).toEqual({});
  });

  it("rejects a body without answers", async () => {
    const sid = await createAnonymousSession();
    expect((await call("PUT", "/answers", { sid }, {})).status).toBe(400);
  });

  it("answers malformed JSON with 400", async () => {
    const sid = await createAnonymousSession();
    const res = await app.request("/api/checker/answers", {
      method: "PUT",
      headers: { "Content-Type": "application/json", Cookie: `sid=${sid}` },
      body: "{not json",
    });
    expect(res.status).toBe(400);
  });

  describe("for a logged-in user", () => {
    it("creates a draft check from the answers", async () => {
      const { user, session_id, sid } = await loggedInChecker();

      await put(sid, { sector: PLAIN_SECTOR }, { session_id });

      const rows = await checksOf(user.id);
      expect(rows).toHaveLength(1);
      expect(rows[0]).toMatchObject({
        status: "draft",
        formData: { sector: PLAIN_SECTOR },
      });
    });

    it("does not touch an unrelated draft of the same user", async () => {
      const { user, session_id, sid } = await loggedInChecker();
      await db
        .insert(checks)
        .values({ userId: user.id, formData: { old: true } });

      await put(sid, { areaSqm: 80 }, { session_id });

      const rows = await checksOf(user.id);
      expect(rows).toHaveLength(2);
      expect(rows.map((r) => r.formData)).toEqual(
        expect.arrayContaining([{ old: true }, { areaSqm: 80 }])
      );
    });

    it("updates the same check on a second save in the same session", async () => {
      const { user, session_id, sid } = await loggedInChecker();

      await put(sid, { areaSqm: 80 }, { session_id });
      await put(sid, { areaSqm: 90 }, { session_id });

      const rows = await checksOf(user.id);
      expect(rows).toHaveLength(1);
      expect(rows[0]?.formData).toEqual({ areaSqm: 90 });
    });
  });
});

describe("POST /api/checker/evaluate", () => {
  const evaluate = (sid: string, extra: Record<string, string> = {}) =>
    call("POST", "/evaluate", { sid, ...extra });

  const sessionWith = async (answers: Record<string, unknown>) => {
    const sid = await createAnonymousSession();
    await call("PUT", "/answers", { sid }, { answers });
    return sid;
  };

  it.each([
    ["requires the session cookie", {}, 401],
    ["answers 404 for an unknown session", { sid: createSid() }, 404],
  ])("%s", async (_label, cookies, status) => {
    expect((await call("POST", "/evaluate", cookies)).status).toBe(status);
  });

  it("lists the missing answers when the session is incomplete", async () => {
    const sid = await sessionWith({ areaSqm: 80 });

    const res = await evaluate(sid);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.message).toBe("Validation failed");
    const missing = body.issues.map(
      (issue: { path: string[] }) => issue.path[1]
    );
    expect(missing).toContain("sector");
    expect(missing).toContain("operatingPattern");
    expect(missing).not.toContain("areaSqm");
  });

  it("asks for the details that the chosen sector requires", async () => {
    const sid = await sessionWith({
      ...completeAnswers(),
      sector: "gastronomyHotel",
    });

    const res = await evaluate(sid);
    expect(res.status).toBe(400);
    const missing = (await res.json()).issues.map(
      (issue: { path: string[] }) => issue.path[1]
    );
    expect(missing).toContain("hospitalitySubtype");
  });

  it("evaluates complete answers and stores the result in the session", async () => {
    const sid = await sessionWith(completeAnswers());

    const res = await evaluate(sid);
    expect(res.status).toBe(200);
    expect(typeof (await res.json())).toBe("object");

    const row = await rowOf(sid);
    expect(row?.result).not.toBeNull();
    expect(row?.status).toBe("finished");
  });

  describe("for a logged-in user", () => {
    it("turns the draft into a completed check with the result", async () => {
      const { user, session_id, sid } = await loggedInChecker();
      await call(
        "PUT",
        "/answers",
        { sid, session_id },
        { answers: completeAnswers() }
      );

      expect((await evaluate(sid, { session_id })).status).toBe(200);

      const rows = await checksOf(user.id);
      expect(rows).toHaveLength(1);
      expect(rows[0]).toMatchObject({
        status: "completed",
        formData: completeAnswers(),
      });
      expect(rows[0]?.result).not.toBeNull();
    });

    it("creates a completed check when there is no draft", async () => {
      const { user, session_id } = await loggedInChecker();
      const sid = await sessionWith(completeAnswers());

      await evaluate(sid, { session_id });

      const rows = await checksOf(user.id);
      expect(rows).toHaveLength(1);
      expect(rows[0]?.status).toBe("completed");
    });

    it("creates no check without a login", async () => {
      const sid = await sessionWith(completeAnswers());
      await evaluate(sid);

      expect(await db.select().from(checks)).toHaveLength(0);
    });

    it.todo("evaluating twice does not create duplicate completed checks");
    it.todo(
      "a check taken over from the checker can be evaluated through /api/checks/:id/evaluate (the checker uses booleans, the compliance schema yes/no)"
    );
  });
});

describe("DELETE /api/checker/session", () => {
  it("requires the session cookie", async () => {
    expect((await call("DELETE", "/session")).status).toBe(401);
  });

  it("deletes the session and clears the cookie", async () => {
    const sid = await createAnonymousSession();

    const res = await call("DELETE", "/session", { sid });
    expect(res.status).toBe(204);
    expect(getCookie(res, "sid")).toBe("");
    expect(await rowOf(sid)).toBeUndefined();
  });

  it("succeeds for an unknown session", async () => {
    expect(
      (await call("DELETE", "/session", { sid: createSid() })).status
    ).toBe(204);
  });
});

describe("saving for logged-in users", () => {
  const as = (x: { sid: string; session_id: string }) => ({
    sid: x.sid,
    session_id: x.session_id,
  });

  it("keeps updating the same check on repeated saves", async () => {
    const ctx = await loggedInChecker();

    await call("PUT", "/answers", as(ctx), { answers: { areaSqm: 10 } });
    await call("PUT", "/answers", as(ctx), { answers: { areaSqm: 20 } });

    const rows = await checksOf(ctx.user.id);
    expect(rows).toHaveLength(1);
    expect((rows[0]!.formData as { areaSqm: number }).areaSqm).toBe(20);
    expect((await rowOf(ctx.sid))!.checkId).toBe(rows[0]!.id);
  });

  it("creates a separate check for a new session", async () => {
    const ctx = await loggedInChecker();
    const otherSid = await createAnonymousSession();

    await call("PUT", "/answers", as(ctx), { answers: { areaSqm: 10 } });
    await call(
      "PUT",
      "/answers",
      { sid: otherSid, session_id: ctx.session_id },
      {
        answers: { areaSqm: 20 },
      }
    );

    expect(await checksOf(ctx.user.id)).toHaveLength(2);
  });

  it("updates the requested check, not the most recently changed draft", async () => {
    const ctx = await loggedInChecker();
    const secondSid = await createAnonymousSession();

    // A (older) and B (newer)
    await call("PUT", "/answers", as(ctx), { answers: { areaSqm: 10 } });
    await call(
      "PUT",
      "/answers",
      { sid: secondSid, session_id: ctx.session_id },
      {
        answers: { areaSqm: 20 },
      }
    );
    const [a, b] = (await checksOf(ctx.user.id)).sort(
      (x, y) => x.createdAt.getTime() - y.createdAt.getTime()
    );

    // edit A through the second session
    const res = await call(
      "PUT",
      "/answers",
      { sid: secondSid, session_id: ctx.session_id },
      {
        answers: { areaSqm: 99 },
        checkId: a!.id,
      }
    );
    expect(res.status).toBe(200);

    const rows = await checksOf(ctx.user.id);
    const area = (id: string) =>
      (rows.find((r) => r.id === id)!.formData as { areaSqm: number }).areaSqm;
    expect(rows).toHaveLength(2);
    expect(area(a!.id)).toBe(99);
    expect(area(b!.id)).toBe(20); // unchanged
  });

  it("evaluate completes the linked check instead of creating a duplicate", async () => {
    const ctx = await loggedInChecker();

    await call("PUT", "/answers", as(ctx), { answers: completeAnswers() });
    const res = await call("POST", "/evaluate", as(ctx));
    expect(res.status).toBe(200);

    const rows = await checksOf(ctx.user.id);
    expect(rows).toHaveLength(1);
    expect(rows[0]!.status).toBe("completed");
    expect(rows[0]!.result).not.toBeNull();
  });

  it("editing a completed check turns it back into a draft without result", async () => {
    const ctx = await loggedInChecker();
    await call("PUT", "/answers", as(ctx), { answers: completeAnswers() });
    await call("POST", "/evaluate", as(ctx));

    await call("PUT", "/answers", as(ctx), {
      answers: { ...completeAnswers(), areaSqm: 81 },
    });

    const [row] = await checksOf(ctx.user.id);
    expect(row!.status).toBe("draft");
    expect(row!.result).toBeNull();
  });

  it("rejects the checkId of another user and leaves that check untouched", async () => {
    const ctx = await loggedInChecker();
    const other = await createUser("other@example.com");
    const [foreign] = await db
      .insert(checks)
      .values({ userId: other.id, formData: { areaSqm: 5 } })
      .returning();

    const res = await call("PUT", "/answers", as(ctx), {
      answers: { areaSqm: 99 },
      checkId: foreign!.id,
    });
    expect(res.status).toBe(404);

    const [after] = await checksOf(other.id);
    expect((after!.formData as { areaSqm: number }).areaSqm).toBe(5);
  });

  it("creates a new check when the linked check was soft-deleted", async () => {
    const ctx = await loggedInChecker();
    await call("PUT", "/answers", as(ctx), { answers: { areaSqm: 10 } });
    await db.update(checks).set({ deletedAt: new Date() });

    const res = await call("PUT", "/answers", as(ctx), {
      answers: { areaSqm: 20 },
    });
    expect(res.status).toBe(200);

    const rows = await checksOf(ctx.user.id);
    expect(rows).toHaveLength(2);
    expect(rows.filter((r) => r.deletedAt === null)).toHaveLength(1);
  });

  it("does not touch checks for anonymous users", async () => {
    const sid = await createAnonymousSession();
    await call("PUT", "/answers", { sid }, { answers: { areaSqm: 10 } });
    expect(await db.select().from(checks)).toHaveLength(0);
  });
});
