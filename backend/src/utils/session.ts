import { db } from "../db/index.js";
import { sessions } from "../db/schema/index.js";
import { eq } from "drizzle-orm";  // ← gt entfernt

const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 Tage

export async function createSession(userId: string): Promise<string> {
  const expiresAt = new Date(Date.now() + SESSION_DURATION);
  
  const [session] = await db
    .insert(sessions)
    .values({ userId, expiresAt })
    .returning({ id: sessions.id });
  
  if (!session) {  // ← Safety check
    throw new Error("Failed to create session");
  }
  
  return session.id;
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

export async function deleteSession(sessionId: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}