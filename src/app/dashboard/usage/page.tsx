"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  Calendar,
  Download,
  Loader2,
  TrendingUp,
} from "lucide-react";

import {
  InlineMetric,
  PageHeader,
  StatCard,
  SubtleBadge,
  SurfaceCard,
} from "@/components/dashboard/page-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

type Period = "daily" | "hourly" | "monthly";

interface ModelUsage {
  model: string;
  requests: number;
  tokens: number;
  cost: number;
}

export default function UsagePage() {
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

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const [usageData, settingsData] = await Promise.all([
          api.usage.get(period),
          api.settings.get(),
        ]);

        setCostMultiplier(settingsData.cost_multiplier);

        const requests = usageData.total_requests || 0;
        const inputTokens = usageData.total_input_tokens || 0;
        const outputTokens = usageData.total_output_tokens || 0;
        const cost = (usageData.total_cost || 0) * settingsData.cost_multiplier;

        setTotalRequests(requests);
        setTotalInputTokens(inputTokens);
        setTotalOutputTokens(outputTokens);
        setTotalCost(cost);

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

        setModelUsage(models.sort((a, b) => b.requests - a.requests));
        setChartData(chart);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load usage");
      } finally {
        setLoading(false);
      }
    }

    void fetchData();
  }, [period]);

  const maxRequests = Math.max(...chartData.map((entry) => entry.requests), 1);
  const totalTokens = totalInputTokens + totalOutputTokens;

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

          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <SurfaceCard
              title="Request distribution"
              description="Relative request volume for the current reporting selection."
            >
              <div className="flex h-[280px] items-end gap-3">
                {chartData.map((entry) => (
                  <div
                    className="flex min-w-0 flex-1 flex-col items-center gap-2"
                    key={entry.date}
                  >
                    <span className="text-xs text-muted-foreground">
                      {entry.requests.toLocaleString()}
                    </span>
                    <div className="flex h-[220px] w-full items-end rounded-lg bg-muted/60 px-2 pb-2">
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
              title="Token breakdown"
              description="How prompt and completion volume are split."
            >
              <div className="space-y-3">
                <InlineMetric
                  label="Input tokens"
                  value={totalInputTokens.toLocaleString()}
                />
                <InlineMetric
                  label="Output tokens"
                  value={totalOutputTokens.toLocaleString()}
                />
                <InlineMetric
                  label="Input share"
                  value={
                    totalTokens > 0
                      ? `${((totalInputTokens / totalTokens) * 100).toFixed(1)}%`
                      : "0%"
                  }
                />
                <InlineMetric
                  label="Output share"
                  value={
                    totalTokens > 0
                      ? `${((totalOutputTokens / totalTokens) * 100).toFixed(1)}%`
                      : "0%"
                  }
                />
              </div>
            </SurfaceCard>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <SurfaceCard
              title="Usage by model"
              description="Highest-volume models sorted by request count."
            >
              <div className="space-y-3">
                {modelUsage.length > 0 ? (
                  modelUsage.map((model) => (
                    <div
                      className="rounded-lg border border-border/70 px-4 py-3"
                      key={model.model}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p
                            className="truncate text-sm font-medium text-foreground"
                            title={model.model}
                          >
                            {model.model}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {(model.tokens / 1000).toFixed(1)}K tokens
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-foreground">
                            {model.requests.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ${(model.cost * costMultiplier).toFixed(2)} est.
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 h-1.5 rounded-full bg-muted">
                        <div
                          className="h-1.5 rounded-full bg-foreground"
                          style={{
                            width: `${Math.max((model.requests / (modelUsage[0]?.requests || 1)) * 100, 2)}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No model usage data available.
                  </p>
                )}
              </div>
            </SurfaceCard>

            <SurfaceCard
              title="Provider activity"
              description="A compact operational view of your busiest models."
            >
              <div className="space-y-3">
                {modelUsage.slice(0, 5).map((model) => (
                  <div
                    className="flex items-center justify-between rounded-lg border border-border/70 px-4 py-3"
                    key={model.model}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {model.model}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {model.requests.toLocaleString()} requests
                      </p>
                    </div>
                    <Badge className="rounded-md" variant="outline">
                      Active
                    </Badge>
                  </div>
                ))}
              </div>
            </SurfaceCard>
          </div>
        </>
      )}
    </div>
  );
}
