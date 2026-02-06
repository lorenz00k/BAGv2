import pino from "pino";

const logger = pino({ name: "vienna-ogd" });

const FETCH_TIMEOUT_MS = 10_000;

/**
 * Generic Vienna OGD API fetcher with error handling.
 * Note: The returned data is only validated to be a non-null object.
 * Callers should validate the shape if strict type safety is needed.
 */
export async function fetchViennaOGD<T>(
  url: string,
  context: string
): Promise<T | null> {
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (!response.ok) {
      logger.warn({ status: response.status, context }, "Vienna OGD API error");
      return null;
    }

    // Check if response is JSON
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("xml")) {
      logger.warn({ context }, "Vienna OGD returned XML instead of JSON");
      return null;
    }

    const data: unknown = await response.json();

    if (typeof data !== "object" || data === null) {
      logger.warn(
        { context, type: typeof data },
        "Vienna OGD returned unexpected data type"
      );
      return null;
    }

    return data as T;
  } catch (error) {
    const isTimeout =
      error instanceof Error && error.name === "TimeoutError";
    if (isTimeout) {
      logger.error({ context }, "Vienna OGD request timed out");
    } else {
      logger.error({ context, error }, "Vienna OGD fetch failed");
    }
    return null;
  }
}

/**
 * Build WFS request URL for Vienna OGD
 */
export function buildWFSUrl(params: {
  dataset: string;
  bbox?: string;
  srsName?: string;
  cqlFilter?: string;
}): string {
  const { dataset, bbox, srsName = "EPSG:4326", cqlFilter } = params;

  const url = new URL("https://data.wien.gv.at/daten/geo");
  url.searchParams.set("service", "WFS");
  url.searchParams.set("request", "GetFeature");
  url.searchParams.set("version", "1.1.0");
  url.searchParams.set("typeName", `ogdwien:${dataset}`);
  url.searchParams.set("outputFormat", "application/json");
  url.searchParams.set("srsName", srsName);

  if (bbox) {
    url.searchParams.set("bbox", `${bbox},${srsName}`);
  }

  if(cqlFilter){
    url.searchParams.set("cql_filter", cqlFilter);
  }

  return url.toString();
}

/**
 * Create bbox string for point with buffer.
 * Accounts for longitude distortion at the given latitude.
 */
export function createBBox(
  lng: number,
  lat: number,
  bufferMeters: number = 5
): string {
  // Präzisere Berechnung für größere Radien
  // 1 Grad Breite ≈ 111 km
  // 1 Grad Länge ≈ 111 km * cos(latitude)
  const latBuffer = bufferMeters / 111000; // Meter → Grad Breite
  const lngBuffer = bufferMeters / (111000 * Math.cos((lat * Math.PI) / 180)); // Meter → Grad Länge
  return `${lng - lngBuffer},${lat - latBuffer},${lng + lngBuffer},${lat + latBuffer}`;
}
