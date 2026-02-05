import type { EnergyPlanInfo } from "./types.js";
import { fetchViennaOGD, buildWFSUrl, createBBox } from "../utils/api.js";

interface EnergyPlanFeature {
  properties: {
    ZONE?: string;
    TYP?: string;
    BEZEICHNUNG?: string;
    BESCHREIBUNG?: string;
    BEMERKUNG?: string;
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

  const feature = data.features[0];
  const props = feature.properties;

  const zone = props.ZONE || props.TYP || props.BEZEICHNUNG;
  const restrictions = interpretEnergyRestrictions(zone);

  return {
    zone,
    restrictions,
    details:
      props.BESCHREIBUNG ||
      props.BEMERKUNG ||
      "Keine weiteren Details verfügbar",
    found: true,
  };
}

/**
 * Interpret energy zone into restrictions
 */
function interpretEnergyRestrictions(zone?: string): string[] | undefined {
  if (!zone) return undefined;

  const restrictions: string[] = [];
  const zoneLower = zone.toLowerCase();

  if (
    zoneLower.includes("fernwärme") ||
    zoneLower.includes("fernwaerme")
  ) {
    restrictions.push("Fernwärme-Anschlusspflicht");
  }

  if (zoneLower.includes("gas") && zoneLower.includes("verbot")) {
    restrictions.push("Gas-Heizung verboten");
  }

  if (zoneLower.includes("öl") || zoneLower.includes("oel")) {
    restrictions.push("Öl-Heizung verboten");
  }

  return restrictions.length > 0 ? restrictions : undefined;
}