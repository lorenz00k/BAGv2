// utils/verificationToken.ts
import crypto from "node:crypto";
import { db } from "../db/index.js";
import { verificationTokens } from "../db/schema/index.js";
import { eq, and, gt } from "drizzle-orm";

export function generateToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function createVerificationToken(
  userId: string,
  type: "email_verification" | "password_reset"
): Promise<string> {
  const token = generateToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(
    Date.now() + (type === "email_verification" ? 24 * 60 * 60 * 1000 : 60 * 60 * 1000)
  );

  await db.insert(verificationTokens).values({
    userId,
    tokenHash,
    type,
    expiresAt,
  });

  return token;
}

export async function verifyToken(token: string, type: "email_verification" | "password_reset") {
  const tokenHash = hashToken(token);

  const [record] = await db
    .select()
    .from(verificationTokens)
    .where(
      and(
        eq(verificationTokens.tokenHash, tokenHash),
        eq(verificationTokens.type, type),
        gt(verificationTokens.expiresAt, new Date())
      )
    )
    .limit(1);

  if (!record) return null;

  // Token einmalig verwendbar — löschen
  await db.delete(verificationTokens).where(eq(verificationTokens.id, record.id));

  return record;
}