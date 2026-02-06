import type { ViennaGISResult } from "./types.js";
import { searchAddress } from "./address.service.js";
import { getNearbyPOIs } from "./poi.service.js";
import { getZoningInfo } from "./zoning.service.js";
import { getNoiseInfo } from "./noise.service.js";
import { getPlanDocumentInfo } from "./plandocument.service.js";

/**
 * Perform full Vienna GIS check for an address
 * 
 * @param query - Address to search (e.g. "Mariahilfer Straße 123")
 * @returns Complete location information or not found result
 */
export async function performFullCheck(
  query: string
): Promise<ViennaGISResult> {
  // Step 1: Search address
  const addresses = await searchAddress(query);

  if (addresses.length === 0) {
  return {
    found: false,
    pois: [],
    zoning: undefined,
    planDocument: undefined,
    noise: undefined,
    energyPlan: undefined,
    floodRisk: undefined,
    waterProtection: undefined,
    loadingZones: [],
    trafficZones: undefined,
};
  }

  // Take first result (guaranteed to exist because addresses.length > 0)
  const address = addresses[0]!; // Non-null assertion (safe here!)
  const { lat, lng } = address.coordinates;

  // Step 2: Load all data in parallel with graceful degradation
  const [poisResult, zoningResult, noiseResult, planDocResult] = 
    await Promise.allSettled([
      getNearbyPOIs(lat, lng, 200),
      getZoningInfo(lat, lng),
      getNoiseInfo(lat, lng),
      getPlanDocumentInfo(lat, lng), 
    ]);

  // Extract results (fallback to empty/undefined if failed)
  const pois = poisResult.status === "fulfilled" ? poisResult.value : [];
  const zoning = zoningResult.status === "fulfilled" ? zoningResult.value : undefined;
  const noise = noiseResult.status === "fulfilled" ? noiseResult.value : undefined;
  const planDocument = planDocResult.status === "fulfilled" ? planDocResult.value : undefined;

  // Type-safe return: address is guaranteed to exist when found: true
  return {
  found: true,
  address,
  pois,
  zoning,
  planDocument,
  noise,
  energyPlan: undefined,
  floodRisk: undefined,
  waterProtection: undefined,
  loadingZones: [],
  trafficZones: undefined,
  };
}

// Export all services (falls später einzeln gebraucht)
export { searchAddress } from "./address.service.js";
export { getNearbyPOIs } from "./poi.service.js";
export { getZoningInfo } from "./zoning.service.js";
export { getNoiseInfo } from "./noise.service.js";
export { getPlanDocumentInfo } from "./plandocument.service.js";

// Export types
export * from "./types.js";