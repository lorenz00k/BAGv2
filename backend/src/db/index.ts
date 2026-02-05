import { drizzle } from "drizzle-orm/postgres-js"; 
import postgres from "postgres";
import { config } from "dotenv";

config();

//postgres client
const client = postgres(process.env.DATABASE_URL!); // postgres() → Verbindung zur DB

//DRIZZLE Instance
export const db = drizzle(client); // export const db → Wird in Routes importiert
