// migration before the run
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { TEST_DATABASE_URL } from "./testDb.ts";

export default async function setup() {
  if (!TEST_DATABASE_URL.includes("test")) {
    throw new Error(
      `Refusing to run integration tests against "${TEST_DATABASE_URL}"`
    );
  }

  const client = postgres(TEST_DATABASE_URL, { max: 1, connect_timeout: 5 });
  try {
    await client`select 1`;
  } catch (error) {
    await client.end({ timeout: 1 });
    throw new Error(
      "Cannot reach the test database. Start it with: docker compose up -d db-test\n" +
        `(${TEST_DATABASE_URL})`,
      { cause: error }
    );
  }
  await migrate(drizzle(client), { migrationsFolder: "./drizzle" });
  await client.end();
}
