import { Hono } from "hono";
import { db } from "../db/index.js";
import { users } from "../db/schema/index.js";
import { registerSchema, loginSchema } from "../types/auth.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { eq } from "drizzle-orm";

const auth = new Hono();

// POST /api/auth/register
auth.post("/register", async (c) => {
  try {
    const body = await c.req.json();
    const data = registerSchema.parse(body);

    // Check if email exists
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);

    if (existing.length > 0) {
      return c.json({ error: "Email already exists" }, 400);
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

    return c.json({ user: newUser }, 201);
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ error: error.message }, 400);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
});

// POST /api/auth/login
auth.post("/login", async (c) => {
  try {
    const body = await c.req.json();
    const data = loginSchema.parse(body);

    // Find user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);

    if (!user) {
      return c.json({ error: "Invalid credentials" }, 401);
    }

    // Verify password
    const valid = await verifyPassword(user.passwordHash, data.password);
    if (!valid) {
      return c.json({ error: "Invalid credentials" }, 401);
    }

    return c.json({
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ error: error.message }, 400);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default auth;