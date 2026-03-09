import { pgTable, uuid, text, timestamp, jsonb } from "drizzle-orm/pg-core";


// ===== CHECKER SESSIONS (anonymous) =====
export const checkerSessions = pgTable("checker_sessions", {
    id: uuid("id").primaryKey().defaultRandom(),
    sidHash: text("sid_hash").notNull().unique(),
    status: text("status", { enum: ["draft", "finished"] })
    .notNull()
    .default("draft"),
    answers: jsonb("answers").notNull().default({}),
    result: jsonb("result"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    expiresAt: timestamp("expires_at").notNull(),
})