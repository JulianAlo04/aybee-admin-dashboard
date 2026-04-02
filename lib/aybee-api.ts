const BASE = "https://platform.aybee.ai/version-live/api/1.1";

interface AybeePageResponse<T> {
  response: {
    cursor: number;
    results: T[];
    count: number;
    remaining: number;
  };
}

interface AybeeSingleResponse<T> {
  response: T;
}

export interface FetchOptions {
  constraints?: Array<{ key: string; constraint_type: string; value: unknown }>;
  sortField?: string;
  descending?: boolean;
}

function buildUrl(endpoint: string, cursor: number, options?: FetchOptions): string {
  let url = `${BASE}${endpoint}?limit=100&cursor=${cursor}`;
  if (options?.constraints?.length) {
    url += `&constraints=${encodeURIComponent(JSON.stringify(options.constraints))}`;
  }
  if (options?.sortField) {
    url += `&sort_field=${encodeURIComponent(options.sortField)}&descending=${options.descending ?? false}`;
  }
  return url;
}

export async function fetchAllPages<T>(endpoint: string, options?: FetchOptions): Promise<T[]> {
  const token = process.env.AYBEE_API_TOKEN;
  if (!token) throw new Error("AYBEE_API_TOKEN is not set");

  const results: T[] = [];
  let cursor = 0;

  while (true) {
    const res = await fetch(buildUrl(endpoint, cursor, options), {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Aybee API error: ${res.status} ${res.statusText}`);
    }

    const data: AybeePageResponse<T> = await res.json();
    const page = data.response.results ?? [];
    results.push(...page);

    if (data.response.remaining === 0 || page.length === 0) break;
    cursor += 100;
  }

  return results;
}

export async function fetchOne<T>(path: string): Promise<T> {
  const token = process.env.AYBEE_API_TOKEN;
  if (!token) throw new Error("AYBEE_API_TOKEN is not set");

  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Aybee API error: ${res.status} ${res.statusText}`);
  }

  const data: AybeeSingleResponse<T> = await res.json();
  return data.response;
}
