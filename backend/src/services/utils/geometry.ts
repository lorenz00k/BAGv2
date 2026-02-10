import type { GeoJSONGeometry } from "../viennagis/types.js";

const VALID_TYPES = new Set(['Point', 'Polygon', 'MultiPolygon']);

/**
 * Extract and validate GeoJSON geometry from a WFS feature.
 * Returns undefined if the geometry is missing or invalid.
 */
export function extractGeometry(
  feature: { geometry?: { type?: string; coordinates?: unknown } }
): GeoJSONGeometry | undefined {
  const geom = feature.geometry;
  if (!geom || !geom.type || !VALID_TYPES.has(geom.type)) {
    return undefined;
  }

  if (!Array.isArray(geom.coordinates)) {
    return undefined;
  }

  return { type: geom.type, coordinates: geom.coordinates } as GeoJSONGeometry;
}
