import { NextResponse } from "next/server";
import { fetchAllPages } from "@/lib/aybee-api";
import type {
  Transaction,
  CreditTransaction,
  CompanyTransactionsResponse,
  TransactionRow,
  CreditTransactionRow,
  BurnDataPoint,
  MonthlyDataPoint,
} from "@/lib/types";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const constraints = [{ key: "Company", constraint_type: "equals", value: id }];

    // Fetch transactions and credit transactions for this company in parallel
    const [transactions, creditTxns] = await Promise.all([
      fetchAllPages<Transaction>("/obj/transaction", {
        constraints,
        sortField: "Created Date",
        descending: true,
      }),
      fetchAllPages<CreditTransaction>("/obj/credittransaction", {
        constraints,
        sortField: "Created Date",
        descending: true,
      }),
    ]);

    // Index credit transactions by ID for fast lookup
    const creditTxnMap = new Map<string, CreditTransaction>(creditTxns.map((ct) => [ct._id, ct]));

    // Build transaction rows
    const transactionRows: TransactionRow[] = transactions.map((tx) => {
      const ctIds = tx["Credit Transactions"] ?? [];
      const ctRows: CreditTransactionRow[] = ctIds
        .map((ctId) => {
          const ct = creditTxnMap.get(ctId);
          if (!ct) return null;
          return {
            id: ct._id,
            amount: ct.creditAmount,
            type: ct["CreditTransaction Type"],
            info: ct.Info ?? "",
            createdDate: ct["Created Date"],
          } satisfies CreditTransactionRow;
        })
        .filter((ct): ct is CreditTransactionRow => ct !== null);

      const totalCredits = ctRows.reduce((sum, ct) => sum + ct.amount, 0);

      return {
        id: tx._id,
        type: tx["OS Transaction Type"],
        info: tx.information ?? "",
        projectStatus: tx["OS Project Status"],
        createdDate: tx["Created Date"],
        creditTransactions: ctRows,
        totalCredits,
      } satisfies TransactionRow;
    });

    // Aggregate totals
    let totalUsed = 0;
    let totalBought = 0;
    for (const ct of creditTxns) {
      if (ct["CreditTransaction Type"] === "Use") totalUsed += ct.creditAmount;
      else totalBought += ct.creditAmount;
    }

    // 30-day burn series for the company chart
    const now = new Date();
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() - 30);
    const recent = creditTxns.filter((t) => new Date(t["Created Date"]) >= cutoff);

    const byDay = new Map<string, { used: number; bought: number }>();
    for (const t of recent) {
      const day = t["Created Date"].slice(0, 10);
      const entry = byDay.get(day) ?? { used: 0, bought: 0 };
      if (t["CreditTransaction Type"] === "Use") entry.used += t.creditAmount;
      else entry.bought += t.creditAmount;
      byDay.set(day, entry);
    }
    const burnSeries: BurnDataPoint[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const entry = byDay.get(key) ?? { used: 0, bought: 0 };
      burnSeries.push({ date: key, creditsUsed: entry.used, creditsBought: entry.bought });
    }

    // Monthly series — last 6 months
    const byMonth = new Map<string, { used: number; bought: number }>();
    for (const t of creditTxns) {
      const dt = new Date(t["Created Date"]);
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
      const entry = byMonth.get(key) ?? { used: 0, bought: 0 };
      if (t["CreditTransaction Type"] === "Use") entry.used += t.creditAmount;
      else entry.bought += t.creditAmount;
      byMonth.set(key, entry);
    }

    const monthlySeries: MonthlyDataPoint[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      const entry = byMonth.get(key) ?? { used: 0, bought: 0 };
      monthlySeries.push({ month: label, creditsUsed: entry.used, creditsBought: entry.bought });
    }

    return NextResponse.json({
      transactions: transactionRows,
      totalUsed,
      totalBought,
      monthlySeries,
      burnSeries,
    } satisfies CompanyTransactionsResponse);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
