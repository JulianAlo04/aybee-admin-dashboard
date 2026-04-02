"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCredits, toTitleCase, cn } from "@/lib/utils";
import type { PackageRow } from "@/lib/types";

interface CreditPackagesPanelProps {
  packages: PackageRow[];
  loading: boolean;
}

const tierVariant: Record<string, "green" | "blue" | "indigo" | "purple" | "slate"> = {
  Explorer: "green",
  Business: "blue",
  Team: "indigo",
  "Custom/Enterprise": "purple",
  "As you go": "slate",
};

const tierColors: Record<string, string> = {
  Explorer: "#4ade80",
  Business: "#60a5fa",
  Team: "#818cf8",
  "Custom/Enterprise": "#c084fc",
  "As you go": "#64748b",
};

function progressColor(usedPercent: number): string {
  if (usedPercent > 85) return "bg-red-500";
  if (usedPercent > 60) return "bg-amber-500";
  return "bg-green-500";
}

export default function CreditPackagesPanel({ packages, loading }: CreditPackagesPanelProps) {
  const tierSummary = useMemo(() => {
    const map = new Map<string, { initial: number; remaining: number; count: number }>();
    for (const pkg of packages) {
      const entry = map.get(pkg.tier) ?? { initial: 0, remaining: 0, count: 0 };
      entry.initial += pkg.initialCredits;
      entry.remaining += pkg.remainingCredits;
      entry.count += 1;
      map.set(pkg.tier, entry);
    }
    return Array.from(map.entries()).map(([tier, v]) => ({
      tier,
      Initial: v.initial,
      Remaining: v.remaining,
      Used: v.initial - v.remaining,
      count: v.count,
    }));
  }, [packages]);

  const totals = useMemo(() => {
    const totalInitial = packages.reduce((s, p) => s + p.initialCredits, 0);
    const totalRemaining = packages.reduce((s, p) => s + p.remainingCredits, 0);
    const critical = packages.filter((p) => p.usedPercent > 85).length;
    return { totalInitial, totalRemaining, critical };
  }, [packages]);

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-base text-slate-200">
          Active Credit Packages
          {!loading && (
            <span className="ml-2 text-xs font-normal text-slate-500">
              ({packages.length} packages)
            </span>
          )}
        </CardTitle>

        {!loading && packages.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-slate-800/50 px-3 py-2 text-center">
              <p className="text-xs text-slate-500">Total Capacity</p>
              <p className="text-sm font-semibold text-slate-200 tabular-nums">
                {formatCredits(totals.totalInitial)}
              </p>
            </div>
            <div className="rounded-lg bg-slate-800/50 px-3 py-2 text-center">
              <p className="text-xs text-slate-500">Remaining</p>
              <p className="text-sm font-semibold text-green-400 tabular-nums">
                {formatCredits(totals.totalRemaining)}
              </p>
            </div>
            <div className="rounded-lg bg-slate-800/50 px-3 py-2 text-center">
              <p className="text-xs text-slate-500">Critical (&gt;85%)</p>
              <p className={cn("text-sm font-semibold tabular-nums", totals.critical > 0 ? "text-red-400" : "text-slate-400")}>
                {totals.critical}
              </p>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-2 space-y-4">
        {loading ? (
          <>
            <Skeleton className="h-36 w-full rounded-xl mb-4" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </>
        ) : packages.length === 0 ? (
          <p className="text-sm text-slate-500 py-4 text-center">No active packages found</p>
        ) : (
          <>
            {/* Tier breakdown chart */}
            {tierSummary.length > 0 && (
              <div className="mb-2">
                <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider">Capacity by Tier</p>
                <ResponsiveContainer width="100%" height={130}>
                  <BarChart data={tierSummary} margin={{ top: 0, right: 8, left: 0, bottom: 0 }} barSize={16}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis
                      dataKey="tier"
                      tick={{ fill: "#64748b", fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v: string) => v.replace("Custom/Enterprise", "Custom")}
                    />
                    <YAxis
                      tick={{ fill: "#64748b", fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v: number) =>
                        new Intl.NumberFormat("en-US", { notation: "compact" }).format(v)
                      }
                      width={40}
                    />
                    <Tooltip
                      contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, fontSize: 11 }}
                      formatter={(value: number, name: string) => [
                        formatCredits(value),
                        name,
                      ]}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: 11, color: "#94a3b8" }}
                      iconSize={8}
                    />
                    <Bar dataKey="Remaining" stackId="a" fill="#4ade80" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="Used" stackId="a" fill="#f87171" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Package list */}
            <div className="space-y-3 overflow-auto max-h-[340px] pr-1">
              {packages.map((pkg) => (
                <div key={pkg.id} className="space-y-1.5 rounded-lg bg-slate-800/30 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="text-sm text-slate-200 font-medium truncate max-w-[160px]"
                      title={toTitleCase(pkg.companyName)}
                    >
                      {toTitleCase(pkg.companyName)}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={tierVariant[pkg.tier] ?? "slate"}>{pkg.tier}</Badge>
                      <span
                        className={cn(
                          "text-xs tabular-nums font-mono font-semibold",
                          pkg.usedPercent > 85
                            ? "text-red-400"
                            : pkg.usedPercent > 60
                            ? "text-amber-400"
                            : "text-green-400"
                        )}
                      >
                        {Math.round(pkg.usedPercent)}%
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={pkg.usedPercent}
                    indicatorClassName={progressColor(pkg.usedPercent)}
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>
                      <span className={cn(pkg.remainingCredits < pkg.initialCredits * 0.15 ? "text-red-400" : "text-slate-400")}>
                        {formatCredits(pkg.remainingCredits)}
                      </span>
                      {" / "}
                      {formatCredits(pkg.initialCredits)} credits remaining
                    </span>
                    {pkg.renewalDate && (
                      <span>
                        renews{" "}
                        {new Date(pkg.renewalDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
