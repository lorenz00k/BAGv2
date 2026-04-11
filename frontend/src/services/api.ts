const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

// ---------------------------------------------------------------------------
// Error handling
// ---------------------------------------------------------------------------

//Hier könnten wir uns überlegen ob wir nicht einfach doch auch loggen wollen mit pino 

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly data: unknown,
  ) {
    const message = (data as Record<string, unknown>)?.message ?? (data as Record<string, unknown>)?.error;
    super(typeof message === "string" ? message : `API error ${status}`); 
    this.name = "ApiError";
  }
}

// ---------------------------------------------------------------------------
// Base fetch wrapper
// ---------------------------------------------------------------------------

export async function fetchApi<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE}${path}`;

  const response = await fetch(url, {
    credentials: "include",
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

