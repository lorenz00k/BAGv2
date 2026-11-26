import { Hono } from "hono";
import { isShuttingDown } from "../lifecycle.js";
import { db } from "../db/index.js";
import { sql } from "drizzle-orm";

const ready = new Hono();

ready.get("/", async (c) => {
  if (isShuttingDown()) {
    return c.json({ status: "shutting_down" }, 503);
  }
  try {
    await db.execute(sql`select 1`);
    return c.json({ status: "ready" });
  } catch {
    return c.json({ status: "unavailable" }, 503);
  }
});
export default ready;