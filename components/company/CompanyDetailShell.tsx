"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import CompanyStats from "./CompanyStats";
import CreditHistoryChart from "./CreditHistoryChart";
import MonthlyUsageChart from "./MonthlyUsageChart";
import TransactionsList from "./TransactionsList";
import CompanyPackages from "./CompanyPackages";
import { formatCredits, cn } from "@/lib/utils";
import type { CompanyDetailResponse, CompanyTransactionsResponse } from "@/lib/types";

interface Props {
  companyId: string;
}

const statusVariant: Record<string, "blue" | "slate" | "amber" | "purple"> = {
  "Package Customer": "blue",
  "As you go": "slate",
  Registered: "amber",
  "One-Off": "purple",
};

const tierVariant: Record<string, "green" | "blue" | "indigo" | "purple" | "slate"> = {
  Explorer: "green",
  Business: "blue",
  Team: "indigo",
  "Custom/Enterprise": "purple",
  "As you go": "slate",
};

export default function CompanyDetailShell({ companyId }: Props) {
  const [detail, setDetail] = useState<CompanyDetailResponse | null>(null);
  const [txData, setTxData] = useState<CompanyTransactionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [d, t] = await Promise.all([
        fetch(`/api/companies/${companyId}`).then((r) => r.json()),
        fetch(`/api/companies/${companyId}/transactions`).then((r) => r.json()),
      ]);
      if (d.error || t.error) {
        setError(d.error ?? t.error);
        return;
      }
      setDetail(d);
      setTxData(t);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load company");
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (error) {
    return (
      <main className="p-6 max-w-screen-2xl mx-auto">
        <Link href="/" className="text-sm text-slate-400 hover:text-slate-200 mb-6 inline-flex items-center gap-1">
          ← Back to Dashboard
        </Link>
        <div className="rounded-xl border border-red-800 bg-red-950/40 p-6 text-center mt-6">
          <p className="text-red-400 font-medium">Failed to load company data</p>
          <p className="text-red-500 text-sm mt-1">{error}</p>
          <button onClick={fetchData} className="mt-4 px-4 py-2 text-sm bg-red-900/60 hover:bg-red-900 text-red-300 rounded-lg transition-colors">
            Retry
          </button>
        </div>
      </main>
    );
  }

  const company = detail?.company;

  return (
    <main className="p-6 max-w-screen-2xl mx-auto space-y-6">
      {/* Back link */}
      <Link href="/" className="text-sm text-slate-400 hover:text-slate-200 inline-flex items-center gap-1 transition-colors">
        ← Back to Dashboard
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          {loading ? (
            <>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-40" />
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-white tracking-tight">{company?.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={tierVariant[company?.packageTier ?? ""] ?? "slate"}>
                  {company?.packageTier}
                </Badge>
                <Badge variant={statusVariant[company?.status ?? ""] ?? "slate"}>
                  {company?.status}
                </Badge>
                {company?.allowOvercharge && (
                  <Badge variant="amber">Overcharge allowed</Badge>
                )}
              </div>
            </>
          )}
        </div>

        {!loading && company && (
          <div className="text-right shrink-0">
            <p className="text-xs text-slate-500 mb-0.5">Current Balance</p>
            <p className={cn(
              "text-3xl font-bold tabular-nums",
              company.creditBalance < 0 ? "text-red-400" : company.creditBalance < 100 ? "text-amber-400" : "text-green-400"
            )}>
              {formatCredits(company.creditBalance)}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">credits</p>
          </div>
        )}
      </div>

      {/* KPI cards */}
      <CompanyStats
        detail={detail}
        txData={txData}
        loading={loading}
      />

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CreditHistoryChart burnSeries={txData?.burnSeries ?? []} loading={loading} />
        <MonthlyUsageChart monthlySeries={txData?.monthlySeries ?? []} loading={loading} />
      </div>

      {/* Packages */}
      {(loading || (detail?.packages?.length ?? 0) > 0) && (
        <CompanyPackages packages={detail?.packages ?? []} loading={loading} />
      )}

      {/* Transactions */}
      <TransactionsList transactions={txData?.transactions ?? []} loading={loading} />
    </main>
  );
}
