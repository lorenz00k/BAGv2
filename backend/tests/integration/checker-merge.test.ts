import { describe, it, expect } from "vitest";
import { eq } from "drizzle-orm";
import { db } from "../../src/db/index.js";
import { checks, users } from "../../src/db/schema/index.js";
import { checkerSessions } from "../../src/db/schema/checker.js";
import { createSid, hashSid } from "../../src/utils/checkerSession.js";
import { getCookie } from "./helpers.js";
import { EMAIL, PASSWORD, post, createUser } from "./api.js";

// Creates an anonymous checker session like the checker page does and returns its cookie value
async function createAnonymousSession(answers: Record<string, unknown>, status: "draft" | "finished" = "draft") {
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

const userId = async () => (await db.select().from(users).where(eq(users.email, EMAIL)))[0]!.id;

describe.each([["register"], ["login"]])("anonymous checker data after %s", (name) => {
  const enter = (sid?: string) => {
    const headers = sid ? withSid(sid) : {};
    return name === "register"
      ? post("/api/auth/register", { email: EMAIL, password: PASSWORD }, headers)
      : createUser().then(() => post("/api/auth/login", { email: EMAIL, password: PASSWORD }, headers));
  };

  it("saves a finished session as a completed check and removes the anonymous session", async () => {
    const answers = { betriebsart: "restaurant", flaeche: 80 };
    const sid = await createAnonymousSession(answers, "finished");

    const res = await enter(sid);
    expect(res.status).toBeLessThan(300);

    const rows = await db.select().from(checks).where(eq(checks.userId, await userId()));
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ status: "completed", formData: answers });
    expect(await db.select().from(checkerSessions)).toHaveLength(0);
  });

  it("saves an unfinished session as a draft", async () => {
    const sid = await createAnonymousSession({ betriebsart: "cafe" });
    await enter(sid);

    const rows = await db.select().from(checks).where(eq(checks.userId, await userId()));
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