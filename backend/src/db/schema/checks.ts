import { users } from "./auth.js";
import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  integer,
} from "drizzle-orm/pg-core";

// ===== CHECKS =====  Daten, die nach Login aus checker-session an userId gebunden werden
export const checks = pgTable("checks", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  status: text("status", { enum: ["draft", "completed"] })
    .notNull()
    .default("draft"),

  currentStep: text("current_step").notNull().default("0"),
  formData: jsonb("form_data").notNull().default({}),
  result: jsonb("result"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

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
  checkId: uuid("check_id").references(() => checks.id, { onDelete: "set null" }),
});

// ===== FILES =====
export const files = pgTable("files", {
  id: uuid("id").primaryKey().defaultRandom(),
  checkId: uuid("check_id")
    .notNull()
    .references(() => checks.id, { onDelete: "cascade" }), // ← Foreign Key!

  fileType: text("file_type", {
    enum: [
      "lageplan",
      "grundriss",
      "schnittplan",
      "betriebsbeschreibung",
      "abfallkonzept",
      "other",
    ],
  }).notNull(),

  originalFilename: text("original_filename").notNull(),
  storedFilename: text("stored_filename").notNull(),
  mimeType: text("mime_type").notNull(),
  fileSize: integer("file_size").notNull(),
  sha256Hash: text("sha256_hash").notNull(),

  uploadIp: text("upload_ip"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});
