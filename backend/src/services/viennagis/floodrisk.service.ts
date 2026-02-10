import type { FloodRiskInfo, SuitabilityRisk } from "./types.js";
import { fetchViennaOGD, buildWFSUrl, createBBox } from "../utils/api.js";
import { extractGeometry } from "../utils/geometry.js";

interface FloodRiskFeature {
  geometry?: { type?: string; coordinates?: unknown };
  properties: {
    HQ?: string; // "HQ30", "HQ100", "HQ300"
    ZONE?: string;
    GEFAHR?: string;
    BESCHREIBUNG?: string;
    BEMERKUNG?: string;
  };
}

interface FloodRiskResponse {
  features?: FloodRiskFeature[];
}

/**
 * Get flood risk information for a location
 */
export async function getFloodRiskInfo(
  lat: number,
  lng: number
): Promise<FloodRiskInfo> {
  const bbox = createBBox(lng, lat, 5);
  const url = buildWFSUrl({
    dataset: "HWGEFAHROGD",
    bbox,
  });

  const data = await fetchViennaOGD<FloodRiskResponse>(
    url,
    "getFloodRiskInfo"
  );

  if (!data || !data.features || data.features.length === 0) {
    return {
      risk: 'low',
      inFloodZone: false,
      details: "Standort liegt nicht in einer Hochwasser-Gefahrenzone.",
      found: false,
    };
  }

  const feature = data.features[0]!;
  const props = feature.properties;
  const geometry = extractGeometry(feature);

  const riskLevel = props.HQ || props.ZONE || props.GEFAHR;
  const risk = deriveFloodRisk(riskLevel);

  return {
    ...(geometry && { geometry }),
    risk,
    riskLevel,
    inFloodZone: true,
    details:
      props.BESCHREIBUNG ||
      props.BEMERKUNG ||
      `Standort liegt in Hochwasser-Gefahrenzone${riskLevel ? ` (${riskLevel})` : ""}.`,
    found: true,
  };
}

/**
 * Derive suitability risk from flood risk level
 */
function deriveFloodRisk(riskLevel?: string): SuitabilityRisk {
  if (!riskLevel) return 'medium';
  const upper = riskLevel.toUpperCase();
  if (upper.includes('HQ30')) return 'high';
  if (upper.includes('HQ100')) return 'medium';
  if (upper.includes('HQ300')) return 'medium';
  return 'medium';
}