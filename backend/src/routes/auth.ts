import { Hono } from "hono";
import { db } from "../db/index.js";
import { sessions, users, verificationTokens } from "../db/schema/index.js";
import { registerSchema, loginSchema } from "../types/auth.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { and, eq } from "drizzle-orm";
import { getCookie, setCookie } from "hono/cookie";
import { createSession } from "../utils/session.js";
import { deleteCookie } from "hono/cookie";
import { deleteSession } from "../utils/session.js";
import { authMiddleware } from "../middleware/auth.js";
import type { Variables } from "../types/hono.js";
import { forgotPasswordRateLimiter, loginRateLimiter, registerRateLimiter, resendVerificationRateLimiter, resetPasswordRateLimiter, verifyEmailRateLimiter } from "../middleware/rate-limit.js";
import { HTTPException } from "hono/http-exception";
import { clearSidCookie, readSid } from "../utils/checkerSession.js";
import { mergeAnonymousChecker } from "../utils/sessionMerge.js";
import { createVerificationToken, verifyToken } from "@/utils/verificationToken.js";
import { sendPasswordResetEmail, sendVerificationEmail } from "@/utils/email.js";


const auth = new Hono<{ Variables: Variables }>();

// POST /api/auth/register
auth.post("/register", registerRateLimiter, async (c) => {
  const body = await c.req.json();
  const data = registerSchema.parse(body);

  // Check if email exists
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, data.email))
    .limit(1);

  if (existing.length > 0) {
    throw new HTTPException(400, { message: "Email already exists" });
  }

  // Hash password & create user
  const passwordHash = await hashPassword(data.password);
  const [newUser] = await db
    .insert(users)
    .values({
      email: data.email,
      passwordHash,
    })
    .returning({ id: users.id, email: users.email });

  if (!newUser) {
    throw new HTTPException(500, { message: "User creation failed" });
  }
  // direkt einloggen:
  const sessionId = await createSession(newUser.id);
  setCookie(c, "session_id", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    maxAge: 30 * 24 * 60 * 60,
    path: "/",
  });

  // Anonyme Checker-Session migrieren
  const sid = readSid(c);
  await mergeAnonymousChecker(sid, newUser.id);
  clearSidCookie(c);

  // Verification-Email senden
  const token = await createVerificationToken(newUser.id, "email_verification");
  await sendVerificationEmail(data.email, token);

  return c.json({ user: newUser }, 201);
});

// POST /api/auth/login (ERSETZEN)
auth.post("/login", loginRateLimiter, async (c) => {
  const body = await c.req.json();
  const data = loginSchema.parse(body);

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, data.email))
    .limit(1);

  if (!user) {
    throw new HTTPException(401, { message: "Invalid credentials" });
  }

  const valid = await verifyPassword(user.passwordHash, data.password);
  if (!valid) {
    throw new HTTPException(401, { message: "Invalid credentials" });
  }

  // Session erstellen
  const sessionId = await createSession(user.id);

  // Cookie setzen
  setCookie(c, "session_id", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    maxAge: 30 * 24 * 60 * 60, // 30 Tage
    path: "/",
  });

  //session merge: get anonymous data 
  const sid = readSid(c)
  await mergeAnonymousChecker(sid, user.id);
  clearSidCookie(c);

  return c.json({
    user: {
      id: user.id,
      email: user.email,
    },
  });
});

// POST /api/auth/logout
auth.post("/logout", async (c) => {
  const sessionId = getCookie(c, "session_id")
  if (sessionId) {
    await deleteSession(sessionId).catch(() => { });
  }

  deleteCookie(c, "session_id", {
    path: "/",
  });
  //damit daten nach logout nicht mehr angezeigt werden
  clearSidCookie(c);

  return c.json({ message: "Logged out" });
});

// GET /api/auth/me — aktuelle Session prüfen
auth.get("/me", authMiddleware, async (c) => {
  const userId = c.get("userId");
  const [user] = await db
    .select({ id: users.id, email: users.email, emailVerified: users.emailVerified })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    throw new HTTPException(404, { message: "User not found" });
  }

  return c.json({ user });
});

// POST /api/auth/verify-email 
auth.post("/verify-email", verifyEmailRateLimiter, async (c) => {
  const { token } = await c.req.json();

  if (!token || typeof token !== "string") {
    throw new HTTPException(400, { message: "Token required" });
  }

  const record = await verifyToken(token, "email_verification");
  if (!record) {
    throw new HTTPException(400, { message: "Invalid or expired token" });
  }

  await db
    .update(users)
    .set({ emailVerified: true, updatedAt: new Date() })
    .where(eq(users.id, record.userId));

  return c.json({ message: "Email verified" });
});

//  POST /api/auth/resend-verification
auth.post("/resend-verification", authMiddleware, resendVerificationRateLimiter, async (c) => {
  const userId = c.get("userId");

  const [user] = await db
    .select({ id: users.id, email: users.email, emailVerified: users.emailVerified })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    throw new HTTPException(404, { message: "User not found" });
  }

  if (user.emailVerified) {
    return c.json({ message: "Already verified" });
  }

  // Alte Tokens löschen
  await db
    .delete(verificationTokens)
    .where(
      and(
        eq(verificationTokens.userId, userId),
        eq(verificationTokens.type, "email_verification")
      )
    );

  const token = await createVerificationToken(userId, "email_verification");
  await sendVerificationEmail(user.email, token);

  return c.json({ message: "Verification email sent" });
});

// POST /api/auth/forgot-password
auth.post("/forgot-password", forgotPasswordRateLimiter, async (c) => {
  const { email } = await c.req.json();

  if (!email || typeof email !== "string") {
    throw new HTTPException(400, { message: "Email required" });
  }

  // User suchen — aber NICHT verraten ob die Email existiert
  const [user] = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (user) {
    // Alte Reset-Tokens löschen
    await db
      .delete(verificationTokens)
      .where(
        and(
          eq(verificationTokens.userId, user.id),
          eq(verificationTokens.type, "password_reset")
        )
      );

    const token = await createVerificationToken(user.id, "password_reset");
    await sendPasswordResetEmail(user.email, token);
  }

  // Immer gleiche Antwort — verhindert Email-Enumeration
  return c.json({ message: "If the email exists, a reset link has been sent." });
});

// POST /api/auth/reset-password
auth.post("/reset-password", resetPasswordRateLimiter, async (c) => {
  const { token, password } = await c.req.json();

  if (!token || typeof token !== "string") {
    throw new HTTPException(400, { message: "Token required" });
  }

  if (!password || typeof password !== "string" || password.length < 8) {
    throw new HTTPException(400, { message: "Password must be at least 8 characters" });
  }

  const record = await verifyToken(token, "password_reset");
  if (!record) {
    throw new HTTPException(400, { message: "Invalid or expired token" });
  }

  // Neues Passwort setzen
  const passwordHash = await hashPassword(password);
  await db
    .update(users)
    .set({ passwordHash, updatedAt: new Date() })
    .where(eq(users.id, record.userId));

  // Alle Sessions dieses Users invalidieren
  await db
    .delete(sessions)
    .where(eq(sessions.userId, record.userId));

  return c.json({ message: "Password reset successful" });
});

export default auth;