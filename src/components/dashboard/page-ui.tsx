import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  description: string;
  action?: React.ReactNode;
  meta?: React.ReactNode;
};

export function PageHeader({
  title,
  description,
  action,
  meta,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-start md:justify-between">
      <div className="space-y-1">
        <h1 className="text-[22px] font-semibold tracking-[-0.03em] text-foreground sm:text-[26px] md:text-[30px]">
          {title}
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          {description}
        </p>
        {meta ? <div className="pt-1">{meta}</div> : null}
      </div>
      {action ? <div className="flex items-center gap-2">{action}</div> : null}
    </div>
  );
}

type SurfaceCardProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  children: React.ReactNode;
};

export function SurfaceCard({
  title,
  description,
  action,
  className,
  contentClassName,
  children,
}: SurfaceCardProps) {
  return (
    <Card
      className={cn(
        "min-w-0 gap-0 rounded-xl border border-zinc-200 bg-white py-0 shadow-none dark:border-zinc-800 dark:bg-[#18181b]",
        className,
      )}
    >
      <CardHeader className="grid-cols-[1fr_auto] gap-y-1 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800 sm:px-5 sm:py-4">
        <div>
          <CardTitle className="text-base font-semibold text-foreground">
            {title}
          </CardTitle>
          {description ? (
            <CardDescription className="mt-1 text-sm leading-6">
              {description}
            </CardDescription>
          ) : null}
        </div>
        {action ? <div className="justify-self-end">{action}</div> : null}
      </CardHeader>
      <CardContent className={cn("px-4 py-3 sm:px-5 sm:py-4", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}

type StatCardProps = {
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
  hint?: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
  compact?: boolean;
};

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  badge,
  className,
  compact = false,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "min-w-0 gap-0 rounded-xl border border-zinc-200 bg-white py-0 shadow-none dark:border-zinc-800 dark:bg-[#18181b]",
        className,
      )}
    >
      <CardContent className={cn("px-5", compact ? "py-3" : "py-4")}>
        <div className="flex items-start justify-between gap-4">
          <div className={cn(compact ? "space-y-2" : "space-y-3")}>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <div
              className={cn(
                "font-semibold tracking-[-0.03em] text-foreground",
                compact ? "text-2xl" : "text-[28px]",
              )}
            >
              {value}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {badge}
            {Icon ? (
              <Icon
                className={cn(
                  "mt-0.5 text-zinc-500",
                  compact ? "h-4 w-4" : "h-5 w-5",
                )}
              />
            ) : null}
          </div>
        </div>
        {hint ? (
          <div
            className={cn(
              "text-xs text-muted-foreground",
              compact ? "mt-3" : "mt-4",
            )}
          >
            {hint}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

type InlineMetricProps = {
  label: string;
  value: React.ReactNode;
  tone?: "default" | "success" | "warning" | "danger";
};

const toneClasses = {
  default: "border-zinc-200 bg-zinc-50 text-foreground dark:border-zinc-800 dark:bg-zinc-900/50",
  success: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  warning: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  danger: "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-300",
} as const;

export function InlineMetric({
  label,
  value,
  tone = "default",
}: InlineMetricProps) {
  return (
    <div className={cn("rounded-xl border px-4 py-3", toneClasses[tone])}>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold tracking-[-0.02em]">{value}</p>
    </div>
  );
}

type PillStatProps = {
  label: string;
  value: React.ReactNode;
};

export function PillStat({ label, value }: PillStatProps) {
  return (
    <div className="rounded-md border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-[#18181b]">
      <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

export function SubtleBadge({ children }: { children: React.ReactNode }) {
  return (
    <Badge
      className="rounded-md border-zinc-200 bg-zinc-100 px-2.5 py-1 text-[11px] font-medium text-zinc-700 shadow-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
      variant="outline"
    >
      {children}
    </Badge>
  );
}
