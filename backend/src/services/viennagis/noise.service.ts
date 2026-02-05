import type { NoiseInfo } from "./types.js";
import { fetchViennaOGD, buildWFSUrl, createBBox } from "../utils/api.js";

interface NoiseFeature {
  properties: {
    LDEN?: string | number; // Day-Evening-Night noise level
    LNIGHT?: string | number; // Night noise level
    QUELLE?: string; // Source: Straße, Bahn, etc.
    TYP?: string;
    BEMERKUNG?: string;
  };
}

interface NoiseResponse {
  features?: NoiseFeature[];
}

/**
 * Get noise information for a location
 */
export async function getNoiseInfo(
  lat: number,
  lng: number
): Promise<NoiseInfo> {
  const bbox = createBBox(lng, lat, 5); // 5 Meter Buffer
  const url = buildWFSUrl({
    dataset: "LAERMSCHUTZOGD",
    bbox,
  });

  const data = await fetchViennaOGD<NoiseResponse>(url, "getNoiseInfo");

  if (!data || !data.features || data.features.length === 0) {
    return {
      details: "Für diese Adresse sind keine Lärmdaten verfügbar.",
      found: false,
    };
  }

  const feature = data.features[0];
  const props = feature.properties;

  // Parse noise level (prefer LDEN, fallback to LNIGHT)
  const levelStr = props.LDEN || props.LNIGHT;
  const level = levelStr ? parseFloat(levelStr.toString()) : undefined;

  // Determine source
  const source = interpretSource(props.QUELLE, props.TYP);

  // Categorize noise level
  const category = level ? categorizeNoise(level) : undefined;

  return {
    level,
    source,
    category,
    details: props.BEMERKUNG || buildNoiseDescription(level, source),
    found: true,
  };
}

/**
 * Interpret noise source
 */
function interpretSource(
  quelle?: string,
  typ?: string
): string | undefined {
  const source = (quelle || typ || "").toLowerCase();

  if (source.includes("strasse") || source.includes("straße")) {
    return "Straße";
  }
  if (source.includes("bahn") || source.includes("schiene")) {
    return "Bahn";
  }
  if (source.includes("flug")) {
    return "Flughafen";
  }
  if (source.includes("industrie") || source.includes("gewerbe")) {
    return "Industrie";
  }

  return quelle || typ;
}

/**
 * Categorize noise level in dB(A)
 */
function categorizeNoise(level: number): string {
  if (level < 55) return "gering";
  if (level < 65) return "mittel";
  if (level < 75) return "hoch";
  return "sehr hoch";
}

/**
 * Build noise description
 */
function buildNoiseDescription(
  level?: number,
  source?: string
): string {
  if (!level) {
    return "Keine detaillierten Lärminformationen verfügbar.";
  }

  const sourceStr = source ? ` durch ${source}` : "";
  return `Lärmbelastung: ${level} dB(A)${sourceStr}`;
}