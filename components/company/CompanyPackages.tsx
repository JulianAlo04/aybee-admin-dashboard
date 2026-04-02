import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCredits, cn } from "@/lib/utils";
import type { PackageRow } from "@/lib/types";

interface CompanyPackagesProps {
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

function progressColor(pct: number) {
  if (pct > 85) return "bg-red-500";
  if (pct > 60) return "bg-amber-500";
  return "bg-green-500";
}

export default function CompanyPackages({ packages, loading }: CompanyPackagesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base text-slate-200">
          Credit Packages
          {!loading && (
            <span className="ml-2 text-xs font-normal text-slate-500">
              ({packages.length} total · sorted by usage)
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {packages.map((pkg) => (
              <div key={pkg.id} className="rounded-lg border border-slate-800 bg-slate-800/30 p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant={tierVariant[pkg.tier] ?? "slate"}>{pkg.tier}</Badge>
                  <span className={cn(
                    "text-xs font-mono font-semibold",
                    pkg.status === "Active" ? "text-green-400" : "text-slate-500"
                  )}>
                    {pkg.status}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Usage</span>
                    <span className={cn(
                      "font-semibold",
                      pkg.usedPercent > 85 ? "text-red-400" : pkg.usedPercent > 60 ? "text-amber-400" : "text-green-400"
                    )}>
                      {Math.round(pkg.usedPercent)}%
                    </span>
                  </div>
                  <Progress value={pkg.usedPercent} indicatorClassName={progressColor(pkg.usedPercent)} className="h-2" />
                </div>

                <div className="flex justify-between text-xs text-slate-500">
                  <span>
                    <span className="text-slate-300 font-medium">{formatCredits(pkg.remainingCredits)}</span>
                    {" / "}
                    {formatCredits(pkg.initialCredits)} remaining
                  </span>
                  {pkg.renewalDate && (
                    <span>
                      renews {new Date(pkg.renewalDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" })}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
