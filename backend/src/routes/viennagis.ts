import { Hono } from "hono";
import { z } from "zod";
import { performFullCheck, autocompleteAddress, formatResultForUI } from "../services/viennagis/index.js";
import { rateLimiter } from "hono-rate-limiter";
import pino from "pino"; 

const viennagis = new Hono();
const logger = pino({ name: "viennagis-route" });  

// Rate Limiter für ViennaGIS (30 Requests/Minute)
const viennagisRateLimiter = rateLimiter({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: "draft-6",
  keyGenerator: (c) => {
    // Versuche verschiedene IP-Header (Reverse Proxy Support)
    const forwardedFor = c.req.header("x-forwarded-for");
    const firstIp = forwardedFor?.split(",")[0]?.trim(); 
    
    return (
      firstIp ||
      c.req.header("x-real-ip") ||
      c.req.header("cf-connecting-ip") ||
      "fallback-key"
    );
  },
  message: "Too many requests to Vienna GIS API",
});

// Validation Schema
const checkSchema = z.object({
  address: z.string().min(3, "Address too short").max(200, "Address too long"),
});

// Validation Schema for autocomplete
const autocompleteSchema = z.object({
  q: z.string().min(2, "Query too short").max(100, "Query too long"),
});

/**
 * GET /api/viennagis/autocomplete?q=Mariahilf
 * Returns address suggestions for autocomplete
 */
viennagis.get("/autocomplete", viennagisRateLimiter, async (c) => {
  try {
    const { q } = autocompleteSchema.parse({ q: c.req.query("q") });

    const suggestions = await autocompleteAddress(q);

    return c.json({ suggestions });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: "Invalid input", issues: error.issues }, 400);
    }

    logger.error({ error }, "Autocomplete failed");
    return c.json({ error: "Internal server error" }, 500);
  }
});

/**
 * POST /api/viennagis/check
 * Perform full Vienna GIS check for an address
 */
viennagis.post("/check", viennagisRateLimiter, async (c) => {
  try {
    const body = await c.req.json();
    const { address } = checkSchema.parse(body);

    const result = await performFullCheck(address);
    const aggregated = result.found ? formatResultForUI(result) : undefined;

    return c.json({ ...result, aggregated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: "Invalid input", issues: error.issues }, 400);
    }

    logger.error({ error }, "ViennaGIS check failed");  // ← FIX: pino statt console.error
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default viennagis;