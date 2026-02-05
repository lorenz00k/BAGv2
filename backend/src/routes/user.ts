import { Hono } from "hono";
import type { Variables } from "../types/hono.js";
import { authMiddleware } from "../middleware/auth.js";
import { db } from "../db/index.js";
import { users } from "../db/schema/index.js";
import { eq } from "drizzle-orm";

const user = new Hono<{ Variables: Variables }>();

// Alle Routes hier brauchen Auth
user.use("*", authMiddleware);

// GET /api/user/me
user.get("/me", async (c) => {
  const userId = c.get("userId");
  
  const [currentUser] = await db
    .select({
      id: users.id,
      email: users.email,
      emailVerified: users.emailVerified,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  
  if (!currentUser) {
    return c.json({ error: "User not found" }, 404);
  }
  
  return c.json({ user: currentUser });
});

export default user;