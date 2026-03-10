//fetch wrapper -> backend (credentials inluded) -> cookies werden mitgeschickt


import createClient, { type Middleware } from "openapi-fetch";
import type { paths } from "@/lib/api/checker"; // automatisch aus openapi generierte Typen für Endpunkte, Requests und Responses


const RAW =
  (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000").trim();

// Falls jemand aus Versehen "" oder "/" gesetzt hat
const API_BASE =
  RAW === "" || RAW === "/" ? "http://localhost:3000" : RAW.replace(/\/+$/, "");

const withCookies: Middleware = {
  onRequest({ request }) {
    return new Request(request, { credentials: "include" });
  },
};

export const client = createClient<paths>({ baseUrl: API_BASE });
client.use(withCookies);

// Optional zum Debuggen (nur dev):
if (process.env.NODE_ENV === "development") {
  // eslint-disable-next-line no-console
  console.log("[checker api] baseUrl =", API_BASE);
}