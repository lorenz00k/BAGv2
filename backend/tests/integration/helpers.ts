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

// Builds the Cookie header for the next request.
export function withCookie(name: string, value: string): HeadersInit {
  return { Cookie: `${name}=${value}` };
}
