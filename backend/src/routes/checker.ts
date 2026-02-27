import { Hono } from "hono";
import type { Variables } from "../types/hono.js";
import { db } from "../db/index.js";
import { checkerSessions } from "../db/schema/checker.js";
import { eq } from "drizzle-orm";
import { z } from "zod";

import {
  CHECKER_COOKIE_NAME,
  createSid,
  hashSid,
  readSid,
  setSidCookie,
  clearSidCookie,
  computeExpiresAt,
} from "../utils/checkerSession.js";

import {
  evaluate,
  SectorValues,
  HospitalitySubtypeValues,
  WorkshopSubtypeValues,
  OperatingPatternValues,
} from "../services/checker/evaluate.js";

const checkerRouter = new Hono<{ Variables: Variables }>();

// --- Validation (strict: reject unknown keys) ---
const answersSchema = z
  .object({
    sector: z.enum(SectorValues).optional(),
    hospitalitySubtype: z.enum(HospitalitySubtypeValues).optional(),
    workshopSubtype: z.enum(WorkshopSubtypeValues).optional(),

    areaSqm: z.number().int().min(0).optional(),
    personCount: z.number().int().min(0).optional(),

    isStationary: z.boolean().optional(),
    isOnlyTemporary: z.boolean().optional(),

    bedCount: z.number().int().min(0).optional(),
    buildingUseExclusive: z.boolean().optional(),
    hasWellnessFacilities: z.boolean().optional(),
    servesFullMeals: z.boolean().optional(),

    zoningClarified: z.boolean().optional(),
    buildingConsentPresent: z.boolean().optional(),

    operatingPattern: z.enum(OperatingPatternValues).optional(),
    hasExternalVentilation: z.boolean().optional(),
    storesRegulatedHazardous: z.boolean().optional(),
    storesLabelledHazardous: z.boolean().optional(),
    usesLoudMusic: z.boolean().optional(),
    ippcOrSevesoRelevant: z.boolean().optional(),

    expectedImpairments: z.boolean().optional(),
    locatedInInfrastructureSite: z.boolean().optional(),
    locatedInApprovedComplex: z.boolean().optional(),
    existingPermitHistory: z.boolean().optional(),
  })
  .strict();

const patchSchema = z
  .object({
    answers: answersSchema,
  })
  .strict();

function isExpired(expiresAt: Date) {
  return expiresAt.getTime() <= Date.now();
}

function toState(row: any) {
  return {
    sessionId: row.id,
    status: row.status,
    answers: row.answers ?? {},
    result: row.result ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    expiresAt: row.expiresAt,
  };
}

// POST /api/checker/session
checkerRouter.post("/session", async (c) => {
  // try reuse cookie if it points to an existing non-expired session
  const sid = readSid(c);
  if (sid) {
    const sidHash = hashSid(sid);

    const [existing] = await db
      .select()
      .from(checkerSessions)
      .where(eq(checkerSessions.sidHash, sidHash))
      .limit(1);

    if (existing && !isExpired(existing.expiresAt)) {
      const [updated] = await db
        .update(checkerSessions)
        .set({
          updatedAt: new Date(),
          expiresAt: computeExpiresAt(),
        })
        .where(eq(checkerSessions.id, existing.id))
        .returning();
        if (!updated) return c.json({ error: "Unexpected: no row returned" }, 500);

      setSidCookie(c, sid);
      return c.json(toState(updated), 200);
    }
  }

  // create new session (rotate sid)
  const newSid = createSid();
  const sidHash = hashSid(newSid);

  const [created] = await db
    .insert(checkerSessions)
    .values({
      sidHash,
      status: "draft",
      answers: {},
      result: null,
      expiresAt: computeExpiresAt(),
    })
    .returning();

  setSidCookie(c, newSid);
  return c.json(toState(created), 200);
});

// GET /api/checker/state
checkerRouter.get("/state", async (c) => {
  const sid = readSid(c);
  if (!sid) return c.json({ error: "Missing session cookie" }, 401);

  const sidHash = hashSid(sid);
  const [existing] = await db
    .select()
    .from(checkerSessions)
    .where(eq(checkerSessions.sidHash, sidHash))
    .limit(1);

  if (!existing) return c.json({ error: "Session not found" }, 404);
  if (isExpired(existing.expiresAt)) {
    await db.delete(checkerSessions).where(eq(checkerSessions.id, existing.id));
    clearSidCookie(c);
    return c.json({ error: "Session expired" }, 404);
  }

  return c.json(toState(existing), 200);
});

// PATCH /api/checker/answers
checkerRouter.patch("/answers", async (c) => {
  try {
    const sid = readSid(c);
    if (!sid) return c.json({ error: "Missing session cookie" }, 401);

    const sidHash = hashSid(sid);
    const [existing] = await db
      .select()
      .from(checkerSessions)
      .where(eq(checkerSessions.sidHash, sidHash))
      .limit(1);

    if (!existing) return c.json({ error: "Session not found" }, 404);
    if (isExpired(existing.expiresAt)) {
      await db.delete(checkerSessions).where(eq(checkerSessions.id, existing.id));
      clearSidCookie(c);
      return c.json({ error: "Session expired" }, 404);
    }

    const body = await c.req.json();
    const data = patchSchema.parse(body);

    const nextAnswers = { ...(existing.answers ?? {}), ...data.answers };

    const [updated] = await db
      .update(checkerSessions)
      .set({
        answers: nextAnswers,
        updatedAt: new Date(),
        expiresAt: computeExpiresAt(),
      })
      .where(eq(checkerSessions.id, existing.id))
      .returning();
    if (!updated) return c.json({ error: "Unexpected: no row returned" }, 500);
    return c.json(toState(updated), 200);
  } catch (err) {
    if (err instanceof z.ZodError) return c.json({ error: err.issues }, 400);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// POST /api/checker/evaluate
checkerRouter.post("/evaluate", async (c) => {
  const sid = readSid(c);
  if (!sid) return c.json({ error: "Missing session cookie" }, 401);

  const sidHash = hashSid(sid);
  const [existing] = await db
    .select()
    .from(checkerSessions)
    .where(eq(checkerSessions.sidHash, sidHash))
    .limit(1);

  if (!existing) return c.json({ error: "Session not found" }, 404);
  if (isExpired(existing.expiresAt)) {
    await db.delete(checkerSessions).where(eq(checkerSessions.id, existing.id));
    clearSidCookie(c);
    return c.json({ error: "Session expired" }, 404);
  }

  const result = evaluate(existing.answers ?? {});

  const [updated] = await db
    .update(checkerSessions)
    .set({
      status: "finished",
      result,
      updatedAt: new Date(),
      expiresAt: computeExpiresAt(),
    })
    .where(eq(checkerSessions.id, existing.id))
    .returning();

    if(!updated) {
      return c.json({ error: "Session not found" }, 404);
    }
  return c.json(updated.result ?? result, 200);
});

// DELETE /api/checker/session
checkerRouter.delete("/session", async (c) => {
  const sid = readSid(c);
  if (!sid) return c.json({ error: "Missing session cookie" }, 401);

  const sidHash = hashSid(sid);
  const [existing] = await db
    .select()
    .from(checkerSessions)
    .where(eq(checkerSessions.sidHash, sidHash))
    .limit(1);

  if (existing) {
    await db.delete(checkerSessions).where(eq(checkerSessions.id, existing.id));
  }

  clearSidCookie(c);
  return c.body(null, 204);
});

export default checkerRouter;