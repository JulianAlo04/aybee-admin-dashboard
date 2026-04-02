const BASE = "https://platform.aybee.ai/version-live/api/1.1";

interface AybeePageResponse<T> {
  response: {
    cursor: number;
    results: T[];
    count: number;
    remaining: number;
  };
}

export async function fetchAllPages<T>(endpoint: string): Promise<T[]> {
  const token = process.env.AYBEE_API_TOKEN;
  if (!token) throw new Error("AYBEE_API_TOKEN is not set");

  const results: T[] = [];
  let cursor = 0;

  while (true) {
    const res = await fetch(`${BASE}${endpoint}?limit=100&cursor=${cursor}`, {
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
