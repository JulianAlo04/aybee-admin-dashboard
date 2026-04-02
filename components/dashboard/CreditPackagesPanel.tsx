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

function progressColor(usedPercent: number): string {
  if (usedPercent > 85) return "bg-red-500";
  if (usedPercent > 60) return "bg-amber-500";
  return "bg-green-500";
}

export default function CreditPackagesPanel({ packages, loading }: CreditPackagesPanelProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="text-base text-slate-200">
          Active Credit Packages
          {!loading && (
            <span className="ml-2 text-xs font-normal text-slate-500">
              ({packages.length} active · most used first)
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 overflow-auto max-h-[520px]">
        {loading ? (
          <>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </>
        ) : packages.length === 0 ? (
          <p className="text-sm text-slate-500 py-4 text-center">No active packages found</p>
        ) : (
          packages.map((pkg) => (
            <div key={pkg.id} className="space-y-1.5">
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
                      "text-xs tabular-nums font-mono",
                      pkg.usedPercent > 85
                        ? "text-red-400"
                        : pkg.usedPercent > 60
                        ? "text-amber-400"
                        : "text-slate-400"
                    )}
                  >
                    {Math.round(pkg.usedPercent)}%
                  </span>
                </div>
              </div>
              <Progress
                value={pkg.usedPercent}
                indicatorClassName={progressColor(pkg.usedPercent)}
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>
                  {formatCredits(pkg.remainingCredits)} / {formatCredits(pkg.initialCredits)} remaining
                </span>
                {pkg.renewalDate && (
                  <span>
                    renews {new Date(pkg.renewalDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
