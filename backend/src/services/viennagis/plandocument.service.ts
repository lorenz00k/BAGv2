import type { PlanDocumentInfo } from "./types.js";
import { fetchViennaOGD, buildWFSUrl, createBBox } from "../utils/api.js";
import { extractGeometry } from "../utils/geometry.js";

interface PlanDocumentFeature {
  geometry?: { type?: string; coordinates?: unknown };
  properties: {
    PD_NUMMER?: string;
    BEZEICHNUNG?: string;
    BEMERKUNG?: string;
  };
}

interface PlanDocumentResponse {
  features?: PlanDocumentFeature[];
}

/**
 * Get planning document (Ast-Plan) for a location
 */
export async function getPlanDocumentInfo(
  lat: number,
  lng: number
): Promise<PlanDocumentInfo> {
  const bbox = createBBox(lng, lat, 5);
  const url = buildWFSUrl({
    dataset: "PLANUNGASTOGD",
    bbox,
  });

  const data = await fetchViennaOGD<PlanDocumentResponse>(
    url,
    "getPlanDocumentInfo"
  );

  if (!data || !data.features || data.features.length === 0) {
    return {
      details: "Für diese Adresse sind keine Plandokument-Daten verfügbar.",
      found: false,
    };
  }

  const feature = data.features[0]!;
  const props = feature.properties;
  const geometry = extractGeometry(feature);

  const pdNummer = props.PD_NUMMER;
  const url_pd = pdNummer
    ? `https://www.wien.gv.at/flaechenwidmung/public/plandokument/Detail.aspx?id=${encodeURIComponent(pdNummer)}`
    : undefined;

  return {
    geometry,
    pdNummer,
    url: url_pd,
    details: props.BEZEICHNUNG || props.BEMERKUNG || "Keine Details verfügbar",
    found: true,
  };
}
