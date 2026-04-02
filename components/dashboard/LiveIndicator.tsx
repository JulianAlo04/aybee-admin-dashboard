"use client";

interface LiveIndicatorProps {
  lastRefreshed: Date | null;
}

export default function LiveIndicator({ lastRefreshed }: LiveIndicatorProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-400">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
      </span>
      <span className="text-green-400 font-medium">Live</span>
      {lastRefreshed && (
        <span className="text-slate-500">
          · refreshed {lastRefreshed.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}
