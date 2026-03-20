import type { ZoningInfo, SuitabilityRisk, DetailedSuitability} from "./types.js";
import { fetchViennaOGD, buildWFSUrl, createBBox } from "../utils/api.js";
import { extractGeometry } from "../utils/geometry.js";

interface ZoningFeature {
  geometry?: { type?: string; coordinates?: unknown };
  properties: {
    WIDMUNG?: string;           // z.B. "GB II g"
    WIDMUNG_TXT?: string;       // Volltext
    WIDMUNGSKLASSE?: string;    // Grobe Klasse
    WIDMUNGSKLASSE_TXT?: string;
    BEZIRK?: string;
  };
}

interface ZoningResponse {
  features?: ZoningFeature[];
}

/**
 * Get zoning information for a location with expert analysis
 */
export async function getZoningInfo(
  lat: number,
  lng: number
): Promise<ZoningInfo> {
  // Wir nutzen einen kleinen Buffer, um auch Grenzlagen zu erkennen
  const bbox = createBBox(lng, lat, 5); 
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
      risk: "medium"
    };
  }

  // Check auf Grenzlage (mehrere unterschiedliche Widmungen im Radius)
  const uniqueWidmungen = new Set(data.features.map(f => f.properties.WIDMUNG));
  const isBoundary = uniqueWidmungen.size > 1;

  // Wir analysieren das primäre (erste) Feature
  const primaryFeature = data.features[0]!;
  const props = primaryFeature.properties;
  const rawCode = props.WIDMUNG || "";
  const analysis = analyzeSuitability(rawCode);
  const geometry = extractGeometry(primaryFeature);

  return {
    ...(geometry && { geometry }),
    widmung: analysis.label,
    widmungCode: rawCode,
    details: props.WIDMUNG_TXT || "Keine Details verfügbar",
    found: true,
    risk: analysis.risk,
    bauklasse: analysis.bauklasse,
    bauweise: analysis.bauweise,
    note: isBoundary
      ? `ACHTUNG: Grenzlage! ${analysis.note}`
      : analysis.note,
    isBoundary
  };
}

/**
 * Experten-Logik zur Analyse der Wiener Widmungscodes
 */
function analyzeSuitability(fullCode: string): DetailedSuitability {
  const parts = fullCode.split(" ");
  const baseCode = parts[0] || "";
  
  // Extraktion der Bauklasse (I-VI)
  const bauklasse = parts.find(p => /^(I|II|III|IV|V|VI)$/.test(p)) || "k.A.";
  
  // Extraktion der Bauweise (g = geschlossen, o = offen, k = gekuppelt, ek = einzeln)
  const bauweiseMap: Record<string, string> = {
    "g": "geschlossen",
    "o": "offen",
    "k": "gekuppelt",
    "ek": "einzeln"
  };
  const bwKey = parts.find(p => ["g", "o", "k", "ek"].includes(p));
  const bauweise = bwKey ? (bauweiseMap[bwKey] ?? "k.A.") : "k.A.";

  const mapping: Record<string, { label: string, risk: SuitabilityRisk, note: string }> = {
    "W":    { label: "Wohngebiet", risk: "high", note: "Hohe Sensibilität. Nur Betriebe erlaubt, die Nachbarn nicht stören." },
    "WA":   { label: "Allgemeines Wohngebiet", risk: "high", note: "Wohnfokus. Gewerbe darf keine Emissionen verursachen." },
    "WR":   { label: "Reines Wohngebiet", risk: "high", note: "Gewerbe fast unmöglich, außer Nahversorgung." },
    "GB":   { label: "Gemischtes Baugebiet", risk: "low", note: "Ideal. Betriebe und Wohnungen sind gleichrangig." },
    "GBGV": { label: "Geschäftsviertel", risk: "low", note: "Hervorragend für Handel. Erdgeschossnutzung oft gewerblich Pflicht." },
    "BB":   { label: "Betriebsbaugebiet", risk: "low", note: "Optimal für Gewerbe. Kaum Einschränkungen durch Anrainer." },
    "IG":   { label: "Industriegebiet", risk: "low", note: "Maximaler Spielraum für laute oder produzierende Betriebe." },
    "G":    { label: "Gartensiedlung", risk: "high", note: "Sehr restriktiv. Meist nur hobbymäßige Nutzung erlaubt." },
    "OEZ":  { label: "Öffentliche Zwecke", risk: "medium", note: "Abhängig von der Art der Einrichtung (z.B. Kirche, Amt)." },
    "Ekl":  { label: "Kleingartengebiet", risk: "high", note: "Gewerbebetrieb rechtlich fast immer ausgeschlossen." },
    "S":    { label: "Sondergebiet", risk: "medium", note: "Hängt vom spezifischen Plandokument ab." }
  };

  // Suche nach dem besten Match im Mapping (Prefix-Suche)
  let info = { label: fullCode, risk: "medium" as SuitabilityRisk, note: "Einzelfallprüfung durch Experten empfohlen." };
  
  for (const [key, value] of Object.entries(mapping)) {
    if (baseCode.startsWith(key)) {
      info = value;
      break;
    }
  }

  return {
    ...info,
    bauklasse,
    bauweise
  };
}