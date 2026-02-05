import { config } from "dotenv";
import { serve } from "@hono/node-server";
import { Hono } from "hono";

//Importiert deine Route (.js weil ES Modules das braucht, auch wenn die Datei .ts heißt)
import health from "./routes/health.js";
import auth from "./routes/auth.js";
import { logger } from "./middleware/logger.js";
import { corsMiddleware } from "./middleware/cors.js";
import { errorHandler } from "./middleware/error-handler.js";
import user from "./routes/user.js";
import { cleanupExpiredSessions } from "./utils/session.js";
import { globalRateLimiter } from "./middleware/rate-limit.js";
import checksRouter from "./routes/checks.js"; 
import viennagis from "./routes/viennagis.js"; 

config();

//reihenfolge ist wichtig!!! Request → Logger → CORS → Route also middleware vor routing

//Hono : Erstellt App-Instanz
const app = new Hono();

//Middleware einsetzten
app.use(logger);
app.use(corsMiddleware);
app.route("/api/auth", auth); 
app.use(globalRateLimiter); 


app.route("/api/user", user);  
app.route("/api/checks", checksRouter);
app.route("/api/viennagis", viennagis); 

//error handel
app.onError(errorHandler);

//Alles in health.ts ist jetzt unter /health erreichbar
app.route("/health", health);

// Cleanup beim Start
cleanupExpiredSessions()
  .then((count) => console.log(`Cleaned up ${count} expired sessions`))
  .catch((err) => console.error("Cleanup error:", err));

// Cleanup alle 24 Stunden
setInterval(() => {
  cleanupExpiredSessions()
    .then((count) => console.log(`Cleaned up ${count} expired sessions`))
    .catch((err) => console.error("Cleanup error:", err));
}, 24 * 60 * 60 * 1000);

//Route definieren: Definiert: Bei GET-Request auf "/" führe diese Funktion aus
// c = Das "Context"-Objekt – enthält Request-Infos und Response-Methoden
app.get("/", (c) => {
  return c.text("Backend läuft hoffentlich..."); // Sendet eine Text-Antwort zurück
});

//Nimmt sich die Port variable aus .env
const port = Number(process.env.PORT);

// Startet den Server auf Port 3000
serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    console.log(`Server läuft unter http://localhost:${info.port}`);
  }
);
