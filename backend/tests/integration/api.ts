import { vi } from "vitest";
import app from "../../src/app.js";
import { db } from "../../src/db/index.js";
import { users } from "../../src/db/schema/index.js";
import { hashPassword } from "../../src/utils/password.js";
import { getCookie } from "./helpers.js";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "../../src/utils/email.js";

export const EMAIL = "user@example.com";
export const PASSWORD = "correct-horse-battery";

export const post = (
  path: string,
  body: unknown,
  headers: Record<string, string> = {}
) =>
  app.request(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });

export const withSession = (sid: string) => ({ Cookie: `session_id=${sid}` });

// Creates a user directly in the database, faster than going through register
export async function createUser(email = EMAIL, password = PASSWORD) {
  const [user] = await db
    .insert(users)
    .values({ email, passwordHash: await hashPassword(password) })
    .returning();
  return user!;
}

// Logs in through the API and returns the session cookie value
export async function login(email = EMAIL, password = PASSWORD) {
  const res = await post("/api/auth/login", { email, password });
  const sid = getCookie(res, "session_id");
  if(!sid) throw new Error(`login failed (status ${res.status}): no session_id cookie`);
  return sid;
}

// Tokens of the last mails, as a user would read them from the inbox
export const lastVerificationToken = () =>
  vi.mocked(sendVerificationEmail).mock.calls.at(-1)?.[1] as string;
export const lastResetToken = () =>
  vi.mocked(sendPasswordResetEmail).mock.calls.at(-1)?.[1] as string;
