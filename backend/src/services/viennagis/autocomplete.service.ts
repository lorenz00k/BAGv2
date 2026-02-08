import type { AddressSuggestion } from "./types.js";
import { fetchViennaOGD, buildWFSUrl } from "../utils/api.js";

interface AddressFeature {
  properties: {
    NAME?: string;       // "Mariahilfer Straße 20"
    NAME_STR?: string;   // "Mariahilfer Straße"
    NAME_ONR?: string;   // "20"
    PLZ?: string;        // "1070"
    GEB_BEZIRK?: string; // "07"
  };
  geometry: {
    coordinates: [number, number]; // [lng, lat] in WGS84
  };
}

interface AddressResponse {
  features?: AddressFeature[];
}

const MAX_SUGGESTIONS = 10;

/**
 * Autocomplete address search using Vienna address register (ADRESSENOGD).
 * Supports partial street names ("Mariahilf") and full addresses ("Mariahilfer Straße 20").
 */
export async function autocompleteAddress(
  query: string
): Promise<AddressSuggestion[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const cqlFilter = buildCqlFilter(trimmed);
  const url = buildWFSUrl({
    dataset: "ADRESSENOGD",
    cqlFilter,
    maxFeatures: MAX_SUGGESTIONS,
    sortBy: "NAME_STR,NAME_ONR",
  });

  const data = await fetchViennaOGD<AddressResponse>(url, "autocompleteAddress");

  if (!data || !data.features || data.features.length === 0) {
    return [];
  }

  return data.features
    .filter((f) => f.geometry?.coordinates)
    .map((feature) => {
      const props = feature.properties;
      return {
        fullAddress: props.NAME || "",
        street: props.NAME_STR || "",
        houseNumber: props.NAME_ONR || "",
        postalCode: props.PLZ || "",
        district: props.GEB_BEZIRK || "",
        coordinates: {
          lng: feature.geometry.coordinates[0],
          lat: feature.geometry.coordinates[1],
        },
      };
    });
}

/**
 * Build CQL filter for address search.
 * - "Mariahilf" → street starts with "Mariahilf"
 * - "Mariahilfer Straße 2" → street match + house number starts with "2"
 */
function buildCqlFilter(query: string): string {
  // Try to split into street + house number (number at the end)
  const match = query.match(/^(.+?)\s+(\d+\S*)$/);

  if (match) {
    const street = escapeCql(match[1]);
    const number = escapeCql(match[2]);
    return `NAME_STR ILIKE '${street}%' AND NAME_ONR LIKE '${number}%'`;
  }

  // Street only
  return `NAME_STR ILIKE '${escapeCql(query)}%'`;
}

/**
 * Escape single quotes in CQL filter values.
 */
function escapeCql(value: string): string {
  return value.replace(/'/g, "''");
}
