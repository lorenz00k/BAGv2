import proj4 from "proj4";

// EPSG:31256 - MGI Austria GK Central (Wien)
// EPSG:4326 - WGS84 (Standard GPS)
proj4.defs(
  "EPSG:31256",
  "+proj=tmerc +lat_0=0 +lon_0=16.3333333333333 +k=1 +x_0=0 +y_0=-5000000 +ellps=bessel +towgs84=577.326,90.129,463.919,5.137,1.474,5.297,2.4232 +units=m +no_defs +type=crs"
);
proj4.defs("EPSG:4326", "+proj=longlat +datum=WGS84 +no_defs");

// Vienna approximate bounding boxes (with generous padding)
const VIENNA_WGS84 = {
  minLng: 16.1,
  maxLng: 16.6,
  minLat: 48.1,
  maxLat: 48.4,
};

const VIENNA_MGI = {
  minX: -18_000,
  maxX: 22_000,
  minY: 325_000,
  maxY: 360_000,
};

function assertFinite(value: number, label: string): void {
  if (!Number.isFinite(value)) {
    throw new Error(`Invalid coordinate: ${label} is ${value}`);
  }
}

/**
 * Convert MGI Austria coordinates to WGS84.
 * Throws if inputs are non-finite or outside Vienna bounds.
 */
export function convertMGItoWGS84(
  x: number,
  y: number
): { lng: number; lat: number } {
  assertFinite(x, "x");
  assertFinite(y, "y");

  if (
    x < VIENNA_MGI.minX ||
    x > VIENNA_MGI.maxX ||
    y < VIENNA_MGI.minY ||
    y > VIENNA_MGI.maxY
  ) {
    throw new Error(
      `MGI coordinates (${x}, ${y}) are outside Vienna bounds`
    );
  }

  const [lng, lat] = proj4("EPSG:31256", "EPSG:4326", [x, y]);
  return { lng, lat };
}

/**
 * Convert WGS84 to MGI Austria.
 * Throws if inputs are non-finite or outside Vienna bounds.
 */
export function convertWGS84toMGI(
  lng: number,
  lat: number
): { x: number; y: number } {
  assertFinite(lng, "lng");
  assertFinite(lat, "lat");

  if (
    lng < VIENNA_WGS84.minLng ||
    lng > VIENNA_WGS84.maxLng ||
    lat < VIENNA_WGS84.minLat ||
    lat > VIENNA_WGS84.maxLat
  ) {
    throw new Error(
      `WGS84 coordinates (${lng}, ${lat}) are outside Vienna bounds`
    );
  }

  const [x, y] = proj4("EPSG:4326", "EPSG:31256", [lng, lat]);
  return { x, y };
}
