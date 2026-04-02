"use client";

import { useEffect, useState, useCallback } from "react";
import StatsBar from "./StatsBar";
import CreditBurnChart from "./CreditBurnChart";
import CompaniesTable from "./CompaniesTable";
import CreditPackagesPanel from "./CreditPackagesPanel";
import TopBurnersChart from "./TopBurnersChart";
import TierDistributionChart from "./TierDistributionChart";
import LiveIndicator from "./LiveIndicator";
import type {
  CompaniesResponse,
  PackagesResponse,
  TransactionsResponse,
  AnalyticsResponse,
} from "@/lib/types";

const POLL_INTERVAL = 30_000;

export default function DashboardShell() {
  const [companies, setCompanies] = useState<CompaniesResponse | null>(null);
  const [packages, setPackages] = useState<PackagesResponse | null>(null);
  const [transactions, setTransactions] = useState<TransactionsResponse | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      const [c, p, t, a] = await Promise.all([
        fetch("/api/companies").then((r) => r.json()),
        fetch("/api/credit-packages").then((r) => r.json()),
        fetch("/api/credit-transactions").then((r) => r.json()),
        fetch("/api/analytics").then((r) => r.json()),
      ]);

      if (c.error || p.error || t.error || a.error) {
        setError(c.error ?? p.error ?? t.error ?? a.error);
        return;
      }

      setCompanies(c);
      setPackages(p);
      setTransactions(t);
      setAnalytics(a);
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

      {/* KPI row */}
      <StatsBar
        companies={companies}
        packages={packages}
        transactions={transactions}
        loading={loading}
      />

      {/* Credit burn line chart */}
      <CreditBurnChart data={transactions?.burnSeries ?? []} loading={loading} />

      {/* Top burners + Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopBurnersChart
          burners={analytics?.topBurners ?? []}
          loading={loading}
        />
        <TierDistributionChart
          tierData={analytics?.tierDistribution ?? []}
          statusData={analytics?.statusDistribution ?? []}
          loading={loading}
        />
      </div>

      {/* Companies table + Packages panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CompaniesTable companies={companies?.companies ?? []} loading={loading} />
        <CreditPackagesPanel packages={packages?.packages ?? []} loading={loading} />
      </div>
    </div>
  );
}
