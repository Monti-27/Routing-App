"use client";

import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";

import {
  PageHeader,
  SubtleBadge,
  SurfaceCard,
} from "@/components/dashboard/page-ui";
import { OverviewPerformanceTrends } from "@/components/dashboard/overview-performance-trends";

import { OverviewUsageByModel } from "@/components/dashboard/overview-usage-by-model";
import { RequestFlightCard } from "@/components/dashboard/request-flight-card";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

interface UsageData {
  total_requests: number;
  total_input_tokens: number;
  total_output_tokens: number;
  total_cost: number;
  models: Record<
    string,
    { requests?: number; input_tokens?: number; output_tokens?: number }
  >;
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

const DEV_USAGE_DATA: UsageData = {
  total_requests: 18420,
  total_input_tokens: 1254000,
  total_output_tokens: 846000,
  total_cost: 48.36,
  daily_requests_used: 312,
  models: {
    "route/llama-3.1-70b": {
      requests: 6420,
      input_tokens: 422000,
      output_tokens: 264000,
    },
    "route/mistral-large": {
      requests: 5180,
      input_tokens: 356000,
      output_tokens: 241000,
    },
    "route/qwen-2.5-72b": {
      requests: 4030,
      input_tokens: 288000,
      output_tokens: 205000,
    },
    "route/deepseek-v3": {
      requests: 2790,
      input_tokens: 188000,
      output_tokens: 136000,
    },
  },
};

const DEV_PLAN_DATA: PlanData = {
  plan_tier: "max",
  requests_per_day: 2500,
  requests_used_today: 312,
};

const DEV_USER_DATA: UserData = {
  plan_tier: "max",
  is_upgraded: true,
  upgrade_expires_at: null,
};


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

export default function DashboardPage() {
  const { user, isDevBypassEnabled } = useAuth();
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [plan, setPlan] = useState<PlanData | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (isDevBypassEnabled) {
        setUsage(DEV_USAGE_DATA);
        setPlan(DEV_PLAN_DATA);
        setUserData(DEV_USER_DATA);
        setError(null);
        setLoading(false);
        return;
      }

      try {
        const [usageData, dailyUsageData, requestsData, userInfo] =
          await Promise.all([
            api.usage.get("monthly"),
            api.usage.get("daily"),
            api.requests.get(),
            api.auth.me(),
          ]);

        setUsage(usageData);
        setPlan({
          plan_tier: requestsData.plan_tier,
          requests_per_day: requestsData.requests_limit_today,
          requests_used_today: dailyUsageData.total_requests ?? 0,
        });
        setUserData({
          plan_tier: userInfo.plan_tier,
          is_upgraded: userInfo.is_upgraded,
          upgrade_expires_at: userInfo.upgrade_expires_at,
        });
        setError(null);
      } catch (err) {
        setUsage(null);
        setPlan(null);
        setUserData(null);
        setError(
          err instanceof Error ? err.message : "Failed to load dashboard",
        );
      } finally {
        setLoading(false);
      }
    }

    void fetchData();
  }, [isDevBypassEnabled]);

  const dailyLimit = plan
    ? plan.requests_per_day || 20
    : 20;
  const requestsUsedToday =
    plan?.requests_used_today || usage?.daily_requests_used || 0;
  const requestsRemaining = Math.max(0, dailyLimit - requestsUsedToday);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${user?.name?.split(" ")[0] || "User"}`}
        description={error ? "The workspace could not load your latest usage snapshot." : "A concise view of today’s request limits, monthly volume, and the models driving your traffic."}
        meta={
          userData?.is_upgraded && userData?.upgrade_expires_at ? (
            <SubtleBadge>
              Upgrade active: {formatUpgradeExpiry(userData.upgrade_expires_at)}
            </SubtleBadge>
          ) : null
        }
      />

      {error ? (
        <SurfaceCard
          title="Dashboard unavailable"
          description="Check your API connection and try again."
        >
          <div className="flex items-start gap-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-4 text-sm">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
            <div>
              <p className="font-medium text-foreground">
                Failed to load usage data
              </p>
              <p className="mt-1 text-muted-foreground">{error}</p>
            </div>
          </div>
        </SurfaceCard>
      ) : (
        <>
          <RequestFlightCard
            requestsUsed={requestsUsedToday}
            requestsTotal={dailyLimit}
            planTier={plan?.plan_tier || "free"}
            loading={loading}
          />

          <OverviewPerformanceTrends
            loading={loading}
            remainingRequests={requestsRemaining}
            usage={usage}
          />

          <OverviewUsageByModel models={usage?.models ?? null} loading={loading} />
        </>
      )}
    </div>
  );
}
