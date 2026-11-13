import { db } from "../db/index.js";
import { sessions } from "../db/schema/index.js";
import { eq } from "drizzle-orm";
import { randomBytes, createHash } from "crypto";
import { lt } from "drizzle-orm";

export const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60;
const SESSION_DURATION = SESSION_TTL_SECONDS * 1000; // 30 Tage

function generateSessionId(): string {
  return randomBytes(32).toString("base64url"); //  256 bits, URL-safe
}

// Fast, deterministic hash: the raw ID is random with 256 bits of entropy (no salt or slow KDF needed)
export function hashSessionId(rawId: string): string {
  return createHash("sha256").update(rawId).digest("hex");
}

export async function createSession(userId: string): Promise<string> {
  const rawSessionId = generateSessionId();
  const expiresAt = new Date(Date.now() + SESSION_DURATION);

  await db.insert(sessions).values({
    id: hashSessionId(rawSessionId), // hash is stored
    userId,
    expiresAt,
  });

  return rawSessionId;
}

export async function validateSession(rawSessionId: string) {
  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, hashSessionId(rawSessionId)))
    .limit(1);

  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await deleteSession(hashSessionId(rawSessionId));
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

export async function deleteSession(rawSessionId: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.id, hashSessionId(rawSessionId)));
}

export async function getUserIdFromSession(
  rawSessionId: string
): Promise<string | null> {
  const [session] = await db
    .select({ userId: sessions.userId })
    .from(sessions)
    .where(eq(sessions.id, hashSessionId(rawSessionId)))
    .limit(1);

  if (!session) return null;
  return session.userId;
}
