import type { ZoningInfo } from "./types.js";
import { fetchViennaOGD, buildWFSUrl, createBBox } from "../utils/api.js";

interface ZoningFeature {
  properties: {
    FWIDMUNG?: string;
    WIDMUNG?: string;
    FWIDMTXT?: string;
    BEMERKUNG?: string;
    BK?: string;
    GB_INFO?: string;
  };
}

interface ZoningResponse {
  features?: ZoningFeature[];
}

/**
 * Get zoning information for a location
 */
export async function getZoningInfo(
  lat: number,
  lng: number
): Promise<ZoningInfo> {
  const bbox = createBBox(lng, lat, 5); // 5 Meter Buffer
  const url = buildWFSUrl({
    dataset: "GENFLWIDMUNGOGD",
    bbox,
  });

  const data = await fetchViennaOGD<ZoningResponse>(url, "getZoningInfo");

  if (!data || !data.features || data.features.length === 0) {
    return {
      widmung: "Keine Daten",
      widmungCode: "",
      details: "Für diese Adresse sind keine Flächenwidmungsdaten verfügbar.",
      found: false,
    };
  }

  const feature = data.features[0]!;
  const props = feature.properties;

  const widmungCode = (props.FWIDMUNG || props.WIDMUNG || "").toString();
  const widmung = interpretWidmung(widmungCode);

  return {
    widmung,
    widmungCode,
    bauklasse: props.BK || undefined, 
    gbInfo: props.GB_INFO || undefined,
    details: props.FWIDMTXT || props.BEMERKUNG || "Keine Details verfügbar",
    found: true,
  };
}

/**
 * Translate zoning codes to human-readable format
 */
function interpretWidmung(code: string): string {
  const widmungen: Record<string, string> = {
    W: "Wohngebiet",
    WA: "Allgemeines Wohngebiet",
    WR: "Reines Wohngebiet",
    G: "Gemischtes Gebiet",
    GM: "Gemischtes Gebiet",
    GB: "Betriebsbaugebiet",
    I: "Industriegebiet",
    IG: "Industriegebiet",
    EKZ: "Einkaufszentrum",
    PARK: "Parkanlage",
    SPO: "Sportanlage",
    "GF-BD": "Grünfläche - Baudenkmal",
    GF: "Grünfläche",
    LW: "Land- und Forstwirtschaft",
    V: "Verkehrsfläche",
    S: "Sondergebiet",
  };

  // Exact match
  if (widmungen[code]) {
    return widmungen[code];
  }

  // Partial match (e.g. "WA1" starts with "WA")
  for (const [key, value] of Object.entries(widmungen)) {
    if (code.startsWith(key)) {
      return value;
    }
  }

  return code || "Unbekannt";
}