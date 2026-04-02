import { NextResponse } from "next/server";
import { fetchAllPages } from "@/lib/aybee-api";
import type { CreditPackage, PackagesResponse, PackageRow } from "@/lib/types";

export async function GET() {
  try {
    const packages = await fetchAllPages<CreditPackage>("/obj/creditpackage");

    const activePackages = packages.filter(
      (p) => p["OS Credit Package Status"] === "Active" && (p.initialCredits ?? 0) > 0
    );

    const rows: PackageRow[] = activePackages.map((p) => {
      const initial = p.initialCredits ?? 0;
      const remaining = p.remainingCredits ?? 0;
      const used = initial > 0 ? ((initial - remaining) / initial) * 100 : 0;

      return {
        id: p._id,
        companyName: p.companyNameLowercase ?? "Unknown",
        tier: p["OS Credit Package"],
        status: p["OS Credit Package Status"],
        initialCredits: initial,
        remainingCredits: remaining,
        usedPercent: Math.min(100, Math.max(0, used)),
        renewalDate: p.renewalDate,
      };
    });

    // Sort by usedPercent descending — most consumed first
    rows.sort((a, b) => b.usedPercent - a.usedPercent);

    return NextResponse.json({
      packages: rows,
      activeCount: rows.length,
    } satisfies PackagesResponse);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
