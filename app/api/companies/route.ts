import { NextResponse } from "next/server";
import { fetchAllPages } from "@/lib/aybee-api";
import type { Company, CompaniesResponse, CompanyRow } from "@/lib/types";

export async function GET() {
  try {
    const companies = await fetchAllPages<Company>("/obj/company");

    const rows: CompanyRow[] = companies.map((c) => ({
      id: c._id,
      name: c.name ?? c.nameLowercase ?? "Unknown",
      status: c.status ?? "Registered",
      creditBalance: c.numberCredits ?? 0,
      packageTier: c["OS Credit Package"] ?? "As you go",
    }));

    // Sort ascending by credit balance — lowest (most urgent) first
    rows.sort((a, b) => a.creditBalance - b.creditBalance);

    return NextResponse.json({
      companies: rows,
      totalCount: rows.length,
    } satisfies CompaniesResponse);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
