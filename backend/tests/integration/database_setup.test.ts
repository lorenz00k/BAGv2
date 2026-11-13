import { describe, it, expect } from "vitest";
import { sql } from "drizzle-orm";
import { db } from "../../src/db/index.js";
import { env } from "../../src/env.js";
import { TEST_DATABASE_URL } from "./testDb.js";

describe("test database", () => {
  it("uses the test database", async () => {
    const rows = await db.execute(sql`select current_database() as name`);
    expect(rows[0]?.name).toBe("bag_test");
  });

  it("has the migrations applied", async () => {
    const rows = await db.execute(
      sql`select table_name from information_schema.tables where table_schema = 'public'`
    );
    const names = rows.map((row) => row.table_name);
    expect(names).toEqual(
      expect.arrayContaining([
        "users",
        "sessions",
        "verification_tokens",
        "checks",
        "files",
      ])
    );
  });

  it("points the app at the same database the tests prepare", () => {
    expect(env.DATABASE_URL).toBe(TEST_DATABASE_URL);
  });
});
