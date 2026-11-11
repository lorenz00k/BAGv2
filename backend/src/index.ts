import { serve } from "@hono/node-server";
import app from "./app.js";
import { cleanupExpiredSessions } from "./utils/session.js";
import { cleanupExpiredCheckerSessions } from "./utils/checkerSession.js";

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

// Port comes from .env (loaded in app.ts)
const port = Number(process.env.PORT);

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    console.log(`Server läuft unter http://localhost:${info.port}`);
  }
);
