import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCredits, cn } from "@/lib/utils";
import type { CompaniesResponse, PackagesResponse, TransactionsResponse } from "@/lib/types";

interface StatsBarProps {
  companies: CompaniesResponse | null;
  packages: PackagesResponse | null;
  transactions: TransactionsResponse | null;
  loading: boolean;
}

export default function StatsBar({ companies, packages, transactions, loading }: StatsBarProps) {
  const totalBalance = companies?.companies.reduce((acc, c) => acc + c.creditBalance, 0) ?? 0;

  const balanceColor =
    totalBalance < 0
      ? "text-red-400"
      : totalBalance < 1000
      ? "text-amber-400"
      : "text-green-400";

  const stats = [
    {
      title: "Total Companies",
      value: companies?.totalCount ?? 0,
      description: "registered on platform",
      valueClass: "text-white",
    },
    {
      title: "Active Packages",
      value: packages?.activeCount ?? 0,
      description: "credit packages active",
      valueClass: "text-blue-400",
    },
    {
      title: "Total Credit Balance",
      value: formatCredits(totalBalance),
      description: "across all companies",
      valueClass: balanceColor,
    },
    {
      title: "Credits Used Today",
      value: formatCredits(transactions?.todayUsed ?? 0),
      description: "consumed in last 24h",
      valueClass: "text-slate-200",
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
            <p className={cn("text-2xl font-bold tabular-nums", stat.valueClass)}>
              {stat.value}
            </p>
            <p className="text-xs text-slate-500 mt-1">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
