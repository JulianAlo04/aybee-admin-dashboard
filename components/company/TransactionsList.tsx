"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCredits, cn } from "@/lib/utils";
import type { TransactionRow } from "@/lib/types";

interface TransactionsListProps {
  transactions: TransactionRow[];
  loading: boolean;
}

const txTypeVariant: Record<string, "red" | "green" | "blue"> = {
  Use: "red",
  Buy: "green",
  "Credit Allocation": "blue",
};

const projectStatusVariant: Record<string, "green" | "blue" | "amber" | "red" | "slate"> = {
  Running: "green",
  "In Review": "blue",
  Paused: "amber",
  Finished: "slate",
  Cancelled: "red",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function TransactionRow({ tx }: { tx: TransactionRow }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-slate-800 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800/40 transition-colors text-left"
      >
        {/* Expand icon */}
        <span className="text-slate-600 text-xs w-4 shrink-0">
          {open ? "▾" : "▸"}
        </span>

        {/* Type badge */}
        <Badge variant={txTypeVariant[tx.type] ?? "slate"} className="shrink-0">
          {tx.type}
        </Badge>

        {/* Info */}
        <span className="flex-1 text-sm text-slate-300 truncate">
          {tx.info || "—"}
        </span>

        {/* Project status */}
        {tx.projectStatus && (
          <Badge variant={projectStatusVariant[tx.projectStatus] ?? "slate"} className="shrink-0">
            {tx.projectStatus}
          </Badge>
        )}

        {/* Total credits */}
        <span className={cn(
          "text-sm font-mono font-semibold tabular-nums shrink-0 w-24 text-right",
          tx.type === "Use" ? "text-red-400" : "text-green-400"
        )}>
          {tx.type === "Use" ? "−" : "+"}{formatCredits(tx.totalCredits)}
        </span>

        {/* Date */}
        <span className="text-xs text-slate-500 shrink-0 w-36 text-right">
          {formatDate(tx.createdDate)}
        </span>
      </button>

      {/* Expanded credit transactions */}
      {open && (
        <div className="border-t border-slate-800 bg-slate-900/60">
          {tx.creditTransactions.length === 0 ? (
            <p className="text-xs text-slate-500 px-10 py-3">No credit transaction details available</p>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-600 uppercase tracking-wider border-b border-slate-800/60">
                  <th className="px-10 py-2 text-left font-medium">Credit Transaction</th>
                  <th className="px-4 py-2 text-left font-medium">Type</th>
                  <th className="px-4 py-2 text-right font-medium">Amount</th>
                  <th className="px-4 py-2 text-right font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {tx.creditTransactions.map((ct) => (
                  <tr key={ct.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-10 py-2 text-slate-400 truncate max-w-xs">
                      {ct.info || "—"}
                    </td>
                    <td className="px-4 py-2">
                      <Badge variant={ct.type === "Use" ? "red" : "green"}>
                        {ct.type}
                      </Badge>
                    </td>
                    <td className={cn(
                      "px-4 py-2 text-right tabular-nums font-mono font-semibold",
                      ct.type === "Use" ? "text-red-400" : "text-green-400"
                    )}>
                      {ct.type === "Use" ? "−" : "+"}{formatCredits(ct.amount)}
                    </td>
                    <td className="px-4 py-2 text-right text-slate-500">
                      {formatDate(ct.createdDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default function TransactionsList({ transactions, loading }: TransactionsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base text-slate-200">
          Transactions
          {!loading && (
            <span className="ml-2 text-xs font-normal text-slate-500">
              ({transactions.length} total · click to expand credit transactions)
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {loading ? (
          <>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </>
        ) : transactions.length === 0 ? (
          <p className="text-sm text-slate-500 py-6 text-center">No transactions found for this company</p>
        ) : (
          transactions.map((tx) => <TransactionRow key={tx.id} tx={tx} />)
        )}
      </CardContent>
    </Card>
  );
}
