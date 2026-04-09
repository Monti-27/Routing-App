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
    <div className="flex flex-col gap-4 border-b border-white/10 pb-5 md:flex-row md:items-end md:justify-between">
      <div className="space-y-1.5">
        <h1 className="text-[30px] font-semibold tracking-[-0.03em] text-foreground md:text-[36px]">
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
        "gap-0 rounded-2xl border border-zinc-900 bg-zinc-950 py-0 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]",
        className,
      )}
    >
      <CardHeader className="grid-cols-[1fr_auto] gap-y-1 border-b border-zinc-900 px-6 py-5">
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
      <CardContent className={cn("px-6 py-5", contentClassName)}>
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
};

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  badge,
  className,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "gap-0 rounded-2xl border border-zinc-900 bg-zinc-950 py-0 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]",
        className,
      )}
    >
      <CardContent className="px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <div className="text-3xl font-semibold tracking-[-0.03em] text-foreground">
              {value}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {badge}
            {Icon ? (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 bg-black text-muted-foreground">
                <Icon className="h-4 w-4" />
              </div>
            ) : null}
          </div>
        </div>
        {hint ? (
          <div className="mt-4 text-xs text-muted-foreground">{hint}</div>
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
    <div className="rounded-xl border border-zinc-800 bg-black px-3 py-2">
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

export function SubtleBadge({ children }: { children: React.ReactNode }) {
  return (
    <Badge
      className="rounded-md border-zinc-800 bg-black px-2.5 py-1 text-[11px] font-medium text-foreground shadow-none"
      variant="outline"
    >
      {children}
    </Badge>
  );
}
