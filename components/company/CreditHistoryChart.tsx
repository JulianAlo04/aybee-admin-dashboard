"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { BurnDataPoint } from "@/lib/types";

interface CreditHistoryChartProps {
  burnSeries: BurnDataPoint[];
  loading: boolean;
}

function formatDate(d: string) {
  return new Date(d + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function CreditHistoryChart({ burnSeries, loading }: CreditHistoryChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base text-slate-200">
          Daily Activity
          <span className="ml-2 text-xs font-normal text-slate-500">last 30 days</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-56 w-full rounded-xl" />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={burnSeries} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="usedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f87171" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="boughtGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fill: "#64748b", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                interval={6}
              />
              <YAxis
                tick={{ fill: "#64748b", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => new Intl.NumberFormat("en-US", { notation: "compact" }).format(v)}
              />
              <Tooltip
                contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, fontSize: 11 }}
                labelFormatter={formatDate}
                formatter={(value: number, name: string) => [
                  new Intl.NumberFormat("en-US").format(Math.round(value)),
                  name === "creditsUsed" ? "Used" : "Bought",
                ]}
              />
              <Legend
                formatter={(v) => (
                  <span style={{ color: "#94a3b8", fontSize: 11 }}>
                    {v === "creditsUsed" ? "Used" : "Bought"}
                  </span>
                )}
              />
              <Area type="monotone" dataKey="creditsBought" stroke="#4ade80" strokeWidth={2} fill="url(#boughtGrad)" dot={false} />
              <Area type="monotone" dataKey="creditsUsed" stroke="#f87171" strokeWidth={2} fill="url(#usedGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
