import { Hono } from "hono";
import type { Context } from "hono";
import type { Variables } from "../types/hono.js";
import { z } from "zod";

import {
  createSid,
  hashSid,
  readSid,
  setSidCookie,
  clearSidCookie,
  computeExpiresAt,
} from "../utils/checkerSession.js";

import { evaluate } from "../services/checker/evaluate.js";
import {
  answersSchema,
  saveAnswersSchema,
  normalizeAnswers,
  validateRequiredAnswers,
} from "../services/checker/checkerValidation.js";

import {
  type CheckerSessionRow,
  createDraftSession,
  deleteSessionById,
  findSessionBySidHash,
  finishSessionEvaluation,
  isExpired,
  replaceSessionAnswers,
  toState,
  touchSession,
} from "../services/checker/checkerSessionRepo.js";

const checkerRouter = new Hono<{ Variables: Variables }>();

async function requireActiveSession(
  c: Context
): Promise<Response | { sid: string; sidHash: string; row: CheckerSessionRow }> {
  const sid = readSid(c);
  if (!sid) {
    return c.json({ error: "Missing session cookie" }, 401);
  }

  const sidHash = hashSid(sid);
  const row = await findSessionBySidHash(sidHash);

  if (!row) {
    return c.json({ error: "Session not found" }, 404);
  }

  if (isExpired(row.expiresAt)) {
    await deleteSessionById(row.id);
    clearSidCookie(c);
    return c.json({ error: "Session expired" }, 404);
  }

  return { sid, sidHash, row };
}

// POST /api/checker/session
checkerRouter.post("/session", async (c) => {
  try {
    const sid = readSid(c);

    if (sid) {
      const sidHash = hashSid(sid);
      const existing = await findSessionBySidHash(sidHash);

      if (existing && !isExpired(existing.expiresAt)) {
        const updated = await touchSession(existing.id, computeExpiresAt());
        if (!updated) {
          return c.json({ error: "Unexpected: no row returned" }, 500);
        }

        setSidCookie(c, sid);
        return c.json(toState(updated), 200);
      }
    }

    const newSid = createSid();
    const sidHash = hashSid(newSid);
    const created = await createDraftSession(sidHash, computeExpiresAt());

    if (!created) {
      return c.json({ error: "Unexpected: no row returned" }, 500);
    }

    setSidCookie(c, newSid);
    return c.json(toState(created), 200);
  } catch (err) {
    console.error("checker/session error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// GET /api/checker/state
checkerRouter.get("/state", async (c) => {
  const active = await requireActiveSession(c);
  if (active instanceof Response) return active;

  return c.json(toState(active.row), 200);
});

// PUT /api/checker/answers
checkerRouter.put("/answers", async (c) => {
  try {
    const active = await requireActiveSession(c);
    if (active instanceof Response) return active;

    const body = await c.req.json();
    const data = saveAnswersSchema.parse(body);

    const normalizedAnswers = normalizeAnswers(data.answers);
    const updated = await replaceSessionAnswers(
      active.row.id,
      normalizedAnswers,
      computeExpiresAt()
    );

    if (!updated) {
      return c.json({ error: "Unexpected: no row returned" }, 500);
    }

    return c.json(toState(updated), 200);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return c.json(
        {
          message: "Validation failed",
          issues: err.issues,
        },
        400
      );
    }

    return c.json({ error: "Internal server error" }, 500);
  }
});

// POST /api/checker/evaluate
checkerRouter.post("/evaluate", async (c) => {
  try {
    const active = await requireActiveSession(c);
    if (active instanceof Response) return active;

    const normalizedAnswers = normalizeAnswers(
      (answersSchema.parse(active.row.answers ?? {}))
    );

    const issues = validateRequiredAnswers(normalizedAnswers);
    if (issues.length > 0) {
      return c.json(
        {
          message: "Validation failed",
          issues,
        },
        400
      );
    }

    const result = evaluate(normalizedAnswers);

    const updated = await finishSessionEvaluation(
      active.row.id,
      normalizedAnswers,
      result,
      computeExpiresAt()
    );

    if (!updated) {
      return c.json({ error: "Unexpected: no row returned" }, 500);
    }

    return c.json(updated.result ?? result, 200);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return c.json(
        {
          message: "Validation failed",
          issues: err.issues,
        },
        400
      );
    }

    return c.json({ error: "Internal server error" }, 500);
  }
});

// DELETE /api/checker/session
checkerRouter.delete("/session", async (c) => {
  const sid = readSid(c);
  if (!sid) {
    return c.json({ error: "Missing session cookie" }, 401);
  }

  const sidHash = hashSid(sid);
  const existing = await findSessionBySidHash(sidHash);

  if (existing) {
    await deleteSessionById(existing.id);
  }

  clearSidCookie(c);
  return c.body(null, 204);
});

export default checkerRouter;