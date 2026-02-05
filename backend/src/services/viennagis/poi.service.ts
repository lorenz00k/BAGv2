import type { POI } from "./types.js";
import { calculateDistance } from "../utils/distance.js";
import { fetchViennaOGD } from "../utils/api.js";
import { buildWFSUrl } from "../utils/api.js";
import { createBBox } from "../utils/api.js";

interface POIFeature {
  properties: {
    NAME?: string;
    BEZEICHNUNG?: string;
    EINRICHTUNG?: string;
  };
  geometry: {
    coordinates: [number, number];
  };
}

interface POIResponse {
  features?: POIFeature[];
}

/**
 * POI Datasets mit ihren Types
 */
const POI_DATASETS = [
  { dataset: "KRANKENHAUSOGD", type: "krankenhaus" as const },
  { dataset: "RELIGIONOGD", type: "religion" as const },
  { dataset: "KINDERGARTENOGD", type: "kindergarten" as const },
  { dataset: "SCHULEOGD", type: "schule" as const },
  { dataset: "FRIEDHOFOGD", type: "friedhof" as const },
] as const;

/**
 * Get POIs near a location
 */
export async function getNearbyPOIs(
  lat: number,
  lng: number,
  radiusMeters: number = 200
): Promise<POI[]> {
  // Alle POI-Typen parallel laden
  const results = await Promise.allSettled(
    POI_DATASETS.map(({ dataset, type }) =>
      fetchPOIType(dataset, lat, lng, radiusMeters, type)
    )
  );

  // Erfolgreiche Ergebnisse sammeln
  const allPOIs: POI[] = [];
  results.forEach((result) => {
    if (result.status === "fulfilled") {
      allPOIs.push(...result.value);
    }
  });

  // Nach Distanz sortieren (nächste zuerst)
  return allPOIs.sort((a, b) => a.distance - b.distance);
}

/**
 * Fetch POIs of a specific type
 */
async function fetchPOIType(
  dataset: string,
  lat: number,
  lng: number,
  radiusMeters: number,
  type: POI["type"]
): Promise<POI[]> {
  const bbox = createBBox(lng, lat, radiusMeters);
  const url = buildWFSUrl({ dataset, bbox });
  const data = await fetchViennaOGD<POIResponse>(url, `fetchPOIType:${type}`);

  if (!data || !data.features || data.features.length === 0) {
    return [];
  }

  const pois: POI[] = [];

  for (const feature of data.features) {
    if (!feature.geometry || !feature.geometry.coordinates) {
      continue;
    }

    const poiLng = feature.geometry.coordinates[0];
    const poiLat = feature.geometry.coordinates[1];

    const distance = calculateDistance(lat, lng, poiLat, poiLng);

    // Filter by radius
    if (distance <= radiusMeters) {
      pois.push({
        type,
        name:
          feature.properties.NAME ||
          feature.properties.BEZEICHNUNG ||
          feature.properties.EINRICHTUNG ||
          "Unbenannt",
        distance: Math.round(distance),
        coordinates: {
          lng: poiLng,
          lat: poiLat,
        },
      });
    }
  }

  return pois;
}