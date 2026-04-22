"use client";

import { Activity, BarChart3, ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

type StatCardData = {
  label: string;
  value: string;
  change: number;
  icon: LucideIcon;
  bars: number[];
  accentColor: string;
};

function MiniBarChart({
  bars,
  accentColor,
}: {
  bars: number[];
  accentColor: string;
}) {
  const max = Math.max(...bars, 1);
  return (
    <TooltipProvider>
      <div className="flex items-end gap-[2px] h-8 max-w-full">
        {bars.map((v, i) => {
          const height = Math.max(4, (v / max) * 32);
          const isLast3 = i >= bars.length - 3;
          return (
            <Tooltip key={i} skipProvider>
              <TooltipTrigger asChild>
                <div
                  className="flex-1 min-w-[3px] max-w-[5px] rounded-sm transition-all"
                  style={{
                    height: `${height}px`,
                    backgroundColor: isLast3 ? accentColor : "var(--border)",
                  }}
                />
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={4}>
                {v.toLocaleString()}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}

function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white px-5 py-4 dark:border-zinc-800 dark:bg-[#18181b]">
      <div className="flex items-center gap-2 mb-3">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-8 w-20 mb-2" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-24" />
      </div>
    </div>
  );
}

function OverviewStatCard({ label, value, change, icon: Icon, bars, accentColor }: StatCardData) {
  const isPositive = change >= 0;
  return (
    <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3 sm:px-5 sm:py-4 dark:border-zinc-800 dark:bg-[#18181b] min-w-0 overflow-hidden">
      <div className="flex items-center gap-2 mb-2 sm:mb-3">
        <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{label}</span>
      </div>
      <div className="text-xl sm:text-[28px] font-semibold tracking-[-0.03em] text-foreground leading-none mb-2 sm:mb-3">
        {value}
      </div>
      <div className="flex items-end justify-between gap-2 sm:gap-3 min-w-0">
        <span
          className={cn(
            "inline-flex items-center gap-1 whitespace-nowrap text-[11px] sm:text-xs font-medium shrink-0",
            isPositive ? "text-emerald-500" : "text-red-500",
          )}
        >
          {isPositive ? (
            <ArrowUpRight className="h-3 w-3 shrink-0" />
          ) : (
            <ArrowDownRight className="h-3 w-3 shrink-0" />
          )}
          {isPositive ? "+" : ""}
          {change.toFixed(1)}%
          <span className="text-muted-foreground">vs avg</span>
        </span>
        <div className="min-w-0 overflow-hidden">
          <MiniBarChart bars={bars} accentColor={accentColor} />
        </div>
      </div>
    </div>
  );
}

type UsageData = {
  total_requests: number;
  total_input_tokens: number;
  total_output_tokens: number;
  total_cost: number;
};

type OverviewStatCardsProps = {
  usage: UsageData | null;
  dailyUsage: UsageData | null;
  loading: boolean;
};

function generateBars(total: number, count: number): number[] {
  const base = total / count;
  const factors = [0.68, 0.74, 0.82, 0.79, 0.93, 0.88, 1.02, 0.97, 1.08, 1.12, 1.04, 1.18];
  return factors.map((f) => Math.max(1, Math.round(base * f)));
}

export function OverviewStatCards({ usage, dailyUsage, loading }: OverviewStatCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const daysElapsed = Math.max(1, new Date().getDate());

  const cards: StatCardData[] = [
    {
      label: "Total Requests",
      value: (usage?.total_requests || 0).toLocaleString(),
      change: computeChange(usage?.total_requests || 0, dailyUsage?.total_requests || 0, daysElapsed),
      icon: Activity,
      bars: generateBars(usage?.total_requests || 0, 12),
      accentColor: "#2d9cdb",
    },
    {
      label: "Input Tokens",
      value: formatTokens(usage?.total_input_tokens || 0),
      change: computeChange(usage?.total_input_tokens || 0, dailyUsage?.total_input_tokens || 0, daysElapsed),
      icon: ArrowDownRight,
      bars: generateBars(usage?.total_input_tokens || 0, 12),
      accentColor: "#8b5cf6",
    },
    {
      label: "Output Tokens",
      value: formatTokens(usage?.total_output_tokens || 0),
      change: computeChange(usage?.total_output_tokens || 0, dailyUsage?.total_output_tokens || 0, daysElapsed),
      icon: ArrowUpRight,
      bars: generateBars(usage?.total_output_tokens || 0, 12),
      accentColor: "#f59e0b",
    },
    {
      label: "Avg Requests / Day",
      value: Math.round((usage?.total_requests || 0) / daysElapsed).toLocaleString(),
      change: computeChange(usage?.total_requests || 0, dailyUsage?.total_requests || 0, daysElapsed),
      icon: BarChart3,
      bars: generateBars(Math.round((usage?.total_requests || 0) / daysElapsed), 12),
      accentColor: "#10b981",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <OverviewStatCard key={card.label} {...card} />
      ))}
    </div>
  );
}

function computeChange(monthTotal: number, dailyValue: number, daysElapsed: number): number {
  const dailyAvg = monthTotal / daysElapsed;
  if (!dailyAvg) return 0;
  return ((dailyValue - dailyAvg) / dailyAvg) * 100;
}

function formatTokens(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return value.toLocaleString();
}
