"use client";

import {
  LineChart,
  Line,
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

interface CreditBurnChartProps {
  data: BurnDataPoint[];
  loading: boolean;
}

function formatDate(d: string) {
  const dt = new Date(d + "T12:00:00");
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatTooltipValue(value: number) {
  return new Intl.NumberFormat("en-US").format(Math.round(value));
}

export default function CreditBurnChart({ data, loading }: CreditBurnChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base text-slate-200">Credit Burn — Last 30 Days</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-64 w-full rounded-xl" />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fill: "#64748b", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                interval={4}
              />
              <YAxis
                tick={{ fill: "#64748b", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => new Intl.NumberFormat("en-US", { notation: "compact" }).format(v)}
              />
              <Tooltip
                contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8 }}
                labelStyle={{ color: "#94a3b8", fontSize: 12 }}
                itemStyle={{ fontSize: 12 }}
                formatter={(value: number, name: string) => [
                  formatTooltipValue(value),
                  name === "creditsUsed" ? "Credits Used" : "Credits Bought",
                ]}
                labelFormatter={(label) => formatDate(label)}
              />
              <Legend
                formatter={(value) => (
                  <span style={{ color: "#94a3b8", fontSize: 12 }}>
                    {value === "creditsUsed" ? "Credits Used" : "Credits Bought"}
                  </span>
                )}
              />
              <Line
                type="monotone"
                dataKey="creditsUsed"
                stroke="#f87171"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="creditsBought"
                stroke="#4ade80"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
