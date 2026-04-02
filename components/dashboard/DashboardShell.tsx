"use client";

import { useEffect, useState, useCallback } from "react";
import StatsBar from "./StatsBar";
import CreditBurnChart from "./CreditBurnChart";
import CompaniesTable from "./CompaniesTable";
import CreditPackagesPanel from "./CreditPackagesPanel";
import LiveIndicator from "./LiveIndicator";
import type { CompaniesResponse, PackagesResponse, TransactionsResponse } from "@/lib/types";

const POLL_INTERVAL = 30_000;

export default function DashboardShell() {
  const [companies, setCompanies] = useState<CompaniesResponse | null>(null);
  const [packages, setPackages] = useState<PackagesResponse | null>(null);
  const [transactions, setTransactions] = useState<TransactionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      const [c, p, t] = await Promise.all([
        fetch("/api/companies").then((r) => r.json()),
        fetch("/api/credit-packages").then((r) => r.json()),
        fetch("/api/credit-transactions").then((r) => r.json()),
      ]);

      if (c.error || p.error || t.error) {
        setError(c.error ?? p.error ?? t.error);
        return;
      }

      setCompanies(c);
      setPackages(p);
      setTransactions(t);
      setLastRefreshed(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const timer = setInterval(fetchAll, POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [fetchAll]);

  if (error) {
    return (
      <div className="rounded-xl border border-red-800 bg-red-950/40 p-6 text-center">
        <p className="text-red-400 font-medium">Failed to load dashboard data</p>
        <p className="text-red-500 text-sm mt-1">{error}</p>
        <button
          onClick={fetchAll}
          className="mt-4 px-4 py-2 text-sm bg-red-900/60 hover:bg-red-900 text-red-300 rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <LiveIndicator lastRefreshed={lastRefreshed} />
      </div>
      <StatsBar
        companies={companies}
        packages={packages}
        transactions={transactions}
        loading={loading}
      />
      <CreditBurnChart data={transactions?.burnSeries ?? []} loading={loading} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CompaniesTable companies={companies?.companies ?? []} loading={loading} />
        <CreditPackagesPanel packages={packages?.packages ?? []} loading={loading} />
      </div>
    </div>
  );
}
