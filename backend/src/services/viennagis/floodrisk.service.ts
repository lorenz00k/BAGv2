import type { FloodRiskInfo } from "./types.js";
// import { fetchViennaOGD, buildWFSUrl, createBBBox} from "../utils/api.js"
import { buildWFSUrl, createBBox, fetchViennaOGD } from "../utils/api.js";

interface FloodRiskFeature {
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
      inFloodZone: false,
      details: "Standort liegt nicht in einer Hochwasser-Gefahrenzone.",
      found: false,
    };
  }

  const feature = data.features[0];
  const props = feature.properties;

  const riskLevel = props.HQ || props.ZONE || props.GEFAHR;

  return {
    riskLevel,
    inFloodZone: true,
    details:
      props.BESCHREIBUNG ||
      props.BEMERKUNG ||
      `Standort liegt in Hochwasser-Gefahrenzone${riskLevel ? ` (${riskLevel})` : ""}.`,
    found: true,
  };
}