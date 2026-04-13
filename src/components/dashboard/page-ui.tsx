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
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div className="space-y-1">
        <h1 className="text-[26px] font-semibold tracking-[-0.03em] text-foreground md:text-[30px]">
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
        "gap-0 rounded-xl border border-zinc-200 bg-white py-0 shadow-none dark:border-zinc-800 dark:bg-[#181818]",
        className,
      )}
    >
      <CardHeader className="grid-cols-[1fr_auto] gap-y-1 border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
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
      <CardContent className={cn("px-5 py-4", contentClassName)}>
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
        "gap-0 rounded-xl border border-zinc-200 bg-white py-0 shadow-none dark:border-zinc-800 dark:bg-[#181818]",
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
  default: "border-zinc-800 bg-black text-foreground",
  success: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
  warning: "border-amber-500/20 bg-amber-500/10 text-amber-300",
  danger: "border-red-500/20 bg-red-500/10 text-red-300",
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
    <div className="rounded-md border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-[#181818]">
      <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

export function SubtleBadge({ children }: { children: React.ReactNode }) {
  return (
    <Badge
      className="rounded-md border-zinc-900 bg-zinc-950 px-2.5 py-1 text-[11px] font-medium text-white shadow-none dark:border-zinc-800 dark:bg-black dark:text-white"
      variant="outline"
    >
      {children}
    </Badge>
  );
}
