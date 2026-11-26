import { serve } from "@hono/node-server";
import app from "./app.js";
import { cleanupExpiredSessions } from "./utils/session.js";
import { cleanupExpiredCheckerSessions } from "./utils/checkerSession.js";
import { env } from "./env.js";
import { isShuttingDown, markShuttingDown } from "./lifecycle.js";
import { client } from "./db/index.js";

// Cleanup on start
cleanupExpiredSessions()
  .then((count) => console.log(`Cleaned up ${count} expired sessions`))
  .catch((err) => console.error("Cleanup error:", err));

// Cleanup every 24 hours
setInterval(
  () => {
    cleanupExpiredSessions()
      .then((count) => console.log(`Cleaned up ${count} expired sessions`))
      .catch((err) => console.error("Cleanup error:", err));
  },
  24 * 60 * 60 * 1000
);

// cleanup checker session
cleanupExpiredCheckerSessions()
  .then((count) => console.log(`Cleaned up ${count} expired checker sessions`))
  .catch((err) => console.error("Checker cleanup error:", err));

setInterval(
  () => {
    cleanupExpiredCheckerSessions()
      .then((count) =>
        console.log(`Cleaned up ${count} expired checker sessions`)
      )
      .catch((err) => console.error("Checker cleanup error:", err));
  },
  24 * 60 * 60 * 1000
);

const server = serve(
  {
    fetch: app.fetch,
    port: env.PORT,
  },
  (info) => {
    console.log(`Server läuft unter http://localhost:${info.port}`);
  }
);

async function shutdown(signal: string) {
  if (isShuttingDown()) return;
  markShuttingDown();
  console.log(`${signal} received, is shutting down...`);


  //Shutdown on own after 8 seconds, before docker kills it with SIGKILL after 10 seconds 
  setTimeout(() => {
    console.error("Shutdown is taking to long, force exit");
    process.exit(1);
  }, 8_000).unref();

  server.close(async (err) => {
    try {
      await client.end({ timeout: 5 }); // DB-Verbindungen sauber schließen
    } finally {
      process.exit(err ? 1 : 0);
    }
  });
}

//catch exit's and handle them more graceful
process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));