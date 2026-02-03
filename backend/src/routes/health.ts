import { Hono } from "hono";

//Warum eine Health-Route?
//Das ist Standard bei Backends. Sie zeigt: Server läuft
//Wird später von Docker/Kubernetes genutzt um zu prüfen, ob dein Service gesund ist

//Eigene Mini-App für diese Route
const health = new Hono();

//"/" ist relativ – die Basis-URL wird in index.ts definiert
health.get("/", (c) => {
  return c.json({
    status: "ok",
    timeStamp: new Date().toISOString(),
  });
});

//Exportiert die Route, damit index.ts sie importieren kann
export default health;
