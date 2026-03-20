import type {
  GeoJSONGeometry,
  LayerResult,
  POI,
} from "@/types/viennagis";

// ── GeoJSON RFC 7946 Feature types (only what we need) ─────────────────

export interface GeoJSONFeature {
  type: "Feature";
  properties: Record<string, unknown>;
  geometry: GeoJSONGeometry;
}

export interface GeoJSONFeatureCollection {
  type: "FeatureCollection";
  features: GeoJSONFeature[];
}

// ── Builders ────────────────────────────────────────────────────────────

/** Convert a single LayerResult into a GeoJSON Feature (or null if no geometry). */
function layerToFeature(layer: LayerResult): GeoJSONFeature | null {
  if (!layer.geometry || !layer.available) return null;

  return {
    type: "Feature",
    properties: {
      layerId: layer.layerId,
      label: layer.label,
      risk: layer.risk,
      color: layer.color,
    },
    geometry: layer.geometry,
  };
}

/** Build a FeatureCollection from all available layers. */
export function buildLayerFeatures(
  layers: LayerResult[],
): GeoJSONFeatureCollection {
  const features = layers
    .map(layerToFeature)
    .filter((f): f is GeoJSONFeature => f !== null);

  return { type: "FeatureCollection", features };
}

/** Build a FeatureCollection for POI markers. */
export function buildPOIFeatures(pois: POI[]): GeoJSONFeatureCollection {
  const features: GeoJSONFeature[] = pois
    .filter((p) => p.coordinates)
    .map((p) => ({
      type: "Feature" as const,
      properties: {
        poiType: p.type,
        name: p.name,
        distance: p.distance,
      },
      geometry: {
        type: "Point" as const,
        coordinates: [p.coordinates.lng, p.coordinates.lat] as [number, number],
      },
    }));

  return { type: "FeatureCollection", features };
}

