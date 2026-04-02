"use client";

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
import { Skeleton } from "@/components/ui/skeleton";
import type { MonthlyDataPoint } from "@/lib/types";

interface MonthlyUsageChartProps {
  monthlySeries: MonthlyDataPoint[];
  loading: boolean;
}

export default function MonthlyUsageChart({ monthlySeries, loading }: MonthlyUsageChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base text-slate-200">
          Monthly Usage
          <span className="ml-2 text-xs font-normal text-slate-500">last 6 months</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-56 w-full rounded-xl" />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlySeries} margin={{ top: 4, right: 8, left: 0, bottom: 0 }} barGap={4} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: "#64748b", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fill: "#64748b", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => new Intl.NumberFormat("en-US", { notation: "compact" }).format(v)}
              />
              <Tooltip
                contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, fontSize: 11 }}
                formatter={(value: number, name: string) => [
                  new Intl.NumberFormat("en-US").format(Math.round(value)),
                  name === "creditsUsed" ? "Credits Used" : "Credits Bought",
                ]}
              />
              <Legend
                formatter={(v) => (
                  <span style={{ color: "#94a3b8", fontSize: 11 }}>
                    {v === "creditsUsed" ? "Credits Used" : "Credits Bought"}
                  </span>
                )}
              />
              <Bar dataKey="creditsBought" fill="#4ade80" radius={[3, 3, 0, 0]} />
              <Bar dataKey="creditsUsed" fill="#f87171" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
