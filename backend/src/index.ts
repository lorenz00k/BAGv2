import {config} from "dotenv";
import {serve} from "@hono/node-server";
import {Hono} from "hono";

//Importiert deine Route (.js weil ES Modules das braucht, auch wenn die Datei .ts heißt)
import health from "./routes/health.js";
import {logger} from "./middleware/logger.js"
import { corsMiddleware } from "./middleware/cors.js";

config();

//reihenfolge ist wichtig!!! Request → Logger → CORS → Route also middleware vor routing

//Hono : Erstellt deine App-Instanz
const app = new Hono();

//Middleware einsetzten
app.use(logger);
app.use(corsMiddleware);

//Alles in health.ts ist jetzt unter /health erreichbar
app.route("/health", health);

//Route definieren: Definiert: Bei GET-Request auf "/" führe diese Funktion aus 
// c = Das "Context"-Objekt – enthält Request-Infos und Response-Methoden
app.get("/", (c) => {
    return c.text("Backend läuft hoffentlich..."); // Sendet eine Text-Antwort zurück
});

//Nimmt sich die Port variable aus .env
const port = Number(process.env.PORT);

// Startet den Server auf Port 3000
serve({
    fetch: app.fetch,
    port,
},(info) => {
    console.log(`Server läuft unter http://localhost:${info.port}`);
})