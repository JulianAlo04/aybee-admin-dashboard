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

export default function CompaniesTable({ companies, loading }: CompaniesTableProps) {
  const displayed = companies.slice(0, 50);

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="text-base text-slate-200">
          Company Credit Balances
          {!loading && (
            <span className="ml-2 text-xs font-normal text-slate-500">
              (lowest first · top 50 of {companies.length})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 overflow-auto">
        {loading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-xs text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-3 text-left font-medium">Company</th>
                <th className="px-4 py-3 text-right font-medium">Balance</th>
                <th className="px-4 py-3 text-left font-medium">Tier</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {displayed.map((company) => (
                <tr key={company.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-2.5 text-slate-200 font-medium max-w-[180px] truncate">
                    {company.name}
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
