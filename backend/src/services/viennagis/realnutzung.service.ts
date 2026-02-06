import type { RealnutzungInfo } from "./types.js";
import { fetchViennaOGD, buildWFSUrl, createBBox } from "../utils/api.js";

interface RealnutzungFeature {
  properties: {
    NUTZUNG_L1?: string;
    NUTZUNG_L2?: string;
    NUTZUNG_L3?: string;
  };
}

interface RealnutzungResponse {
  features?: RealnutzungFeature[];
}

/**
 * Get actual land use (Realnutzung) for a location.
 * Used to cross-check zoning vs. real usage for Betriebsanlagen-Genehmigung.
 */
export async function getRealnutzungInfo(
  lat: number,
  lng: number
): Promise<RealnutzungInfo> {
  const bbox = createBBox(lng, lat, 5);
  const url = buildWFSUrl({
    dataset: "REALNUT2022OGD",
    bbox,
  });

  const data = await fetchViennaOGD<RealnutzungResponse>(
    url,
    "getRealnutzungInfo"
  );

  if (!data || !data.features || data.features.length === 0) {
    return {
      sensitivity: "mittel",
      sensitivityReason:
        "Keine Realnutzungsdaten verfügbar – manuelle Prüfung empfohlen.",
      details: "Für diese Adresse sind keine Realnutzungsdaten verfügbar.",
      found: false,
    };
  }

  const feature = data.features[0]!;
  const props = feature.properties;

  const nutzungL3 = props.NUTZUNG_L3 ?? "";
  const { sensitivity, sensitivityReason } = assessSensitivity(nutzungL3);

  return {
    ...(props.NUTZUNG_L1 != null && { category: props.NUTZUNG_L1 }),
    ...(props.NUTZUNG_L2 != null && { usage: props.NUTZUNG_L2 }),
    ...(props.NUTZUNG_L3 != null && { usageDetail: props.NUTZUNG_L3 }),
    sensitivity,
    sensitivityReason,
    details: [props.NUTZUNG_L1, props.NUTZUNG_L2, props.NUTZUNG_L3]
      .filter(Boolean)
      .join(" → ") || "Keine Details verfügbar",
    found: true,
  };
}

/**
 * Assess environmental sensitivity based on actual land use.
 */
function assessSensitivity(nutzungL3: string): {
  sensitivity: "hoch" | "mittel" | "gering";
  sensitivityReason: string;
} {
  const lower = nutzungL3.toLowerCase();

  if (lower.includes("wohnen") || lower.includes("wohngebiet")) {
    return {
      sensitivity: "hoch",
      sensitivityReason:
        "Wohnnutzung im Umfeld – erhöhte Anforderungen an Lärm- und Geruchsschutz.",
    };
  }

  if (lower.includes("industrie") || lower.includes("gewerbe")) {
    return {
      sensitivity: "gering",
      sensitivityReason:
        "Industrie-/Gewerbenutzung – Betriebsanlage ist voraussichtlich gebietsüblich.",
    };
  }

  return {
    sensitivity: "mittel",
    sensitivityReason:
      "Mischnutzung oder unklare Zuordnung – Einzelfallprüfung erforderlich.",
  };
}
