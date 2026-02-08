import type { ZoningInfo } from "./types.js";
import { fetchViennaOGD, buildWFSUrl, createBBox } from "../utils/api.js";

interface ZoningFeature {
  properties: {
    WIDMUNG?: string;           // "GBGV5"
    WIDMUNG_TXT?: string;       // "Gemischtes Baugebiet-Geschäftsviertel Bauklasse 5"
    WIDMUNGSKLASSE?: string;    // "GBGV"
    WIDMUNGSKLASSE_TXT?: string; // "Gemischtes Baugebiet-Geschäftsviertel"
    BEZIRK?: string;
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

  const widmungCode = props.WIDMUNG || "";
  const widmung = props.WIDMUNGSKLASSE_TXT || interpretWidmung(props.WIDMUNGSKLASSE || widmungCode);

  return {
    widmung,
    widmungCode,
    details: props.WIDMUNG_TXT || "Keine Details verfügbar",
    found: true,
  };
}

/**
 * Fallback: Translate zoning codes to human-readable format
 */
function interpretWidmung(code: string): string {
  const widmungen: Record<string, string> = {
    W: "Wohngebiet",
    WA: "Allgemeines Wohngebiet",
    WR: "Reines Wohngebiet",
    G: "Gemischtes Gebiet",
    GM: "Gemischtes Gebiet",
    GB: "Betriebsbaugebiet",
    GBGV: "Gemischtes Baugebiet-Geschäftsviertel",
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

  // Partial match (e.g. "GBGV5" starts with "GBGV")
  for (const [key, value] of Object.entries(widmungen)) {
    if (code.startsWith(key)) {
      return value;
    }
  }

  return code || "Unbekannt";
}
