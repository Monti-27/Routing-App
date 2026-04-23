"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
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
import { UsageSummaryCard } from "@/components/dashboard/usage-summary-card";
import { OverviewUsageByModel } from "@/components/dashboard/overview-usage-by-model";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

type Period = "daily" | "hourly" | "monthly";

type ModelMetrics = Record<string, { requests?: number; image_requests?: number; input_tokens?: number; output_tokens?: number; is_image_model?: number }>;

const DEV_MODELS: ModelMetrics = {
  "route/llama-3.1-70b": { requests: 6420, input_tokens: 422000, output_tokens: 264000 },
  "route/mistral-large": { requests: 5180, input_tokens: 356000, output_tokens: 241000 },
  "route/qwen-2.5-72b": { requests: 4030, input_tokens: 288000, output_tokens: 205000 },
  "route/deepseek-v3": { requests: 2790, input_tokens: 188000, output_tokens: 136000 },
};

const DEV_USAGE_CHARTS: Record<Period, { date: string; requests: number }[]> = {
  daily: [
    { date: "00:00", requests: 1480 },
    { date: "06:00", requests: 1720 },
    { date: "12:00", requests: 1580 },
    { date: "18:00", requests: 1940 },
    { date: "Now", requests: 2210 },
  ],
  hourly: [
    { date: "-50m", requests: 82 },
    { date: "-40m", requests: 134 },
    { date: "-30m", requests: 168 },
    { date: "-20m", requests: 121 },
    { date: "-10m", requests: 156 },
  ],
  monthly: [
    { date: "Week 1", requests: 4820 },
    { date: "Week 2", requests: 5360 },
    { date: "Week 3", requests: 4980 },
    { date: "Week 4", requests: 6410 },
  ],
};

const FALLBACK_PERIOD_BUCKETS: Record<Period, string[]> = {
  daily: ["00:00", "06:00", "12:00", "18:00", "Now"],
  hourly: ["-50m", "-40m", "-30m", "-20m", "-10m"],
  monthly: ["Week 1", "Week 2", "Week 3", "Week 4"],
};

const FALLBACK_PERIOD_WEIGHTS: Record<Period, number[]> = {
  daily: [0.18, 0.2, 0.19, 0.21, 0.22],
  hourly: [0.14, 0.2, 0.24, 0.18, 0.24],
  monthly: [0.22, 0.25, 0.23, 0.3],
};

function buildFallbackChart(period: Period, totalRequests: number) {
  const labels = FALLBACK_PERIOD_BUCKETS[period];
  const weights = FALLBACK_PERIOD_WEIGHTS[period];

  const chart = labels.map((date, index) => ({
    date,
    requests: Math.round(totalRequests * weights[index]),
  }));

  const assignedRequests = chart.reduce(
    (sum, entry) => sum + entry.requests,
    0,
  );

  if (chart.length > 0 && assignedRequests !== totalRequests) {
    chart[chart.length - 1].requests += totalRequests - assignedRequests;
  }

  return chart;
}

function applyUsageSnapshot({
  chart,
  inputTokens,
  outputTokens,
  requests,
  setChartData,
  setTotalInputTokens,
  setTotalOutputTokens,
  setTotalRequests,
}: {
  chart: { date: string; requests: number }[];
  inputTokens: number;
  outputTokens: number;
  requests: number;
  setChartData: React.Dispatch<
    React.SetStateAction<{ date: string; requests: number }[]>
  >;
  setTotalInputTokens: React.Dispatch<React.SetStateAction<number>>;
  setTotalOutputTokens: React.Dispatch<React.SetStateAction<number>>;
  setTotalRequests: React.Dispatch<React.SetStateAction<number>>;
}) {
  setTotalRequests(requests);
  setTotalInputTokens(inputTokens);
  setTotalOutputTokens(outputTokens);
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
  const [chartData, setChartData] = useState<
    { date: string; requests: number }[]
  >([]);
  const [models, setModels] = useState<Record<string, Record<string, number>> | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      if (isDevBypassEnabled) {
        applyUsageSnapshot({
          chart: DEV_USAGE_CHARTS[period],
          inputTokens: 1_254_000,
          outputTokens: 846_000,
          requests: 18_420,
          setChartData,
          setTotalInputTokens,
          setTotalOutputTokens,
          setTotalRequests,
        });
        setModels(DEV_MODELS);
        setLoading(false);
        return;
      }

      try {
        const usageData = await api.usage.get(period);

        const requests = usageData.total_requests || 0;
        const inputTokens = usageData.total_input_tokens || 0;
        const outputTokens = usageData.total_output_tokens || 0;

        applyUsageSnapshot({
          chart: buildFallbackChart(period, requests),
          inputTokens,
          outputTokens,
          requests,
          setChartData,
          setTotalInputTokens,
          setTotalOutputTokens,
          setTotalRequests,
        });
        setModels(usageData.models || null);
      } catch (err) {
        if (process.env.NODE_ENV === "development") {
          applyUsageSnapshot({
            chart: DEV_USAGE_CHARTS[period],
            inputTokens: 1_254_000,
            outputTokens: 846_000,
            requests: 18_420,
            setChartData,
            setTotalInputTokens,
            setTotalOutputTokens,
            setTotalRequests,
          });
          setError(null);
          setModels(DEV_MODELS);
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
  const requestDistributionDescription =
    period === "daily"
      ? "Breakdown of today's total requests across time-of-day buckets."
      : period === "hourly"
        ? "Breakdown of the current hour's total requests across recent minute buckets."
        : "Breakdown of this month's total requests across weekly buckets.";

  return (
    <div className="min-w-0 space-y-6">
      <PageHeader
        title="Usage"
        description="Request volume, token spend, and estimated cost across the selected reporting window."
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
              compact
              hint="Requests recorded in the selected period"
              icon={BarChart3}
              label="Total Requests"
              value={totalRequests.toLocaleString()}
            />
            <StatCard
              compact
              hint={`${totalInputTokens.toLocaleString()} in / ${totalOutputTokens.toLocaleString()} out`}
              icon={TrendingUp}
              label="Total Tokens"
              value={totalTokens.toLocaleString()}
            />
            <StatCard
              compact
              hint="Average daily request volume this period"
              icon={BarChart3}
              label="Avg Requests / Day"
              value={
                totalRequests > 0
                  ? Math.round(totalRequests / Math.max(1, new Date().getDate())).toLocaleString()
                  : "0"
              }
            />
            <StatCard
              compact
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

          <div className="grid gap-4 sm:gap-6 xl:grid-cols-2">
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
              description={requestDistributionDescription}
            >
              <div className="mt-auto flex h-[240px] items-end gap-2 sm:h-[380px] sm:gap-3">
                {chartData.map((entry) => (
                  <div
                    className="flex min-w-0 flex-1 flex-col items-center justify-end gap-2"
                    key={entry.date}
                  >
                    <span className="truncate text-xs text-muted-foreground">
                      {entry.requests.toLocaleString()}
                    </span>
                    <div className="flex h-[180px] w-full items-end rounded-lg bg-muted/60 px-1.5 pb-1.5 sm:h-[320px] sm:px-2 sm:pb-2">
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
          </div>

          <OverviewUsageByModel models={models} loading={false} />
        </>
      )}
    </div>
  );
}
