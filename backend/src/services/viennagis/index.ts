import type { ViennaGISResult } from "./types.js";
import { searchAddress } from "./address.service.js";
import { getNearbyPOIs } from "./poi.service.js";
import { getZoningInfo } from "./zoning.service.js";
import { getNoiseInfo } from "./noise.service.js";
import { getEnergyPlanInfo } from "./energyplan.service.js";
import { getRealnutzungInfo } from "./realnutzung.service.js";

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
      noise: undefined,
      energyPlan: undefined,
      realnutzung: undefined,
      floodRisk: undefined,
      waterProtection: undefined,
      loadingZones: [],
      trafficZones: undefined,
    };
  }

  const address = addresses[0]!;
  const { lat, lng } = address.coordinates;

  // Step 2: Load all data in parallel with graceful degradation
  const [
    poisResult,
    zoningResult,
    noiseResult,
    energyPlanResult,
    realnutzungResult,
  ] = await Promise.allSettled([
    getNearbyPOIs(lat, lng, 200),
    getZoningInfo(lat, lng),
    getNoiseInfo(lat, lng),
    getEnergyPlanInfo(lat, lng),
    getRealnutzungInfo(lat, lng),
  ]);

  // Step 3: Extract results (fallback to empty/undefined if failed)
  const pois =
    poisResult.status === "fulfilled" ? poisResult.value : [];
  const zoning =
    zoningResult.status === "fulfilled" ? zoningResult.value : undefined;
  const noise =
    noiseResult.status === "fulfilled" ? noiseResult.value : undefined;
  const energyPlan =
    energyPlanResult.status === "fulfilled" ? energyPlanResult.value : undefined;
  const realnutzung =
    realnutzungResult.status === "fulfilled" ? realnutzungResult.value : undefined;

  return {
    found: true,
    address,
    pois,
    zoning,
    noise,
    energyPlan,
    realnutzung,
    floodRisk: undefined,       // TODO: implement
    waterProtection: undefined,  // TODO: implement
    loadingZones: [],            // TODO: implement
    trafficZones: undefined,     // TODO: implement
  };
}

// Re-export all services
export { searchAddress } from "./address.service.js";
export { getNearbyPOIs } from "./poi.service.js";
export { getZoningInfo } from "./zoning.service.js";
export { getNoiseInfo } from "./noise.service.js";
export { getEnergyPlanInfo } from "./energyplan.service.js";
export { getRealnutzungInfo } from "./realnutzung.service.js";

// Export types
export * from "./types.js";
