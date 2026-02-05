import { pgTable, uuid, text, timestamp, jsonb, integer, boolean } from "drizzle-orm/pg-core";

// ===== USERS =====
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  emailVerified: boolean("email_verified").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

// ===== CHECKS =====
export const checks = pgTable("checks", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),  // ← Foreign Key! ✅
  
  status: text("status", { enum: ["draft", "completed"] })
    .notNull()
    .default("draft"),
  
  currentStep: text("current_step").notNull().default("0"),
  formData: jsonb("form_data").notNull().default({}),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

// ===== FILES =====
export const files = pgTable("files", {
  id: uuid("id").primaryKey().defaultRandom(),
  checkId: uuid("check_id")
    .notNull()
    .references(() => checks.id, { onDelete: "cascade" }),  // ← Foreign Key!
  
  fileType: text("file_type", { 
    enum: ["lageplan", "grundriss", "schnittplan", "betriebsbeschreibung", "abfallkonzept", "other"] 
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

// ===== SESSIONS =====
export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  
  expiresAt: timestamp("expires_at").notNull(),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
