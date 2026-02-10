import type { AddressSuggestion, ViennaGISResult } from "@/types/viennagis";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

// ---------------------------------------------------------------------------
// Error handling
// ---------------------------------------------------------------------------

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly data: unknown,
  ) {
    super(`API error ${status}`);
    this.name = "ApiError";
  }
}

// ---------------------------------------------------------------------------
// Base fetch wrapper
// ---------------------------------------------------------------------------

async function fetchApi<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE}${path}`;

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ApiError(response.status, body);
  }

  return response.json() as Promise<T>;
}

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
