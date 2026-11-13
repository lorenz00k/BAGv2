import { Hono } from "hono";
import { db } from "../db/index.js";
import { users, sessions } from "../db/schema/index.js";
import { eq, and, ne } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { HTTPException } from "hono/http-exception";
import type { Variables } from "../types/hono.js";
import { deleteCookie } from "hono/cookie";
import { hashSessionId } from "../utils/session.js";
import { z } from "zod";
import { changePasswordSchema } from "../types/auth.js";

const account = new Hono<{ Variables: Variables }>();

// Alle Routes brauchen Auth
account.use("*", authMiddleware);

// POST /api/account/change-password
account.post("/change-password", async (c) => {
  const userId = c.get("userId");
  const { currentPassword, newPassword } = changePasswordSchema.parse(
    await c.req.json()
  );

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

  await db.transaction(async (tx) => {
    await tx
      .update(users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(users.id, userId));

    // end all OTHER sessions (the current one stays)
    await tx
      .delete(sessions)
      .where(
        and(
          eq(sessions.userId, userId),
          ne(sessions.id, hashSessionId(c.get("sessionId")))
        )
      );
  });

  return c.json({ message: "Password changed" });
});

// GET /api/account/sessions — aktive Sessions auflisten
account.get("/sessions", async (c) => {
  const userId = c.get("userId");
  const currentHash = hashSessionId(c.get("sessionId"));

  const userSessions = await db
    .select({
      hashedId: sessions.id,
      publicId: sessions.publicId,
      createdAt: sessions.createdAt,
      expiresAt: sessions.expiresAt,
    })
    .from(sessions)
    .where(eq(sessions.userId, userId))
    .orderBy(sessions.createdAt);

  return c.json({
    sessions: userSessions.map(({ hashedId, publicId, ...rest }) => ({
      id: publicId,
      ...rest,
      isCurrent: hashedId === currentHash,
    })),
  });
});

// DELETE /api/account/sessions/:id — einzelne Session beenden
account.delete("/sessions/:id", async (c) => {
  const userId = c.get("userId");
  const publicId = c.req.param("id");

  //check for trash values
  if (!z.uuid().safeParse(publicId).success) {
    throw new HTTPException(404, { message: "Session not found" });
  }

  const [target] = await db
    .select({ id: sessions.id })
    .from(sessions)
    .where(and(eq(sessions.publicId, publicId), eq(sessions.userId, userId)))
    .limit(1);

  if (!target) {
    throw new HTTPException(404, { message: "Session not found" });
  }

  if (target.id === hashSessionId(c.get("sessionId"))) {
    throw new HTTPException(400, {
      message: "Cannot delete current session. Use logout instead.",
    });
  }
  await db.delete(sessions).where(eq(sessions.id, target.id));

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
  deleteCookie(c, "session_id", { path: "/" });

  return c.json({ message: "Account deleted" });
});

export default account;
