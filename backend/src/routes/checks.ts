import { Hono } from "hono";
import type { Variables } from "../types/hono.js";
import { authMiddleware } from "../middleware/auth.js";
import { db } from "../db/index.js";
import { checks } from "../db/schema/index.js";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { complianceInputSchema } from "../types/compliance.js";
import { evaluateCompliance } from "../services/compliance/index.js";

const checksRouter = new Hono<{ Variables: Variables }>();

// Alle Routes brauchen Auth
checksRouter.use("*", authMiddleware);

// Validation Schema
const createCheckSchema = z.object({
  formData: z.record(z.string(), z.unknown()).optional().default({}),
  currentStep: z.string().optional().default("0"),
});

const updateCheckSchema = z.object({
  formData: z.record(z.string(), z.unknown()).optional(),  
  currentStep: z.string().optional(),
  status: z.enum(["draft", "completed"]).optional(),
});

// POST /api/checks - Neuen Check erstellen
checksRouter.post("/", async (c) => {
  try {
    const userId = c.get("userId");
    const body = await c.req.json();
    const data = createCheckSchema.parse(body);

    const [newCheck] = await db
      .insert(checks)
      .values({
        userId,
        formData: data.formData,
        currentStep: data.currentStep,
      })
      .returning();

    return c.json({ check: newCheck }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: error.issues }, 400);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
});

// GET /api/checks - Alle Checks des Users
checksRouter.get("/", async (c) => {
  const userId = c.get("userId");

  const userChecks = await db
    .select()
    .from(checks)
    .where(eq(checks.userId, userId))
    .orderBy(checks.createdAt);

  return c.json({ checks: userChecks });
});

// GET /api/checks/:id - Einzelner Check
checksRouter.get("/:id", async (c) => {
  const userId = c.get("userId");
  const checkId = c.req.param("id");

  const [check] = await db
    .select()
    .from(checks)
    .where(and(eq(checks.id, checkId), eq(checks.userId, userId)))
    .limit(1);

  if (!check) {
    return c.json({ error: "Check not found" }, 404);
  }

  return c.json({ check });
});

// PATCH /api/checks/:id - Check updaten (Auto-Save)
checksRouter.patch("/:id", async (c) => {
  try {
    const userId = c.get("userId");
    const checkId = c.req.param("id");
    const body = await c.req.json();
    const data = updateCheckSchema.parse(body);

    // Prüfen ob Check dem User gehört
    const [existing] = await db
      .select()
      .from(checks)
      .where(and(eq(checks.id, checkId), eq(checks.userId, userId)))
      .limit(1);

    if (!existing) {
      return c.json({ error: "Check not found" }, 404);
    }

    // Update
    const [updated] = await db
      .update(checks)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(checks.id, checkId))
      .returning();

    return c.json({ check: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: error.issues }, 400);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
});

// POST /api/checks/:id/evaluate - Compliance-Bewertung durchführen
checksRouter.post("/:id/evaluate", async (c) => {
  try {
    const userId = c.get("userId");
    const checkId = c.req.param("id");

    // Check laden + Ownership prüfen
    const [check] = await db
      .select()
      .from(checks)
      .where(and(eq(checks.id, checkId), eq(checks.userId, userId)))
      .limit(1);

    if (!check) {
      return c.json({ error: "Check not found" }, 404);
    }

    // FormData validieren
    const formData = check.formData as Record<string, unknown>;
    const validatedInput = complianceInputSchema.parse(formData);

    // Compliance evaluieren
    const result = evaluateCompliance(validatedInput);

    // Ergebnis in DB speichern + Status auf completed
    const [updated] = await db
      .update(checks)
      .set({
        formData: { ...formData, result },
        status: "completed",
        updatedAt: new Date(),
      })
      .where(eq(checks.id, checkId))
      .returning();

    return c.json({ result, check: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json(
        { error: "Invalid form data", issues: error.issues },
        400
      );
    }
    return c.json({ error: "Internal server error" }, 500);
  }
});

// DELETE /api/checks/:id - Check löschen
checksRouter.delete("/:id", async (c) => {
  const userId = c.get("userId");
  const checkId = c.req.param("id");

  const [deleted] = await db
    .delete(checks)
    .where(and(eq(checks.id, checkId), eq(checks.userId, userId)))
    .returning({ id: checks.id });

  if (!deleted) {
    return c.json({ error: "Check not found" }, 404);
  }

  return c.json({ message: "Check deleted", id: deleted.id });
});

export default checksRouter;