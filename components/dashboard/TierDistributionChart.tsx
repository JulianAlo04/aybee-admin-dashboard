"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { TooltipProps } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCredits } from "@/lib/utils";
import type { TierDistributionPoint, StatusDistributionPoint } from "@/lib/types";

interface TierDistributionChartProps {
  tierData: TierDistributionPoint[];
  statusData: StatusDistributionPoint[];
  loading: boolean;
}

const TIER_COLORS: Record<string, string> = {
  Explorer: "#4ade80",
  Business: "#60a5fa",
  Team: "#818cf8",
  "Custom/Enterprise": "#c084fc",
  "As you go": "#64748b",
};

const STATUS_COLORS: Record<string, string> = {
  "Package Customer": "#60a5fa",
  "As you go": "#64748b",
  Registered: "#fbbf24",
  "One-Off": "#c084fc",
};

function PieTooltipTier({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  const inner = d.payload as TierDistributionPoint | undefined;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs shadow-xl">
      <p className="text-slate-200 font-semibold mb-1">{String(d.name ?? "")}</p>
      {inner && (
        <>
          <p className="text-slate-400">{inner.companyCount} companies</p>
          <p className="text-slate-400">Balance: {formatCredits(inner.totalBalance)}</p>
        </>
      )}
    </div>
  );
}

function PieTooltipStatus({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs shadow-xl">
      <p className="text-slate-200 font-semibold mb-1">{String(d.name ?? "")}</p>
      <p className="text-slate-400">{d.value} companies</p>
    </div>
  );
}

export default function TierDistributionChart({ tierData, statusData, loading }: TierDistributionChartProps) {
  const tierChartData = tierData.map((d) => ({
    name: d.tier,
    value: d.companyCount,
    ...d,
  }));

  const statusChartData = statusData.map((d) => ({
    name: d.status,
    value: d.count,
    ...d,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base text-slate-200">Company Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-64 w-full rounded-xl" />
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {/* By Tier */}
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-3 text-center">By Tier</p>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={tierChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {tierChartData.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={TIER_COLORS[entry.name] ?? "#94a3b8"}
                        stroke="transparent"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltipTier />} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => (
                      <span style={{ color: "#94a3b8", fontSize: 11 }}>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* By Status */}
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-3 text-center">By Status</p>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={STATUS_COLORS[entry.name] ?? "#94a3b8"}
                        stroke="transparent"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltipStatus />} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => (
                      <span style={{ color: "#94a3b8", fontSize: 11 }}>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
