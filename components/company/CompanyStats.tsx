import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCredits, cn } from "@/lib/utils";
import type { CompanyDetailResponse, CompanyTransactionsResponse } from "@/lib/types";

interface CompanyStatsProps {
  detail: CompanyDetailResponse | null;
  txData: CompanyTransactionsResponse | null;
  loading: boolean;
}

export default function CompanyStats({ detail, txData, loading }: CompanyStatsProps) {
  const balance = detail?.company.creditBalance ?? 0;
  const totalBought = txData?.totalBought ?? 0;
  const totalUsed = txData?.totalUsed ?? 0;
  const activePackages = detail?.packages.filter((p) => p.status === "Active").length ?? 0;
  const utilizationRate = totalBought > 0 ? (totalUsed / totalBought) * 100 : 0;

  const stats = [
    {
      title: "Current Balance",
      value: formatCredits(balance),
      description: "credits available",
      valueClass: balance < 0 ? "text-red-400" : balance < 100 ? "text-amber-400" : "text-green-400",
    },
    {
      title: "Total Purchased",
      value: formatCredits(totalBought),
      description: "credits ever bought",
      valueClass: "text-blue-400",
    },
    {
      title: "Total Consumed",
      value: formatCredits(totalUsed),
      description: "credits ever used",
      valueClass: "text-orange-400",
    },
    {
      title: "Utilization Rate",
      value: `${Math.round(utilizationRate)}%`,
      description: `${activePackages} active package${activePackages !== 1 ? "s" : ""}`,
      valueClass: utilizationRate > 90 ? "text-red-400" : utilizationRate > 70 ? "text-amber-400" : "text-slate-200",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-1" />
              <Skeleton className="h-3 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">{stat.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={cn("text-2xl font-bold tabular-nums", stat.valueClass)}>{stat.value}</p>
            <p className="text-xs text-slate-500 mt-1">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
