"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Download,
  Loader2,
} from "lucide-react";
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
  const [chartData, setChartData] = useState<{ date: string; requests: number }[]>([]);
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
            const m = metrics as Record<string, number>;
            const isImageModel = Boolean(m.is_image_model);
            const modelRequests = m.image_requests || m.requests || 0;
            const input = m.input_tokens || 0;
            const output = m.output_tokens || 0;
            
            let cost = m.cost || 0;
            if (isImageModel && !m.cost) {
              cost = 0;
            } else if (!cost && (input > 0 || output > 0)) {
              cost = ((input + output) / 1000) * 0.01;
            }
            
            models.push({
              model: modelName,
              requests: modelRequests,
              tokens: input + output,
              cost: cost,
            });
            
            if (period === "daily" || period === "monthly") {
              chart.push({ date: modelName, requests: modelRequests });
            }
          }
        }
        
        if (chart.length === 0) {
          chart.push({ date: period === "hourly" ? "Now" : "Today", requests: requests });
        }
        
        setModelUsage(models.sort((a, b) => b.requests - a.requests));
        setChartData(chart);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load usage");
        setModelUsage([
          { model: "GPT-4o", requests: 4821, tokens: 156200, cost: 3.24 },
          { model: "Claude 3.5 Sonnet", requests: 3542, tokens: 128400, cost: 5.12 },
          { model: "Gemini Pro", requests: 2104, tokens: 89400, cost: 1.78 },
          { model: "Qwen Coder Next", requests: 1523, tokens: 67200, cost: 1.01 },
          { model: "MiniMax", requests: 857, tokens: 38900, cost: 0.68 },
        ]);
        setTotalRequests(12847);
        setTotalInputTokens(312400);
        setTotalOutputTokens(174800);
        setChartData([
          { date: "Mon", requests: 1240 },
          { date: "Tue", requests: 1890 },
          { date: "Wed", requests: 2100 },
          { date: "Thu", requests: 1650 },
          { date: "Fri", requests: 2340 },
          { date: "Sat", requests: 980 },
          { date: "Sun", requests: 1120 },
        ]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [period]);

  const maxRequests = Math.max(...chartData.map((d) => d.requests), 1);

  return (
    <div className="space-y-6 overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Usage Analytics</h2>
          <p className="text-muted-foreground">
            Monitor your API usage, tokens, and costs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Last 30 days
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {(["daily", "hourly", "monthly"] as Period[]).map((p) => (
          <Button
            key={p}
            variant={period === p ? "default" : "outline"}
            size="sm"
            onClick={() => setPeriod(p)}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </Button>
        ))}
      </div>

      {loading ? (
        <Card className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </Card>
      ) : error ? (
        <Card className="p-4 border-red-200 bg-red-50">
          <p className="text-sm text-red-600">{error}</p>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Requests
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalRequests.toLocaleString()}</div>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <TrendingUp className="h-3 w-3" />
                  Active period
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Tokens
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(totalInputTokens + totalOutputTokens).toLocaleString()}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  {totalInputTokens.toLocaleString()} in / {totalOutputTokens.toLocaleString()} out
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Est. Cost
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${totalCost.toFixed(2)}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  Based on usage
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Request Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 h-[200px]">
                {chartData.map((data, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-2">
                    <div className="flex w-full flex-col items-center">
                      <span className="text-xs text-muted-foreground mb-1">
                        {data.requests.toLocaleString()}
                      </span>
                      <div
                        className="w-full rounded-t-lg bg-brand-purple transition-all hover:bg-brand-coral"
                        style={{ height: `${Math.max((data.requests / maxRequests) * 150, 4)}px` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{data.date}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Usage by Model</CardTitle>
              </CardHeader>
              <CardContent className="max-h-[400px] overflow-y-auto">
                <div className="space-y-3">
                  {modelUsage.length > 0 ? modelUsage.map((model) => (
                    <div key={model.model} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm gap-2">
                        <span className="font-medium truncate max-w-[200px]" title={model.model}>{model.model}</span>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-muted-foreground text-xs">
                            {(model.tokens / 1000).toFixed(1)}K
                          </span>
                          <span className="font-medium text-xs">${(model.cost * costMultiplier).toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-secondary">
                        <div
                          className="h-1.5 rounded-full bg-brand-coral transition-all"
                          style={{
                            width: `${Math.max((model.requests / (modelUsage[0]?.requests || 1)) * 100, 2)}%`,
                          }}
                        />
                      </div>
                    </div>
                  )) : (
                    <p className="text-sm text-muted-foreground">No model usage data</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Provider Performance</CardTitle>
              </CardHeader>
              <CardContent className="max-h-[400px] overflow-y-auto">
                <div className="space-y-3">
                  {modelUsage.slice(0, 5).map((model, i) => (
                    <div
                      key={model.model}
                      className="flex items-center justify-between rounded-lg border p-2.5 gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={`h-2 w-2 rounded-full shrink-0 ${
                            i === 0 ? "bg-green-500" : i === 1 ? "bg-green-500" : "bg-yellow-500"
                          }`}
                        />
                        <span className="font-medium text-sm truncate max-w-[150px]" title={model.model}>{model.model}</span>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {model.requests.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">requests</p>
                        </div>
                        <Badge
                          variant="secondary"
                          className="bg-green-500/10 text-green-600"
                        >
                          Active
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Token Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Input Tokens</p>
                  <p className="text-2xl font-bold">{totalInputTokens.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">
                    {totalInputTokens + totalOutputTokens > 0
                      ? `${((totalInputTokens / (totalInputTokens + totalOutputTokens)) * 100).toFixed(1)}% of total`
                      : "0% of total"}
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Output Tokens</p>
                  <p className="text-2xl font-bold">{totalOutputTokens.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">
                    {totalInputTokens + totalOutputTokens > 0
                      ? `${((totalOutputTokens / (totalInputTokens + totalOutputTokens)) * 100).toFixed(1)}% of total`
                      : "0% of total"}
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Avg Tokens/Request</p>
                  <p className="text-2xl font-bold">
                    {totalRequests > 0
                      ? ((totalInputTokens + totalOutputTokens) / totalRequests).toFixed(1)
                      : "0"}
                  </p>
                  <p className="text-xs text-muted-foreground">per request</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
