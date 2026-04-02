import { NextResponse } from "next/server";
import { fetchOne, fetchAllPages } from "@/lib/aybee-api";
import type { Company, CreditPackage, CompanyDetailResponse, PackageRow } from "@/lib/types";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const company = await fetchOne<Company>(`/obj/company/${id}`);

    // Fetch all packages and filter to this company's IDs
    const packageIds = new Set(company["Credit Packages"] ?? []);
    let packages: PackageRow[] = [];

    if (packageIds.size > 0) {
      const allPackages = await fetchAllPages<CreditPackage>("/obj/creditpackage");
      packages = allPackages
        .filter((p) => packageIds.has(p._id))
        .map((p) => {
          const initial = p.initialCredits ?? 0;
          const remaining = p.remainingCredits ?? 0;
          const used = initial > 0 ? ((initial - remaining) / initial) * 100 : 0;
          return {
            id: p._id,
            companyName: p.companyNameLowercase ?? company.nameLowercase ?? company.name ?? "Unknown",
            tier: p["OS Credit Package"],
            status: p["OS Credit Package Status"],
            initialCredits: initial,
            remainingCredits: remaining,
            usedPercent: Math.min(100, Math.max(0, used)),
            renewalDate: p.renewalDate,
          };
        })
        .sort((a, b) => b.usedPercent - a.usedPercent);
    }

    return NextResponse.json({
      company: {
        id: company._id,
        name: company.name ?? company.nameLowercase ?? "Unknown",
        status: company.status ?? "Registered",
        creditBalance: company.numberCredits ?? 0,
        packageTier: company["OS Credit Package"] ?? "As you go",
        allowOvercharge: company.allowOvercharge ?? false,
      },
      packages,
    } satisfies CompanyDetailResponse);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
