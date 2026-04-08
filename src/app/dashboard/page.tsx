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
  Shield,
} from "lucide-react";

interface UsageData {
  total_requests: number;
  total_input_tokens: number;
  total_output_tokens: number;
  total_cost: number;
  models: Record<string, { requests?: number; input_tokens?: number; output_tokens?: number }>;
  daily_requests_used?: number;
}

interface PlanData {
  plan_tier: string;
  requests_per_day: number;
  requests_used_today: number;
}

interface UserData {
  plan_tier: string;
  is_upgraded: boolean;
  upgrade_expires_at: string | null;
}

const PLAN_LIMITS: Record<string, number> = {
  free: 50,
  lite: 400,
  premium: 1000,
  max: 2500,
};

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
  const [plan, setPlan] = useState<PlanData | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [usageData, requestsData, userInfo] = await Promise.all([
          api.usage.get("monthly"),
          api.requests.get(),
          api.auth.me(),
        ]);
        setUsage(usageData);
        setPlan({
          plan_tier: requestsData.plan_tier,
          requests_per_day: requestsData.requests_limit_today,
          requests_used_today: requestsData.requests_used_today,
        });
        setUserData({
          plan_tier: userInfo.plan_tier,
          is_upgraded: userInfo.is_upgraded,
          upgrade_expires_at: userInfo.upgrade_expires_at,
        });
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  function formatUpgradeExpiry(dateStr: string | null): string {
    if (!dateStr) return "";
    const expires = new Date(dateStr);
    const now = new Date();
    const diffMs = expires.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return "Expired";
    if (diffDays === 1) return "1 day left";
    if (diffDays < 30) return `${diffDays} days left`;
    return expires.toLocaleDateString();
  }

  const totalTokens = usage
    ? usage.total_input_tokens + usage.total_output_tokens
    : 0;

  const dailyLimit = plan ? PLAN_LIMITS[plan.plan_tier?.toLowerCase()] || 50 : 50;
  const requestsUsedToday = plan?.requests_used_today || usage?.daily_requests_used || 0;
  const requestsRemaining = Math.max(0, dailyLimit - requestsUsedToday);
  const requestsPercentage = dailyLimit > 0
    ? Math.min(100, (requestsUsedToday / dailyLimit) * 100)
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
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold tracking-tight">
            Welcome back, {user?.name?.split(" ")[0] || "User"}
          </h2>
          {userData?.is_upgraded && userData?.upgrade_expires_at && (
            <Badge variant="secondary" className="bg-green-500/20 text-green-500 border-green-500/30">
              Upgrade: {formatUpgradeExpiry(userData.upgrade_expires_at)}
            </Badge>
          )}
        </div>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Requests Left</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{formatNumber(requestsRemaining)}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Plan</CardTitle>
            <Badge variant="outline" className="text-xs">
              {plan?.plan_tier?.toUpperCase() || "FREE"}
            </Badge>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{formatNumber(dailyLimit)}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">requests/day</p>
            {userData?.is_upgraded && userData?.upgrade_expires_at && (
              <p className="text-xs text-green-500 mt-2 font-medium">
                Upgrade: {formatUpgradeExpiry(userData.upgrade_expires_at)}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold"> Requests Today</CardTitle>
              <Badge variant="secondary">{requestsPercentage.toFixed(0)}% used</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-24 w-full" />
            ) : (
              <div className="space-y-4">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-bold">{formatNumber(requestsRemaining)}</p>
                    <p className="text-sm text-muted-foreground">requests remaining</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold">{formatNumber(requestsUsedToday)}</p>
                    <p className="text-sm text-muted-foreground">requests used</p>
                  </div>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-zinc-600 rounded-full transition-all duration-500"
                    style={{ width: `${requestsPercentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatNumber(requestsRemaining)} left</span>
                  <span>{dailyLimit} total</span>
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

      <Card className="border-green-500/20 bg-green-500/5">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-green-500/20 p-2">
              <Shield className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-green-500">Privacy First</h4>
              <p className="text-xs text-muted-foreground mt-1">
                We do not store your prompts or request content. Only usage metadata (tokens used, model, provider, latency) is stored for dashboard display and management. 
                <a href="https://github.com/RoutingRun/Route-Backend" target="_blank" rel="noopener noreferrer" className="text-green-500 hover:underline ml-1">
                  View source code →
                </a>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
