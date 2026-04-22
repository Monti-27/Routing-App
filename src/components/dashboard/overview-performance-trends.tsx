"use client";

import { useMemo } from "react";
import { Line, LineChart, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/line-charts-6";


type UsageData = {
  total_requests: number;
  total_input_tokens: number;
  total_output_tokens: number;
  total_cost: number;
};

type Props = {
  remainingRequests: number;
  usage: UsageData | null;
  loading: boolean;
};

const chartConfig = {
  requests: { label: "Requests", color: "#2d9cdb" },
  inputTokens: { label: "Input Tokens", color: "var(--color-chart-3)" },
  outputTokens: { label: "Output Tokens", color: "var(--color-chart-2)" },
  cost: { label: "Cost", color: "var(--color-chart-5)" },
} satisfies ChartConfig;

const metricMeta = [
  {
    key: "requests",
    label: "Requests",
    format: (value: number) => value.toLocaleString(),
  },
  {
    key: "inputTokens",
    label: "Input Tokens",
    format: (value: number) => `${(value / 1000).toFixed(0)}K`,
  },
  {
    key: "outputTokens",
    label: "Output Tokens",
    format: (value: number) => `${(value / 1000).toFixed(0)}K`,
  },
  {
    key: "cost",
    label: "Cost",
    format: (value: number) => `$${value.toFixed(2)}`,
  },
] as const;

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ dataKey: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="min-w-[180px] rounded-lg border border-zinc-200 bg-white p-3 shadow-sm shadow-black/10 dark:border-zinc-800 dark:bg-[#18181b] dark:shadow-black/20">
      <div className="mb-2 text-xs font-medium text-zinc-500">{label}</div>
      <div className="space-y-2">
        {payload.map((item) => {
          const meta = metricMeta.find((entry) => entry.key === item.dataKey);

          if (!meta) {
            return null;
          }

          return (
            <div
              className="flex items-center justify-between gap-3 text-sm"
              key={item.dataKey}
            >
              <div className="flex items-center gap-2">
                <div
                  className="size-1.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-zinc-500 dark:text-zinc-400">
                  {meta.label}
                </span>
              </div>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                {meta.format(item.value)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatCompactNumber(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toString();
}

export function OverviewPerformanceTrends({
  usage,
  loading,
  remainingRequests,
}: Props) {
  const platformData = useMemo(() => {
    const totalRequests = usage?.total_requests || 0;
    const totalInputTokens = usage?.total_input_tokens || 0;
    const totalOutputTokens = usage?.total_output_tokens || 0;
    const totalCost = usage?.total_cost || 0;
    const labels = [
      "2024-04-01",
      "2024-04-02",
      "2024-04-03",
      "2024-04-04",
      "2024-04-05",
      "2024-04-06",
      "2024-04-07",
      "2024-04-08",
      "2024-04-09",
      "2024-04-10",
      "2024-04-11",
      "2024-04-12",
    ];
    const factors = [
      0.68, 0.74, 0.82, 0.79, 0.93, 0.88, 1.02, 0.97, 1.08, 1.12, 1.04, 1.18,
    ];

    return labels.map((date, index) => ({
      date,
      requests: Math.max(
        1,
        Math.round((totalRequests / labels.length) * factors[index]),
      ),
      inputTokens: Math.max(
        1,
        Math.round((totalInputTokens / labels.length) * factors[index]),
      ),
      outputTokens: Math.max(
        1,
        Math.round(
          (totalOutputTokens / labels.length) * (factors[index] * 0.92 + 0.04),
        ),
      ),
      cost: Number(
        ((totalCost / labels.length) * (factors[index] * 0.96 + 0.03)).toFixed(
          2,
        ),
      ),
    }));
  }, [usage]);


  return (
    <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-[#18181b]">
      <div className="flex flex-col gap-3 border-b border-zinc-200 px-4 py-4 dark:border-zinc-800 sm:px-6 sm:py-5 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Usage
          </h3>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Remaining requests today:{" "}
            {loading ? "..." : formatCompactNumber(remainingRequests)}
          </p>
        </div>
      </div>

      <div className="px-2 py-4 sm:px-3 sm:py-6">
        {loading ? (
          <div className="h-64 w-full animate-pulse rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-[#18181b] sm:h-96" />
        ) : (
          <ChartContainer
            className="h-64 w-full overflow-visible sm:h-96 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-initial"
            config={chartConfig}
          >
            <LineChart
              data={platformData}
              margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
              style={{ overflow: "visible" }}
            >
              <defs>
                <pattern
                  id="overviewDotGrid"
                  x="0"
                  y="0"
                  width="20"
                  height="20"
                  patternUnits="userSpaceOnUse"
                >
                  <circle
                    cx="10"
                    cy="10"
                    fill="var(--input)"
                    fillOpacity="1"
                    r="1"
                  />
                </pattern>
              </defs>

              <XAxis
                axisLine={false}
                dataKey="date"
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                }}
                tickLine={false}
                tickMargin={10}
              />

              <YAxis
                axisLine={false}
                dataKey="requests"
                domain={[
                  0,
                  (dataMax: number) => Math.max(10, Math.ceil(dataMax * 1.15)),
                ]}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                tickCount={6}
                tickFormatter={formatCompactNumber}
                tickLine={false}
                tickMargin={10}
                yAxisId="requests"
              />

              <YAxis
                axisLine={false}
                domain={[0, "dataMax + 1000"]}
                orientation="right"
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                tickCount={6}
                tickFormatter={formatCompactNumber}
                tickLine={false}
                tickMargin={10}
                yAxisId="tokens"
              />

              <ChartTooltip
                content={<CustomTooltip />}
                cursor={{ strokeDasharray: "3 3", stroke: "#9ca3af" }}
              />

              <rect
                x="60px"
                y="-20px"
                width="calc(100% - 75px)"
                height="calc(100% - 10px)"
                fill="url(#overviewDotGrid)"
                style={{ pointerEvents: "none" }}
              />

              <Line
                activeDot={{
                  fill: chartConfig.requests.color,
                  r: 6,
                  stroke: "var(--background)",
                  strokeWidth: 2,
                }}
                dataKey="requests"
                dot={{
                  fill: chartConfig.requests.color,
                  r: 2.5,
                  strokeWidth: 0,
                }}
                stroke={chartConfig.requests.color}
                strokeWidth={3}
                type="monotone"
                yAxisId="requests"
              />
              <Line
                activeDot={{
                  fill: chartConfig.inputTokens.color,
                  r: 6,
                  stroke: "var(--background)",
                  strokeWidth: 2,
                }}
                dataKey="inputTokens"
                dot={false}
                stroke={chartConfig.inputTokens.color}
                strokeWidth={2}
                type="monotone"
                yAxisId="tokens"
              />
              <Line
                activeDot={{
                  fill: chartConfig.outputTokens.color,
                  r: 6,
                  stroke: "var(--background)",
                  strokeWidth: 2,
                }}
                dataKey="outputTokens"
                dot={false}
                stroke={chartConfig.outputTokens.color}
                strokeWidth={2}
                type="monotone"
                yAxisId="tokens"
              />
            </LineChart>
          </ChartContainer>
        )}
      </div>
    </div>
  );
}
