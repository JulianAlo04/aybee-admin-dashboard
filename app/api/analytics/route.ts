import { NextResponse } from "next/server";
import { fetchAllPages } from "@/lib/aybee-api";
import type {
  Company,
  CreditTransaction,
  AnalyticsResponse,
  TopBurner,
  TierDistributionPoint,
  StatusDistributionPoint,
} from "@/lib/types";

export async function GET() {
  try {
    const [companies, txns] = await Promise.all([
      fetchAllPages<Company>("/obj/company"),
      fetchAllPages<CreditTransaction>("/obj/credittransaction"),
    ]);

    // --- Top burners: last 30 days ---
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);

    const recentUse = txns.filter(
      (t) => t["CreditTransaction Type"] === "Use" && new Date(t["Created Date"]) >= cutoff && t.Company
    );

    const burnByCompany = new Map<string, number>();
    for (const t of recentUse) {
      burnByCompany.set(t.Company!, (burnByCompany.get(t.Company!) ?? 0) + t.creditAmount);
    }

    const companyMap = new Map(companies.map((c) => [c._id, c.name ?? c.nameLowercase ?? "Unknown"]));

    const topBurners: TopBurner[] = Array.from(burnByCompany.entries())
      .map(([companyId, creditsUsed]) => ({
        companyId,
        companyName: companyMap.get(companyId) ?? "Unknown",
        creditsUsed,
      }))
      .sort((a, b) => b.creditsUsed - a.creditsUsed)
      .slice(0, 10);

    // --- Tier distribution ---
    const tierMap = new Map<string, { count: number; totalBalance: number }>();
    for (const c of companies) {
      const tier = c["OS Credit Package"] ?? "As you go";
      const entry = tierMap.get(tier) ?? { count: 0, totalBalance: 0 };
      entry.count += 1;
      entry.totalBalance += c.numberCredits ?? 0;
      tierMap.set(tier, entry);
    }
    const tierDistribution: TierDistributionPoint[] = Array.from(tierMap.entries())
      .map(([tier, { count, totalBalance }]) => ({ tier, companyCount: count, totalBalance }))
      .sort((a, b) => b.companyCount - a.companyCount);

    // --- Status distribution ---
    const statusMap = new Map<string, number>();
    for (const c of companies) {
      const s = c.status ?? "Registered";
      statusMap.set(s, (statusMap.get(s) ?? 0) + 1);
    }
    const statusDistribution: StatusDistributionPoint[] = Array.from(statusMap.entries())
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({
      topBurners,
      tierDistribution,
      statusDistribution,
    } satisfies AnalyticsResponse);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
