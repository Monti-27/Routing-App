"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Calendar,
  Download,
  Loader2,
  TrendingUp,
} from "lucide-react";

import {
  PageHeader,
  StatCard,
  SubtleBadge,
  SurfaceCard,
} from "@/components/dashboard/page-ui";
import { Button } from "@/components/ui/button";
import { PieCenter } from "@/components/charts/pie-center";
import { PieChart } from "@/components/charts/pie-chart";
import { PieSlice } from "@/components/charts/pie-slice";
import { UsageSummaryCard } from "@/components/dashboard/usage-summary-card";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

type Period = "daily" | "hourly" | "monthly";

interface ModelUsage {
  model: string;
  requests: number;
  tokens: number;
  cost: number;
}

interface UsageChartSlice {
  label: string;
  value: number;
  color: string;
  model: ModelUsage | null;
}

const usageChartColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
] as const;

const DEV_USAGE_MODELS: ModelUsage[] = [
  { model: "route/minimax-m2.5", requests: 6420, tokens: 686000, cost: 6.86 },
  { model: "route/kimi-k2.5", requests: 5180, tokens: 597000, cost: 5.97 },
  { model: "route/glm-5", requests: 4030, tokens: 493000, cost: 4.93 },
  { model: "route/deepseek-v3.2", requests: 2790, tokens: 324000, cost: 3.24 },
  { model: "route/qwen3.5-397b-a17b", requests: 1940, tokens: 246000, cost: 2.46 },
  { model: "route/minimax-m2.7-highspeed", requests: 1210, tokens: 182000, cost: 1.82 },
];

const DEV_USAGE_CHARTS: Record<Period, { date: string; requests: number }[]> = {
  daily: [
    { date: "Mon", requests: 1480 },
    { date: "Tue", requests: 1720 },
    { date: "Wed", requests: 1580 },
    { date: "Thu", requests: 1940 },
    { date: "Fri", requests: 2210 },
  ],
  hourly: [
    { date: "08:00", requests: 82 },
    { date: "10:00", requests: 134 },
    { date: "12:00", requests: 168 },
    { date: "14:00", requests: 121 },
    { date: "16:00", requests: 156 },
  ],
  monthly: [
    { date: "Week 1", requests: 4820 },
    { date: "Week 2", requests: 5360 },
    { date: "Week 3", requests: 4980 },
    { date: "Week 4", requests: 6410 },
  ],
};

function applyUsageSnapshot({
  chart,
  cost,
  costMultiplier,
  inputTokens,
  models,
  outputTokens,
  requests,
  setChartData,
  setCostMultiplier,
  setModelUsage,
  setTotalCost,
  setTotalInputTokens,
  setTotalOutputTokens,
  setTotalRequests,
}: {
  chart: { date: string; requests: number }[];
  cost: number;
  costMultiplier: number;
  inputTokens: number;
  models: ModelUsage[];
  outputTokens: number;
  requests: number;
  setChartData: React.Dispatch<React.SetStateAction<{ date: string; requests: number }[]>>;
  setCostMultiplier: React.Dispatch<React.SetStateAction<number>>;
  setModelUsage: React.Dispatch<React.SetStateAction<ModelUsage[]>>;
  setTotalCost: React.Dispatch<React.SetStateAction<number>>;
  setTotalInputTokens: React.Dispatch<React.SetStateAction<number>>;
  setTotalOutputTokens: React.Dispatch<React.SetStateAction<number>>;
  setTotalRequests: React.Dispatch<React.SetStateAction<number>>;
}) {
  setCostMultiplier(costMultiplier);
  setTotalRequests(requests);
  setTotalInputTokens(inputTokens);
  setTotalOutputTokens(outputTokens);
  setTotalCost(cost);
  setModelUsage(models.sort((a, b) => b.requests - a.requests));
  setChartData(chart);
}

