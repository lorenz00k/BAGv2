import type { EnergyPlanInfo } from "./types.js";
import { fetchViennaOGD, buildWFSUrl, createBBox } from "../utils/api.js";

interface EnergyPlanFeature {
  properties: {
    ERPLABEL?: string;    // "7/001/1"
    GEBID?: number;       // Gebiets-ID
    WEBLINK_PD?: string;  // Link zum Plan-PDF
    WEBLINK_VO?: string;  // Link zur Verordnung-PDF
  };
}

interface EnergyPlanResponse {
  features?: EnergyPlanFeature[];
}

/**
 * Get energy plan information for a location
 */
export async function getEnergyPlanInfo(
  lat: number,
  lng: number
): Promise<EnergyPlanInfo> {
  const bbox = createBBox(lng, lat, 5);
  const url = buildWFSUrl({
    dataset: "ENERGIERAUMPLANOGD",
    bbox,
  });

  const data = await fetchViennaOGD<EnergyPlanResponse>(
    url,
    "getEnergyPlanInfo"
  );

  if (!data || !data.features || data.features.length === 0) {
    return {
      details: "Für diese Adresse sind keine Energieraumplan-Daten verfügbar.",
      found: false,
    };
  }

  const feature = data.features[0]!;
  const props = feature.properties;

  return {
    zone: props.ERPLABEL,
    planUrl: props.WEBLINK_PD,
    regulationUrl: props.WEBLINK_VO,
    details: props.ERPLABEL
      ? `Energieraumplan-Zone: ${props.ERPLABEL}`
      : "Keine weiteren Details verfügbar",
    found: true,
  };
}
