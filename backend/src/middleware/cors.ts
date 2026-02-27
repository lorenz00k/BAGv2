import { cors } from "hono/cors";

export const corsMiddleware = cors({
  origin: (origin) => {
    // Erlaubte Origins (später aus .env)
    const allowedOrigins = [
      "http://localhost:5173", // Vite Dev
      "http://localhost:3001", // Alternative
      "https://betriebsanlage-check.at", // Production
    ];
    
    // Während Development: auch localhost ohne Port erlauben
    if (process.env.NODE_ENV === "development" && origin?.startsWith("http://localhost")) {
      return origin;
    }
    
    return allowedOrigins.includes(origin ) ? origin : undefined;
  },
  credentials: true,
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
  maxAge: 86400,
});