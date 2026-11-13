import { describe, it, expect } from "vitest";
import { eq } from "drizzle-orm";
import { db } from "../../src/db/index.js";
import { checks, users } from "../../src/db/schema/index.js";
import { checkerSessions } from "../../src/db/schema/checker.js";
import { createSid, hashSid } from "../../src/utils/checkerSession.js";
import { mergeAnonymousChecker } from "../../src/utils/sessionMerge.js";
import { getCookie } from "./helpers.js";
import { EMAIL, PASSWORD, post, createUser } from "./api.js";
import { withBlockedDeletes } from "./helpers.js";

// Creates an anonymous checker session like the checker page does and returns its cookie value
async function createAnonymousSession(
  answers: Record<string, unknown>,
  status: "draft" | "finished" = "draft"
) {
  const sid = createSid();
  await db.insert(checkerSessions).values({
    sidHash: hashSid(sid),
    status,
    answers,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
  });
  return sid;
}

const withSid = (sid: string) => ({ Cookie: `sid=${sid}` });

const userId = async () =>
  (await db.select().from(users).where(eq(users.email, EMAIL)))[0]!.id;

// The same merge must happen on both entry points
const entryPoints = [
  [
    "register",
    () =>
      post(
        "/api/auth/register",
        { email: EMAIL, password: PASSWORD },
        { Cookie: "" }
      ),
  ],
  [
    "login",
    async () => {
      await createUser();
      return post("/api/auth/login", { email: EMAIL, password: PASSWORD });
    },
  ],
] as const;

describe.each(entryPoints)("anonymous checker data after %s", (name) => {
  const enter = (sid?: string) => {
    const headers = sid ? withSid(sid) : {};
    return name === "register"
      ? post(
          "/api/auth/register",
          { email: EMAIL, password: PASSWORD },
          headers
        )
      : createUser().then(() =>
          post("/api/auth/login", { email: EMAIL, password: PASSWORD }, headers)
        );
  };

  it("saves a finished session as a completed check and removes the anonymous session", async () => {
    const answers = { betriebsart: "restaurant", flaeche: 80 };
    const sid = await createAnonymousSession(answers, "finished");

    const res = await enter(sid);
    expect(res.status).toBeLessThan(300);

    const rows = await db
      .select()
      .from(checks)
      .where(eq(checks.userId, await userId()));
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ status: "completed", formData: answers });
    expect(await db.select().from(checkerSessions)).toHaveLength(0);
  });

  it("saves an unfinished session as a draft", async () => {
    const sid = await createAnonymousSession({ betriebsart: "cafe" });
    await enter(sid);

    const rows = await db
      .select()
      .from(checks)
      .where(eq(checks.userId, await userId()));
    expect(rows[0]?.status).toBe("draft");
  });

  it("clears the anonymous cookie", async () => {
    const sid = await createAnonymousSession({ betriebsart: "cafe" });
    const res = await enter(sid);

    expect(getCookie(res, "sid")).toBe("");
  });

  it("creates no check for an anonymous session without answers", async () => {
    const sid = await createAnonymousSession({});
    await enter(sid);

    expect(await db.select().from(checks)).toHaveLength(0);
    expect(await db.select().from(checkerSessions)).toHaveLength(0);
  });

  it("works without an anonymous session", async () => {
    const res = await enter();
    expect(res.status).toBeLessThan(300);
    expect(await db.select().from(checks)).toHaveLength(0);
  });

  it("ignores an unknown anonymous session id", async () => {
    const res = await enter(createSid());
    expect(res.status).toBeLessThan(300);
    expect(await db.select().from(checks)).toHaveLength(0);
  });
});

describe("mergeAnonymousChecker transaction", () => {
  it("keeps the anonymous session when saving the check fails", async () => {
    const sid = await createAnonymousSession(
      { betriebsart: "restaurant" },
      "finished"
    );
    const unknownUser = "00000000-0000-0000-0000-000000000000";

    await expect(mergeAnonymousChecker(sid, unknownUser)).rejects.toThrow();

    expect(await db.select().from(checkerSessions)).toHaveLength(1);
  });

  it("creates only one check when merged twice in parallel", async () => {
    const user = await createUser();
    const sid = await createAnonymousSession(
      { betriebsart: "restaurant" },
      "finished"
    );

    await Promise.all(
      Array.from({ length: 10 }, () => mergeAnonymousChecker(sid, user.id))
    );

    expect(await db.select().from(checks)).toHaveLength(1);
  });

  it("saves nothing and keeps the anonymous session when deleting it fails", async () => {
    const user = await createUser();
    const sid = await createAnonymousSession(
      { betriebsart: "restaurant" },
      "finished"
    );

    await withBlockedDeletes("checker_sessions", () =>
      expect(mergeAnonymousChecker(sid, user.id)).rejects.toThrow()
    );

    expect(await db.select().from(checks)).toHaveLength(0);
    expect(await db.select().from(checkerSessions)).toHaveLength(1);
  });
});
