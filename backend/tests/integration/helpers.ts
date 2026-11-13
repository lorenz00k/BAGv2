import { sql } from "drizzle-orm";
import { db } from "../../src/db/index.js";

// Empties every table in the public schema. Migration bookkeeping lives in the "drizzle" schema and stays untouched.
export async function resetDatabase() {
  const [current] = await db.execute(sql`select current_database() as name`);
  if (current?.name !== "bag_test") {
    throw new Error(`Refusing to reset database "${String(current?.name)}"`);
  }

  const tables = await db.execute(
    sql`select tablename from pg_tables where schemaname = 'public'`
  );
  const names = tables.map((row) => `"${String(row.tablename)}"`).join(", ");
  if (names) {
    await db.execute(
      sql.raw(`truncate table ${names} restart identity cascade`)
    );
  }
}

// Reads the value of a cookie from a response, undefined if not set.
export function getCookie(res: Response, name: string): string | undefined {
  const header = res.headers
    .getSetCookie()
    .find((c) => c.startsWith(`${name}=`));
  return header?.split(";")[0]?.slice(name.length + 1);
}

// Runs fn while every DELETE on the table fails, like a lost connection would.
export async function withBlockedDeletes<T>(
  table: string,
  fn: () => Promise<T>
): Promise<T> {
  const name = `block_delete_${table}`;
  await db.execute(
    sql.raw(
      `CREATE OR REPLACE FUNCTION ${name}() RETURNS trigger AS $$
     BEGIN RAISE EXCEPTION 'delete blocked for test'; END; $$ LANGUAGE plpgsql`
    )
  );
  await db.execute(
    sql.raw(
      `CREATE TRIGGER ${name} BEFORE DELETE ON ${table}
     FOR EACH ROW EXECUTE FUNCTION ${name}()`
    )
  );
  try {
    return await fn();
  } finally {
    await db.execute(sql.raw(`DROP TRIGGER ${name} ON ${table}`));
    await db.execute(sql.raw(`DROP FUNCTION ${name}()`));
  }
}