export default function UsagePage() {
  const { isDevBypassEnabled } = useAuth();
  const [period, setPeriod] = useState<Period>("daily");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalRequests, setTotalRequests] = useState(0);
  const [totalInputTokens, setTotalInputTokens] = useState(0);
  const [totalOutputTokens, setTotalOutputTokens] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [modelUsage, setModelUsage] = useState<ModelUsage[]>([]);
  const [chartData, setChartData] = useState<
    { date: string; requests: number }[]
  >([]);
  const [costMultiplier, setCostMultiplier] = useState(1.65);
  const [hoveredModelIndex, setHoveredModelIndex] = useState<number | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      if (isDevBypassEnabled) {
        applyUsageSnapshot({
          chart: DEV_USAGE_CHARTS[period],
          cost: 48.36,
          costMultiplier: 1.65,
          inputTokens: 1_254_000,
          models: DEV_USAGE_MODELS,
          outputTokens: 846_000,
          requests: 18_420,
          setChartData,
          setCostMultiplier,
          setModelUsage,
          setTotalCost,
          setTotalInputTokens,
          setTotalOutputTokens,
          setTotalRequests,
        });
        setLoading(false);
        return;
      }

      try {
        const [usageData, settingsData] = await Promise.all([
          api.usage.get(period),
          api.settings.get(),
        ]);

        const requests = usageData.total_requests || 0;
        const inputTokens = usageData.total_input_tokens || 0;
        const outputTokens = usageData.total_output_tokens || 0;
        const cost = (usageData.total_cost || 0) * settingsData.cost_multiplier;

        const models: ModelUsage[] = [];
        const chart: { date: string; requests: number }[] = [];

        if (usageData.models && typeof usageData.models === "object") {
          for (const [modelName, metrics] of Object.entries(usageData.models)) {
            const metricValues = metrics as Record<string, number>;
            const isImageModel = Boolean(metricValues.is_image_model);
            const modelRequests =
              metricValues.image_requests || metricValues.requests || 0;
            const input = metricValues.input_tokens || 0;
            const output = metricValues.output_tokens || 0;

            let modelCost = metricValues.cost || 0;
            if (isImageModel && !metricValues.cost) {
              modelCost = 0;
            } else if (!modelCost && (input > 0 || output > 0)) {
              modelCost = ((input + output) / 1000) * 0.01;
            }

            models.push({
              model: modelName,
              requests: modelRequests,
              tokens: input + output,
              cost: modelCost,
            });

            if (period === "daily" || period === "monthly") {
              chart.push({ date: modelName, requests: modelRequests });
            }
          }
        }

        if (chart.length === 0) {
          chart.push({ date: period === "hourly" ? "Now" : "Today", requests });
        }

        applyUsageSnapshot({
          chart,
          cost,
          costMultiplier: settingsData.cost_multiplier,
          inputTokens,
          models,
          outputTokens,
          requests,
          setChartData,
          setCostMultiplier,
          setModelUsage,
          setTotalCost,
          setTotalInputTokens,
          setTotalOutputTokens,
          setTotalRequests,
        });
      } catch (err) {
        if (process.env.NODE_ENV === "development") {
          applyUsageSnapshot({
            chart: DEV_USAGE_CHARTS[period],
            cost: 48.36,
            costMultiplier: 1.65,
            inputTokens: 1_254_000,
            models: DEV_USAGE_MODELS,
            outputTokens: 846_000,
            requests: 18_420,
            setChartData,
            setCostMultiplier,
            setModelUsage,
            setTotalCost,
            setTotalInputTokens,
            setTotalOutputTokens,
            setTotalRequests,
          });
          setError(null);
        } else {
          setError(err instanceof Error ? err.message : "Failed to load usage");
        }
      } finally {
        setLoading(false);
      }
    }

    void fetchData();
  }, [isDevBypassEnabled, period]);

  const maxRequests = Math.max(...chartData.map((entry) => entry.requests), 1);
  const totalTokens = totalInputTokens + totalOutputTokens;
  const usageByModelChartData = useMemo(() => {
    if (modelUsage.length === 0) {
      return [] as UsageChartSlice[];
    }

    const topModels = modelUsage.slice(0, 5);
    const remainingRequests = modelUsage
      .slice(5)
      .reduce((sum, model) => sum + model.requests, 0);

    const items: UsageChartSlice[] = topModels.map((model, index) => ({
      label: model.model.replace("route/", ""),
      value: model.requests,
      color: usageChartColors[index % usageChartColors.length],
      model,
    }));

    if (remainingRequests > 0) {
      items.push({
        label: "Other",
        value: remainingRequests,
        color: "var(--chart-5)",
        model: null,
      });
    }

    return items;
  }, [modelUsage]);
  const totalChartRequests = useMemo(
    () => usageByModelChartData.reduce((sum, item) => sum + item.value, 0),
    [usageByModelChartData],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Usage"
        description="Request volume, token spend, and estimated cost across the selected reporting window."
        action={
          <>
            <Button size="sm" variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Last 30 days
            </Button>
            <Button size="sm" variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        {(["daily", "hourly", "monthly"] as Period[]).map((value) => (
          <Button
            key={value}
            onClick={() => setPeriod(value)}
            size="sm"
            variant={period === value ? "default" : "outline"}
          >
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </Button>
        ))}
      </div>

      {loading ? (
        <SurfaceCard
          title="Loading usage"
          description="Fetching your current analytics snapshot."
        >
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </SurfaceCard>
      ) : error ? (
        <SurfaceCard
          title="Usage unavailable"
          description="Analytics could not be loaded."
        >
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-muted-foreground">
            {error}
          </div>
        </SurfaceCard>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              hint="Requests recorded in the selected period"
              icon={BarChart3}
              label="Total Requests"
              value={totalRequests.toLocaleString()}
            />
            <StatCard
              hint={`${totalInputTokens.toLocaleString()} in / ${totalOutputTokens.toLocaleString()} out`}
              icon={TrendingUp}
              label="Total Tokens"
              value={totalTokens.toLocaleString()}
            />
            <StatCard
              hint={`Multiplier ${costMultiplier.toFixed(2)}x applied`}
              label="Estimated Cost"
              value={`$${totalCost.toFixed(2)}`}
            />
            <StatCard
              badge={<SubtleBadge>{period.toUpperCase()}</SubtleBadge>}
              hint="Average token volume per request"
              label="Avg Tokens / Request"
              value={
                totalRequests > 0
                  ? (totalTokens / totalRequests).toFixed(1)
                  : "0"
              }
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <SurfaceCard
              contentClassName="pt-0"
              title="Total usage"
              description="Combined input and output token volume for the current reporting window."
            >
              <UsageSummaryCard
                backgroundColor="bg-card"
                borderColor="border-border/70"
                leftLabel="Input"
                leftValue={totalInputTokens}
                rightLabel="Output"
                rightValue={totalOutputTokens}
                totalLabel="Total tokens"
              />
            </SurfaceCard>
            <SurfaceCard
              className="h-full"
              contentClassName="flex flex-1 flex-col px-4 pb-2 pt-3"
              title="Request distribution"
              description="Relative request volume for the current reporting selection."
            >
              <div className="mt-auto flex h-[380px] items-end gap-3">
                {chartData.map((entry) => (
                  <div
                    className="flex min-w-0 flex-1 flex-col items-center justify-end gap-2"
                    key={entry.date}
                  >
                    <span className="text-xs text-muted-foreground">
                      {entry.requests.toLocaleString()}
                    </span>
                    <div className="flex h-[320px] w-full items-end rounded-lg bg-muted/60 px-2 pb-2">
                      <div
                        className="w-full rounded-md bg-foreground"
                        style={{
                          height: `${Math.max((entry.requests / maxRequests) * 100, 4)}%`,
                        }}
                      />
                    </div>
                    <span className="w-full truncate text-center text-xs text-muted-foreground">
                      {entry.date.replace("route/", "")}
                    </span>
                  </div>
                ))}
              </div>
            </SurfaceCard>

            <SurfaceCard
              title="Usage by model"
              description="Highest-volume models sorted by request count."
              className="xl:col-span-2"
            >
              <div className="space-y-6">
                {usageByModelChartData.length > 0 ? (
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex justify-center lg:flex-1">
                      <PieChart
                        cornerRadius={4}
                        data={usageByModelChartData}
                        hoverOffset={8}
                        hoveredIndex={hoveredModelIndex}
                        innerRadius={72}
                        onHoverChange={setHoveredModelIndex}
                        padAngle={0.02}
                        size={260}
                      >
                        {usageByModelChartData.map((item, index) => (
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

                    <div className="min-w-0 flex-1 space-y-2 lg:max-w-md">
                      {usageByModelChartData.map((item, index) => {
                        const percentage =
                          totalChartRequests > 0
                            ? (item.value / totalChartRequests) * 100
                            : 0;

                        return (
                          <button
                            className="flex w-full items-center gap-2.5 rounded-lg border border-border/70 px-3 py-2 text-left transition-colors hover:bg-muted/40"
                            key={item.label}
                            onMouseEnter={() => setHoveredModelIndex(index)}
                            onMouseLeave={() => setHoveredModelIndex(null)}
                            type="button"
                          >
                            <span
                              className="h-2 w-2 shrink-0 rounded-full"
                              style={{ backgroundColor: item.color }}
                            />
                            <div className="min-w-0 flex-1">
                              <p
                                className="truncate text-xs font-medium text-foreground sm:text-sm"
                                title={item.label}
                              >
                                {item.label}
                              </p>
                              <p className="mt-0.5 text-[11px] text-muted-foreground sm:text-xs">
                                {percentage.toFixed(1)}% of requests
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-semibold text-foreground sm:text-sm">
                                {item.value.toLocaleString()}
                              </p>
                              <p className="text-[11px] text-muted-foreground sm:text-xs">
                                {item.model
                                  ? `${(item.model.tokens / 1000).toFixed(1)}K tokens`
                                  : "Grouped remainder"}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No model usage data available.
                  </p>
                )}
              </div>
            </SurfaceCard>

          </div>
        </>
      )}
    </div>
  );
}
