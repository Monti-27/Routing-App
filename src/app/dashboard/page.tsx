"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import {
  Zap,
  Key,
  Activity,
  TrendingUp,
  ChevronRight,
  AlertCircle,
  Bot,
  Clock,
} from "lucide-react";

interface UsageData {
  total_requests: number;
  total_input_tokens: number;
  total_output_tokens: number;
  total_cost: number;
  models: Record<string, { requests?: number; input_tokens?: number; output_tokens?: number }>;
}

interface CreditsData {
  credits: number;
  credits_monthly: number;
  credits_used: number;
  plan_tier: string;
  payg_enabled: boolean;
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

function formatTokens(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

function BarChart({ data, maxValue }: { data: { label: string; value: number }[]; maxValue: number }) {
  if (!data.length) return null;

  return (
    <div className="space-y-3">
      {data.map((item, i) => {
        const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
        return (
          <div key={i} className="flex items-center gap-4">
            <div className="w-32 shrink-0">
              <span className="text-sm text-foreground truncate block">{item.label}</span>
            </div>
            <div className="flex-1 h-6 bg-muted rounded-md overflow-hidden relative">
              <div
                className="h-full bg-zinc-600 rounded-md transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="w-16 text-right shrink-0">
              <span className="text-sm font-mono text-muted-foreground">{formatNumber(item.value)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [credits, setCredits] = useState<CreditsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [costMultiplier, setCostMultiplier] = useState(1.65);

  useEffect(() => {
    async function fetchData() {
      try {
        const [usageData, creditsData, settingsData] = await Promise.all([
          api.usage.get("monthly"),
          api.credits.get(),
          api.settings.get(),
        ]);
        setUsage(usageData);
        setCredits(creditsData);
        setCostMultiplier(settingsData.cost_multiplier);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const totalTokens = usage
    ? usage.total_input_tokens + usage.total_output_tokens
    : 0;

  const creditsPercentage = credits && credits.credits_monthly > 0
    ? Math.min(100, (Number(credits.credits_used) / Number(credits.credits_monthly)) * 100)
    : 0;

  const topModels = usage
    ? Object.entries(usage.models)
        .map(([name, data]) => ({
          name: name.replace("route/", "").replace(/-/g, " "),
          requests: data.requests || 0,
          tokens: (data.input_tokens || 0) + (data.output_tokens || 0),
        }))
        .filter((m) => m.requests > 0)
        .sort((a, b) => b.requests - a.requests)
        .slice(0, 5)
    : [];

  const maxRequests = topModels.length > 0 ? topModels[0].requests : 1;

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Welcome back, {user?.name || "User"}</h2>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s happening with your API usage today.
          </p>
        </div>
        <Card className="border-destructive/50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <p className="text-lg font-medium">Failed to load usage data</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
            <p className="text-xs text-muted-foreground mt-4">
              Make sure the backend server is running and Redis is connected.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Welcome back, {user?.name?.split(" ")[0] || "User"}
        </h2>
        <p className="text-muted-foreground mt-1">
          Here&apos;s your API usage overview.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Requests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{formatNumber(usage?.total_requests || 0)}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tokens Used</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{formatTokens(totalTokens)}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Credits Left</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{credits?.credits.toFixed(1) || "0"}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Plan</CardTitle>
            <Badge variant="outline" className="text-xs">
              {credits?.plan_tier?.toUpperCase() || "FREE"}
            </Badge>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{formatNumber(credits?.credits_monthly || 0)}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">monthly credits</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Credits This Month</CardTitle>
              <Badge variant="secondary">{creditsPercentage.toFixed(0)}% used</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-24 w-full" />
            ) : (
              <div className="space-y-4">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-bold">{credits?.credits.toFixed(1) || "0"}</p>
                    <p className="text-sm text-muted-foreground">credits remaining</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold">${((credits?.credits_used || 0) * costMultiplier).toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">credits used</p>
                  </div>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-zinc-600 rounded-full transition-all duration-500"
                    style={{ width: `${creditsPercentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{((credits?.credits || 0)).toFixed(1)} left</span>
                  <span>{credits?.credits_monthly || 0} total</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <a 
              href="/dashboard/keys" 
              className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <div className="rounded-lg bg-muted p-2">
                <Key className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">API Keys</p>
                <p className="text-xs text-muted-foreground">Manage your keys</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </a>
            <a 
              href="/dashboard/models" 
              className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <div className="rounded-lg bg-muted p-2">
                <Bot className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Models</p>
                <p className="text-xs text-muted-foreground">Browse available models</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </a>
            <a 
              href="/dashboard/usage" 
              className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <div className="rounded-lg bg-muted p-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Usage</p>
                <p className="text-xs text-muted-foreground">View detailed analytics</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </a>
          </CardContent>
        </Card>
      </div>

      {topModels.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Top Models</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <BarChart 
              data={topModels.map(m => ({ label: m.name, value: m.requests }))}
              maxValue={maxRequests}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Getting Started</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3 p-4 rounded-lg border">
              <div className="rounded-lg bg-muted p-2">
                <Key className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <h4 className="text-sm font-medium">Create an API Key</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Generate an API key to start making requests to our LLM gateway.
                </p>
                <a href="/dashboard/keys" className="text-xs text-muted-foreground hover:text-foreground mt-2 inline-block">
                  Get started →
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg border">
              <div className="rounded-lg bg-muted p-2">
                <Activity className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <h4 className="text-sm font-medium">Check Documentation</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Learn how to integrate our API into your application.
                </p>
                <a href="/dashboard/usage" className="text-xs text-muted-foreground hover:text-foreground mt-2 inline-block">
                  View docs →
                </a>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
