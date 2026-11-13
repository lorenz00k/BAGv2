import { config } from "dotenv";
import { parseEnv } from "./env-schema.js";

// Load .env first. Variables that are already set (shell, CI, tests) are kept.
config();

export const env = parseEnv(process.env);

export const isProduction = env.NODE_ENV === "production";
export const isDevelopment = env.NODE_ENV === "development";
