import { cors } from "hono/cors";

const allowedOrigins = [
  "http://localhost:5173", // Vite Dev Server
  "http://localhost:3001", // Falls anderer Port
];

export const corsMiddleware = cors({
    //Welche Domains dürfen zugreifen
  origin: (origin) => {
    // Kein Origin = Server-to-Server Request, erlauben
    if (!origin) return "*";
    
    // Prüfen ob Origin erlaubt ist
    if (allowedOrigins.includes(origin)) {
      return origin;
    }
    
    return null; // Blockieren
  },
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
  credentials: true,
});