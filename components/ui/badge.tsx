import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "blue" | "amber" | "green" | "red" | "purple" | "indigo" | "slate";
}

const variantClasses: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "bg-slate-700 text-slate-200",
  blue: "bg-blue-900/60 text-blue-300 border border-blue-800",
  amber: "bg-amber-900/60 text-amber-300 border border-amber-800",
  green: "bg-green-900/60 text-green-300 border border-green-800",
  red: "bg-red-900/60 text-red-300 border border-red-800",
  purple: "bg-purple-900/60 text-purple-300 border border-purple-800",
  indigo: "bg-indigo-900/60 text-indigo-300 border border-indigo-800",
  slate: "bg-slate-800 text-slate-400 border border-slate-700",
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
