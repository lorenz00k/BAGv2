import type { Address } from "./types.js";
import { convertMGItoWGS84 } from "../utils/coordinates.js";
import { fetchViennaOGD } from "../utils/api.js";

interface AddressFeature {
  properties: {
    Adresse?: string;
    StreetName?: string;
    StreetNumber?: string;
    PostalCode?: number | string;
    Bezirk?: string;
  };
  geometry: {
    coordinates: [number, number];
  };
}

interface AddressResponse {
  features?: AddressFeature[];
}

/**
 * Search for addresses in Vienna
 */
export async function searchAddress(query: string): Promise<Address[]> {
  const encodedQuery = encodeURIComponent(query);
  const url = `https://data.wien.gv.at/daten/OGDAddressService.svc/GetAddressInfo?Address=${encodedQuery}`;

  const data = await fetchViennaOGD<AddressResponse>(url, "searchAddress");

  if (!data || !data.features || data.features.length === 0) {
    return [];
  }

  return data.features.map((feature) => {
    const props = feature.properties;

    // Convert MGI coordinates to WGS84
    const coords = convertMGItoWGS84(
      feature.geometry.coordinates[0],
      feature.geometry.coordinates[1]
    );

    return {
      fullAddress: props.Adresse || "Unbekannte Adresse",
      street: props.StreetName || "",
      houseNumber: props.StreetNumber || "",
      postalCode: props.PostalCode?.toString() || "",
      district: props.Bezirk || "",
      coordinates: coords,
    };
  });
}