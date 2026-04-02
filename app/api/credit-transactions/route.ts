import { NextResponse } from "next/server";
import { fetchAllPages } from "@/lib/aybee-api";
import type { CreditTransaction, TransactionsResponse, BurnDataPoint } from "@/lib/types";

export async function GET() {
  try {
    const txns = await fetchAllPages<CreditTransaction>("/obj/credittransaction");

    const now = new Date();
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() - 30);

    // Filter to last 30 days
    const recent = txns.filter((t) => new Date(t["Created Date"]) >= cutoff);

    // Group by date string "YYYY-MM-DD"
    const byDay = new Map<string, { used: number; bought: number }>();
    for (const t of recent) {
      const day = t["Created Date"].slice(0, 10);
      const entry = byDay.get(day) ?? { used: 0, bought: 0 };
      if (t["CreditTransaction Type"] === "Use") {
        entry.used += t.creditAmount;
      } else {
        entry.bought += t.creditAmount;
      }
      byDay.set(day, entry);
    }

    // Build a complete 30-day series (fill missing days with 0)
    const series: BurnDataPoint[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const entry = byDay.get(key) ?? { used: 0, bought: 0 };
      series.push({ date: key, creditsUsed: entry.used, creditsBought: entry.bought });
    }

    const todayKey = now.toISOString().slice(0, 10);
    const todayUsed = byDay.get(todayKey)?.used ?? 0;

    // Total credits ever purchased
    const totalCreditsInSystem = txns
      .filter((t) => t["CreditTransaction Type"] === "Buy")
      .reduce((acc, t) => acc + t.creditAmount, 0);

    return NextResponse.json({
      burnSeries: series,
      todayUsed,
      totalCreditsInSystem,
    } satisfies TransactionsResponse);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
