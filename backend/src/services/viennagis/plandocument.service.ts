import type { PlanDocumentInfo } from "./types.js";
import { fetchViennaOGD, buildWFSUrl } from "../utils/api.js";

interface PlanDocumentFeature {
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
  const url = buildWFSUrl({
    dataset: "PLANUNGASTOGD",
    cqlFilter: `INTERSECTS(SHAPE, POINT(${lng} ${lat}))`,
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

  const pdNummer = props.PD_NUMMER;
  const url_pd = pdNummer
    ? `https://www.wien.gv.at/flaechenwidmung/public/plandokument/Detail.aspx?id=${encodeURIComponent(pdNummer)}`
    : undefined;

  return {
    pdNummer,
    url: url_pd,
    details: props.BEZEICHNUNG || props.BEMERKUNG || "Keine Details verfügbar",
    found: true,
  };
}
