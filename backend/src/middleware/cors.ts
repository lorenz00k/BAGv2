import { cors } from "hono/cors";
import { env, isDevelopment } from "../env.js";

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

type CorsOptions = {
  frontendUrl: string;
  allowAnyLocalhost: boolean;
};

export function createCorsMiddleware({
  frontendUrl,
  allowAnyLocalhost,
}: CorsOptions) {
  const allowedOrigin = new URL(frontendUrl).origin;

  return cors({
    origin: (origin) => {
      if (origin === allowedOrigin) return origin;
      if (allowAnyLocalhost && isLocalhostOrigin(origin)) return origin;
      return undefined;
    },
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400,
  });
}

export const corsMiddleware = createCorsMiddleware({
  frontendUrl: env.FRONTEND_URL,
  allowAnyLocalhost: isDevelopment,
});
