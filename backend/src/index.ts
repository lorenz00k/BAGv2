import {serve} from "@hono/node-server";
import {Hono} from "hono";


//Hono : Erstellt deine App-Instanz
const app = new Hono();

//Route definieren: Definiert: Bei GET-Request auf "/" führe diese Funktion aus 
// c = Das "Context"-Objekt – enthält Request-Infos und Response-Methoden
app.get("/", (c) => {
    return c.text("Backend läuft hoffentlich..."); // Sendet eine Text-Antwort zurück
});

// Startet den Server auf Port 3000
serve({
    fetch: app.fetch,
    port: 3000,
},(info) => {
    console.log(`Server läuft unter hht://localhost:${info.port}`);
})