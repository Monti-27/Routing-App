"use client";

import { useMemo, useState } from "react";

import { PieCenter } from "@/components/charts/pie-center";
import { PieChart } from "@/components/charts/pie-chart";
import { PieSlice } from "@/components/charts/pie-slice";
import { Skeleton } from "@/components/ui/skeleton";

type ModelEntry = {
  model: string;
  requests: number;
  tokens: number;
};

type ChartSlice = {
  label: string;
  value: number;
  color: string;
  model: ModelEntry | null;
};

const chartColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
] as const;

type Props = {
  models: Record<
    string,
    {
      requests?: number;
      image_requests?: number;
      input_tokens?: number;
      output_tokens?: number;
      is_image_model?: number;
    }
  > | null;
  loading: boolean;
};

export function OverviewUsageByModel({ models, loading }: Props) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const modelEntries = useMemo(() => {
    if (!models) return [];
    return Object.entries(models)
      .map(([name, metrics]) => ({
        model: name,
        requests: metrics.image_requests || metrics.requests || 0,
        tokens: (metrics.input_tokens || 0) + (metrics.output_tokens || 0),
      }))
      .sort((a, b) => b.requests - a.requests);
  }, [models]);

  const chartData = useMemo(() => {
    if (modelEntries.length === 0) return [] as ChartSlice[];

    const top = modelEntries.slice(0, 5);
    const rest = modelEntries.slice(5).reduce((s, m) => s + m.requests, 0);

    const items: ChartSlice[] = top.map((m, i) => ({
      label: m.model.replace("route/", ""),
      value: m.requests,
      color: chartColors[i % chartColors.length],
      model: m,
    }));

    if (rest > 0) {
      items.push({ label: "Other", value: rest, color: "var(--chart-5)", model: null });
    }

    return items;
  }, [modelEntries]);

  const totalRequests = useMemo(
    () => chartData.reduce((s, i) => s + i.value, 0),
    [chartData],
  );

  if (loading) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-[#18181b]">
        <Skeleton className="h-5 w-32 mb-4" />
        <Skeleton className="h-[260px] w-full" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-[#18181b]">
      <div className="border-b border-zinc-200 px-4 py-4 dark:border-zinc-800 sm:px-6 sm:py-5">
        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          Usage by model
        </h3>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Highest-volume models sorted by request count.
        </p>
      </div>

      <div className="p-4 sm:p-6">
        {chartData.length > 0 ? (
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex justify-center lg:flex-1">
              <div className="sm:hidden">
                <PieChart
                  cornerRadius={4}
                  data={chartData}
                  hoverOffset={8}
                  hoveredIndex={hoveredIndex}
                  innerRadius={56}
                  onHoverChange={setHoveredIndex}
                  padAngle={0.02}
                  size={200}
                >
                  {chartData.map((item, index) => (
                    <PieSlice
                      color={item.color}
                      hoverEffect="grow"
                      index={index}
                      key={`sm-${item.label}`}
                      showGlow={false}
                    />
                  ))}
                  <PieCenter
                    className="rounded-full bg-background/80"
                    defaultLabel="Requests"
                    formatOptions={{ notation: "compact" }}
                    valueClassName="text-lg font-semibold text-foreground"
                    labelClassName="text-xs text-muted-foreground"
                  />
                </PieChart>
              </div>
              <div className="hidden sm:block">
                <PieChart
                  cornerRadius={4}
                  data={chartData}
                  hoverOffset={8}
                  hoveredIndex={hoveredIndex}
                  innerRadius={72}
                  onHoverChange={setHoveredIndex}
                  padAngle={0.02}
                  size={260}
                >
                  {chartData.map((item, index) => (
                    <PieSlice
                      color={item.color}
                      hoverEffect="grow"
                      index={index}
                      key={item.label}
                      showGlow={false}
                    />
                  ))}
                  <PieCenter
                    className="rounded-full bg-background/80"
                    defaultLabel="Requests"
                    formatOptions={{ notation: "compact" }}
                    valueClassName="text-xl font-semibold text-foreground"
                    labelClassName="text-xs text-muted-foreground"
                  />
                </PieChart>
              </div>
            </div>

            <div className="min-w-0 flex-1 space-y-2 lg:max-w-md">
              {chartData.map((item, index) => {
                const pct = totalRequests > 0 ? (item.value / totalRequests) * 100 : 0;
                return (
                  <button
                    className="flex w-full items-center gap-2.5 rounded-lg border border-border/70 px-3 py-2 text-left transition-colors hover:bg-muted/40"
                    key={item.label}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    type="button"
                  >
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-foreground sm:text-sm" title={item.label}>
                        {item.label}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground sm:text-xs">
                        {pct.toFixed(1)}% of requests
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-foreground sm:text-sm">
                        {item.value.toLocaleString()}
                      </p>
                      <p className="text-[11px] text-muted-foreground sm:text-xs">
                        {item.model ? `${(item.model.tokens / 1000).toFixed(1)}K tokens` : "Grouped remainder"}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No model usage data available.</p>
        )}
      </div>
    </div>
  );
}
