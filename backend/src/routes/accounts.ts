import { Hono } from "hono";
import { db } from "../db/index.js";
import { users, sessions } from "../db/schema/index.js";
import { eq, and, ne } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { HTTPException } from "hono/http-exception";
import type { Variables } from "../types/hono.js";
import { z } from "zod";

const account = new Hono<{ Variables: Variables }>();

// Alle Routes brauchen Auth
account.use("*", authMiddleware);

// POST /api/account/change-password
account.post("/change-password", async (c) => {
  const userId = c.get("userId");
  const { currentPassword, newPassword } = await c.req.json();

  if (!currentPassword || !newPassword) {
    throw new HTTPException(400, { message: "Both passwords required" });
  }

  if (typeof newPassword !== "string" || newPassword.length < 8) {
    throw new HTTPException(400, { message: "New password must be at least 8 characters" });
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    throw new HTTPException(404, { message: "User not found" });
  }

  const valid = await verifyPassword(user.passwordHash, currentPassword);
  if (!valid) {
    throw new HTTPException(401, { message: "Current password is incorrect" });
  }

  const passwordHash = await hashPassword(newPassword);
  await db
    .update(users)
    .set({ passwordHash, updatedAt: new Date() })
    .where(eq(users.id, userId));

  // Alle ANDEREN Sessions invalidieren (aktuelle bleibt)
  const sessionId = c.get("sessionId");
  await db
    .delete(sessions)
    .where(
      and(
        eq(sessions.userId, userId),
        ne(sessions.id, sessionId)
      )
    );

  return c.json({ message: "Password changed" });
});

// GET /api/account/sessions — aktive Sessions auflisten
account.get("/sessions", async (c) => {
  const userId = c.get("userId");
  const currentSessionId = c.get("sessionId");

  const userSessions = await db
    .select({
      id: sessions.id,
      createdAt: sessions.createdAt,
      expiresAt: sessions.expiresAt,
    })
    .from(sessions)
    .where(eq(sessions.userId, userId))
    .orderBy(sessions.createdAt);

  return c.json({
    sessions: userSessions.map((s) => ({
      ...s,
      isCurrent: s.id === currentSessionId,
    })),
  });
});

// DELETE /api/account/sessions/:id — einzelne Session beenden
account.delete("/sessions/:id", async (c) => {
  const userId = c.get("userId");
  const sessionId = c.req.param("id");
  const currentSessionId = c.get("sessionId");

  if (sessionId === currentSessionId) {
    throw new HTTPException(400, { message: "Cannot delete current session. Use logout instead." });
  }

  const [deleted] = await db
    .delete(sessions)
    .where(
      and(
        eq(sessions.id, sessionId),
        eq(sessions.userId, userId)
      )
    )
    .returning({ id: sessions.id });

  if (!deleted) {
    throw new HTTPException(404, { message: "Session not found" });
  }

  return c.json({ message: "Session deleted" });
});

// DELETE /api/account — Account löschen
account.delete("/", async (c) => {
  const userId = c.get("userId");
  const { password } = await c.req.json();

  if (!password) {
    throw new HTTPException(400, { message: "Password required" });
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    throw new HTTPException(404, { message: "User not found" });
  }

  const valid = await verifyPassword(user.passwordHash, password);
  if (!valid) {
    throw new HTTPException(401, { message: "Password is incorrect" });
  }

  // Cascade löscht Sessions, Checks, Files automatisch
  await db.delete(users).where(eq(users.id, userId));

  return c.json({ message: "Account deleted" });
});

export default account;