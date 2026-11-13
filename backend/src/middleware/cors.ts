import { cors } from "hono/cors";

// An origin is scheme + host + port. Compare the parsed parts, not the text:
// a prefix check also lets through "http://localhost.evil.com".
function isLocalhostOrigin(origin: string): boolean {
  try {
    const url = new URL(origin);
    return (
      url.origin === origin && // rejects userinfo, paths and odd spellings
      url.protocol === "http:" &&
      url.hostname === "localhost"
    );
  } catch {
    return false; // not a URL at all
  }
}

export const corsMiddleware = cors({
  origin: (origin) => {
    // Erlaubte Origins (später aus .env)
    const allowedOrigins = [
      "http://localhost:5173", // Vite Dev
      "http://localhost:3001", // Alternative
      "https://betriebsanlage-check.at", // Production
    ];

    // Während Development: auch localhost ohne Port erlauben
    if (
      process.env.NODE_ENV === "development" &&
      origin &&
      isLocalhostOrigin(origin)
    ) {
      return origin;
    }

    return allowedOrigins.includes(origin) ? origin : undefined;
  },
  credentials: true,
  allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
  maxAge: 86400,
});
