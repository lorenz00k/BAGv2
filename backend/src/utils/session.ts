import { db } from "../db/index.js";
import { sessions } from "../db/schema/index.js";
import { eq } from "drizzle-orm";
import { randomBytes } from "crypto";
import { lt } from "drizzle-orm";

const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 Tage

function generateSessionId(): string {
  return randomBytes(32).toString("base64url");  // ← 256 bits, URL-safe
}

export async function createSession(userId: string): Promise<string> {
  const sessionId = generateSessionId();
  const expiresAt = new Date(Date.now() + SESSION_DURATION);
  
  await db.insert(sessions).values({
    id: sessionId,  // ← Manuell gesetzt
    userId,
    expiresAt,
  });
  
  return sessionId;
}

export async function validateSession(sessionId: string) {
  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, sessionId))
    .limit(1);
  
  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await deleteSession(sessionId);
    return null;
  }
  
  return session;
}

// Löscht alle abgelaufenen Sessions
export async function cleanupExpiredSessions(): Promise<number> {
  const result = await db
    .delete(sessions)
    .where(lt(sessions.expiresAt, new Date()))
    .returning({ id: sessions.id });
  
  return result.length;
}

export async function deleteSession(sessionId: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}