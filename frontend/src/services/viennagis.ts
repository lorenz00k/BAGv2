import { AddressSuggestion, ViennaGISResult } from "@/types/viennagis";
import { fetchApi } from "./api";

// ---------------------------------------------------------------------------
// ViennaGIS endpoints
// ---------------------------------------------------------------------------

/**
 * GET /api/viennagis/autocomplete?q=…
 * Returns up to 10 address suggestions for the given query.
 */
export async function autocompleteAddress(
  query: string,
): Promise<AddressSuggestion[]> {
  const params = new URLSearchParams({ q: query });
  const data = await fetchApi<{ suggestions: AddressSuggestion[] }>(
    `/api/viennagis/autocomplete?${params}`,
  );
  return data.suggestions;
}

/**
 * POST /api/viennagis/check
 * Runs the full location analysis for the given address string.
 */
export async function checkAddress(
  address: string,
): Promise<ViennaGISResult> {
  return fetchApi<ViennaGISResult>("/api/viennagis/check", {
    method: "POST",
    body: JSON.stringify({ address }),
  });
}
