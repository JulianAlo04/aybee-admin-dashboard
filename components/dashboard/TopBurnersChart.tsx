"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCredits } from "@/lib/utils";
import type { TopBurner } from "@/lib/types";

interface TopBurnersChartProps {
  burners: TopBurner[];
  loading: boolean;
}

const COLORS = [
  "#f87171", "#fb923c", "#fbbf24", "#a3e635", "#34d399",
  "#22d3ee", "#60a5fa", "#a78bfa", "#f472b6", "#94a3b8",
];

function truncateName(name: string, max = 22): string {
  return name.length > max ? name.slice(0, max) + "…" : name;
}

// Custom tooltip
function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: TopBurner; value: number }> }) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs shadow-xl">
      <p className="text-slate-200 font-medium mb-1">{d.payload.companyName}</p>
      <p className="text-red-400 font-semibold">{formatCredits(d.value)} credits used</p>
    </div>
  );
}

export default function TopBurnersChart({ burners, loading }: TopBurnersChartProps) {
  const data = burners.map((b) => ({ ...b, label: truncateName(b.companyName) }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base text-slate-200">
          Top Credit Burners
          <span className="ml-2 text-xs font-normal text-slate-500">last 30 days</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-64 w-full rounded-xl" />
        ) : burners.length === 0 ? (
          <p className="text-sm text-slate-500 py-12 text-center">No credit usage data available</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              layout="vertical"
              data={data}
              margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
              barSize={18}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fill: "#64748b", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => new Intl.NumberFormat("en-US", { notation: "compact" }).format(v)}
              />
              <YAxis
                type="category"
                dataKey="label"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={130}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "#1e293b" }} />
              <Bar dataKey="creditsUsed" radius={[0, 4, 4, 0]}>
                {data.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
