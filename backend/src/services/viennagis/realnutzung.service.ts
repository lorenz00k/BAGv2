import type { RealnutzungInfo } from "./types.js";
import { fetchViennaOGD, buildWFSUrl, createBBox } from "../utils/api.js";

interface RealnutzungFeature {
  properties: {
    NUTZUNG_LEVEL1?: string;
    NUTZUNG_LEVEL2?: string;
    NUTZUNG_LEVEL3?: string;
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
    dataset: "REALNUT2024OGD",
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

  const nutzungL3 = props.NUTZUNG_LEVEL3 ?? "";
  const { sensitivity, sensitivityReason } = assessSensitivity(nutzungL3);

  return {
    ...(props.NUTZUNG_LEVEL1 != null && { category: props.NUTZUNG_LEVEL1 }),
    ...(props.NUTZUNG_LEVEL2 != null && { usage: props.NUTZUNG_LEVEL2 }),
    ...(props.NUTZUNG_LEVEL3 != null && { usageDetail: props.NUTZUNG_LEVEL3 }),
    sensitivity,
    sensitivityReason,
    details: [props.NUTZUNG_LEVEL1, props.NUTZUNG_LEVEL2, props.NUTZUNG_LEVEL3]
      .filter(Boolean)
      .join(" → ") || "Keine Details verfügbar",
    found: true,
  };
}

/**
 * Assess environmental sensitivity based on actual land use (NUTZUNG_LEVEL3).
 * Categories based on RNK 2022 dataset documentation.
 */
function assessSensitivity(nutzungL3: string): {
  sensitivity: "hoch" | "mittel" | "gering";
  sensitivityReason: string;
} {
  const lower = nutzungL3.toLowerCase();

  // HOCH: Schutzbedürftige Nutzungen (Wohnen, Bildung, Gesundheit, Erholung)
  const highKeywords = [
    "wohn",          // Wohn(misch)gebiet (alle Dichten)
    "bildung",       // Schulen, Universitäten
    "gesundheit",    // Krankenhäuser, Pflegeeinrichtungen
    "einsatzorg",    // Einsatzorganisationen (Rettung, Feuerwehr)
    "friedhof",      // Friedhöfe
    "park, grün",    // Parks, Grünanlagen
    "wiese",         // Wiesen
    "wald",          // Waldflächen
  ];

  for (const kw of highKeywords) {
    if (lower.includes(kw)) {
      return {
        sensitivity: "hoch",
        sensitivityReason:
          `Sensible Nutzung im Umfeld (${nutzungL3}) – erhöhte Anforderungen an Lärm-, Geruchs- und Emissionsschutz.`,
      };
    }
  }

  // GERING: Gewerblich/industrielle Nutzungen
  const lowKeywords = [
    "industrie",       // Industrie, produzierendes Gewerbe
    "gewerbe",         // Gewerbe, Großhandel
    "kläranlage",      // Kläranlage, Deponie
    "deponie",         // Deponien
    "energieversorg",  // Energieversorgung, Rundfunkanlagen
    "wasserversorg",   // Wasserversorgung
    "bahnhö",          // Bahnhöfe, Bahnanlagen
    "bahnanlagen",     // Bahnanlagen
    "transport",       // Transport und Logistik
    "logistik",        // Logistik inkl. Lager
    "transformations", // Transformationsfläche, Baustelle
    "baustelle",       // Baustellen
    "materialgewinn",  // Materialgewinnung
    "militär",         // Militärische Anlagen
    "parkplä",         // Parkplätze, Parkhäuser
    "parkhäu",         // Parkhäuser
  ];

  for (const kw of lowKeywords) {
    if (lower.includes(kw)) {
      return {
        sensitivity: "gering",
        sensitivityReason:
          `Gewerbliche/technische Nutzung (${nutzungL3}) – Betriebsanlage ist voraussichtlich gebietsüblich.`,
      };
    }
  }

  // MITTEL: Misch- und Sondernutzungen
  return {
    sensitivity: "mittel",
    sensitivityReason:
      `Mischnutzung (${nutzungL3}) – Einzelfallprüfung der Verträglichkeit erforderlich.`,
  };
}
