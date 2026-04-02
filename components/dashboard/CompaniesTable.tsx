"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCredits, cn } from "@/lib/utils";
import type { CompanyRow } from "@/lib/types";

interface CompaniesTableProps {
  companies: CompanyRow[];
  loading: boolean;
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

const ALL_TIERS = ["Explorer", "Business", "Team", "Custom/Enterprise", "As you go"];
const ALL_STATUSES = ["Package Customer", "As you go", "Registered", "One-Off"];

function FilterPill({
  label,
  active,
  variant,
  onClick,
}: {
  label: string;
  active: boolean;
  variant: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-2.5 py-1 rounded-full text-xs font-medium border transition-all",
        active
          ? "bg-slate-200 text-slate-900 border-slate-200"
          : "bg-transparent text-slate-400 border-slate-700 hover:border-slate-500"
      )}
    >
      {label}
    </button>
  );
}

export default function CompaniesTable({ companies, loading }: CompaniesTableProps) {
  const [tierFilters, setTierFilters] = useState<Set<string>>(new Set());
  const [statusFilters, setStatusFilters] = useState<Set<string>>(new Set());

  function toggleFilter(set: Set<string>, value: string, setter: (s: Set<string>) => void) {
    const next = new Set(set);
    next.has(value) ? next.delete(value) : next.add(value);
    setter(next);
  }

  const filtered = useMemo(() => {
    return companies.filter((c) => {
      const tierOk = tierFilters.size === 0 || tierFilters.has(c.packageTier);
      const statusOk = statusFilters.size === 0 || statusFilters.has(c.status);
      return tierOk && statusOk;
    });
  }, [companies, tierFilters, statusFilters]);

  const displayed = filtered.slice(0, 100);

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-slate-200">
          Company Credit Balances
          {!loading && (
            <span className="ml-2 text-xs font-normal text-slate-500">
              {filtered.length !== companies.length
                ? `${filtered.length} of ${companies.length} companies`
                : `${companies.length} companies · lowest balance first`}
            </span>
          )}
        </CardTitle>

        {!loading && (
          <div className="mt-3 space-y-2">
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-xs text-slate-500 mr-1">Tier:</span>
              {ALL_TIERS.map((tier) => (
                <FilterPill
                  key={tier}
                  label={tier}
                  active={tierFilters.has(tier)}
                  variant={tierVariant[tier] ?? "slate"}
                  onClick={() => toggleFilter(tierFilters, tier, setTierFilters)}
                />
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-xs text-slate-500 mr-1">Status:</span>
              {ALL_STATUSES.map((status) => (
                <FilterPill
                  key={status}
                  label={status}
                  active={statusFilters.has(status)}
                  variant={statusVariant[status] ?? "slate"}
                  onClick={() => toggleFilter(statusFilters, status, setStatusFilters)}
                />
              ))}
            </div>
            {(tierFilters.size > 0 || statusFilters.size > 0) && (
              <button
                onClick={() => {
                  setTierFilters(new Set());
                  setStatusFilters(new Set());
                }}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0 overflow-auto max-h-[480px]">
        {loading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : displayed.length === 0 ? (
          <p className="text-sm text-slate-500 py-8 text-center">No companies match the selected filters</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-slate-900 z-10">
              <tr className="border-b border-slate-800 text-xs text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-3 text-left font-medium">Company</th>
                <th className="px-4 py-3 text-right font-medium">Balance</th>
                <th className="px-4 py-3 text-left font-medium">Tier</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {displayed.map((company) => (
                <tr key={company.id} className="hover:bg-slate-800/40 transition-colors group">
                  <td className="px-4 py-2.5 max-w-[180px]">
                    <Link
                      href={`/company/${company.id}`}
                      className="text-slate-200 font-medium hover:text-blue-400 transition-colors truncate block"
                    >
                      {company.name}
                    </Link>
                  </td>
                  <td
                    className={cn(
                      "px-4 py-2.5 text-right tabular-nums font-mono text-sm font-semibold",
                      company.creditBalance < 0
                        ? "text-red-400"
                        : company.creditBalance < 100
                        ? "text-amber-400"
                        : "text-slate-300"
                    )}
                  >
                    {formatCredits(company.creditBalance)}
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge variant={tierVariant[company.packageTier] ?? "slate"}>
                      {company.packageTier}
                    </Badge>
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge variant={statusVariant[company.status] ?? "slate"}>
                      {company.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
}
