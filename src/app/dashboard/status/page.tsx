"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Bot, Clock, RefreshCw, Server } from "lucide-react";

import {
  PageHeader,
  StatCard,
  SubtleBadge,
  SurfaceCard,
} from "@/components/dashboard/page-ui";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import {
  getDashboardModelsForTier,
  type PlanTier,
} from "@/lib/dashboard-model-catalog";

interface ProviderStatus {
  name: string;
  status: string;
  latency_ms: number | null;
}

interface ModelStatus {
  id: string;
  name: string;
  provider: string;
  tier: string;
  status: string;
}

interface IncidentReport {
  id: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  created_at: string;
  resolved_at: string | null;
}

interface StatusData {
  providers: ProviderStatus[];
  models: ModelStatus[];
  incidents: IncidentReport[];
  last_updated: string;
}

const tierColors: Record<PlanTier, string> = {
  free: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200",
  lite: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
  premium:
    "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  max: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
};

const tierOrder: PlanTier[] = ["free", "lite", "premium", "max"];

const tierLabels: Record<PlanTier, string> = {
  free: "Free",
  lite: "Lite",
  premium: "Premium (Pro)",
  max: "Max",
};

function normalizeTier(tier: string): PlanTier | null {
  if (tier === "pro") return "premium";
  if (
    tier === "free" ||
    tier === "lite" ||
    tier === "premium" ||
    tier === "max"
  ) {
    return tier;
  }

  return null;
}

function StatusBadge({ status }: { status: string }) {
  if (["online", "healthy", "operational"].includes(status)) {
    return (
      <Badge className="rounded-md bg-emerald-600 text-white hover:bg-emerald-600">
        Online
      </Badge>
    );
  }
  if (status === "degraded") {
    return (
      <Badge className="rounded-md bg-amber-500 text-white hover:bg-amber-500">
        Degraded
      </Badge>
    );
  }
  if (["error", "down"].includes(status)) {
    return (
      <Badge className="rounded-md bg-red-600 text-white hover:bg-red-600">
        Offline
      </Badge>
    );
  }
  return <Badge variant="outline">Unknown</Badge>;
}

function SeverityBadge({ severity }: { severity: string }) {
  if (severity === "error")
    return (
      <Badge className="rounded-md bg-red-600 text-white hover:bg-red-600">
        Critical
      </Badge>
    );
  if (severity === "warning")
    return (
      <Badge className="rounded-md bg-amber-500 text-white hover:bg-amber-500">
        Warning
      </Badge>
    );
  if (severity === "info")
    return (
      <Badge className="rounded-md bg-sky-600 text-white hover:bg-sky-600">
        Info
      </Badge>
    );
  return <Badge variant="outline">{severity}</Badge>;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function StatusPage() {
  const [status, setStatus] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const data = await api.status.get();
        setStatus(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load status");
      } finally {
        setLoading(false);
      }
    }

    void fetchStatus();
    const interval = window.setInterval(fetchStatus, 30_000);
    return () => window.clearInterval(interval);
  }, []);

  const modelStatusById = useMemo(() => {
    const statuses = new Map<string, ModelStatus>();

    for (const model of status?.models ?? []) {
      statuses.set(model.id, {
        ...model,
        tier: normalizeTier(model.tier) ?? model.tier,
      });
    }

    return statuses;
  }, [status]);

  const tierSections = useMemo(
    () =>
      tierOrder.map((tier) => ({
        tier,
        label: tierLabels[tier],
        models: getDashboardModelsForTier(tier).map((model) => {
          const liveStatus = modelStatusById.get(model.id);

          return {
            id: model.id,
            name: model.name,
            provider: liveStatus?.provider ?? model.provider,
            status: liveStatus?.status ?? "unknown",
          };
        }),
      })),
    [modelStatusById],
  );

  const onlineProviders =
    status?.providers.filter((provider) =>
      ["online", "healthy"].includes(provider.status),
    ).length || 0;
  const totalProviders = status?.providers.length || 0;
  const onlineModels = tierSections
    .flatMap((section) => section.models)
    .filter((model) => ["online", "healthy"].includes(model.status)).length;
  const totalModels = tierSections.reduce(
    (sum, section) => sum + section.models.length,
    0,
  );
  const activeIncidents =
    status?.incidents.filter((incident) => incident.status === "ongoing")
      .length || 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Status"
        description="Provider health, model availability, and current incidents in one place."
        meta={
          status?.last_updated ? (
            <SubtleBadge>
              Last updated {formatTimeAgo(status.last_updated)}
            </SubtleBadge>
          ) : null
        }
      />

      {error ? (
        <SurfaceCard
          title="Status unavailable"
          description="The latest service health snapshot could not be loaded."
        >
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-muted-foreground">
            {error}
          </div>
        </SurfaceCard>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              hint={`${totalProviders} tracked providers`}
              icon={Server}
              label="Providers online"
              value={
                loading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  `${onlineProviders}/${totalProviders}`
                )
              }
            />
            <StatCard
              hint={`${totalModels} tracked models`}
              icon={Bot}
              label="Models online"
              value={
                loading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  `${onlineModels}/${totalModels}`
                )
              }
            />
            <StatCard
              hint="Ongoing items requiring attention"
              icon={AlertTriangle}
              label="Active incidents"
              value={
                loading ? <Skeleton className="h-8 w-20" /> : activeIncidents
              }
            />
            <StatCard
              hint="Refreshes automatically every 30 seconds"
              icon={RefreshCw}
              label="Update cadence"
              value={loading ? <Skeleton className="h-8 w-24" /> : "30s"}
            />
          </div>

          {activeIncidents > 0 ? (
            <SurfaceCard
              title="Active incidents"
              description="Issues currently affecting service quality or availability."
            >
              <div className="space-y-3">
                {status?.incidents
                  .filter((incident) => incident.status === "ongoing")
                  .map((incident) => (
                    <div
                      className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-4"
                      key={incident.id}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-foreground">
                              {incident.title}
                            </p>
                            <SeverityBadge severity={incident.severity} />
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {incident.description}
                          </p>
                        </div>
                        <SubtleBadge>
                          Started {formatTimeAgo(incident.created_at)}
                        </SubtleBadge>
                      </div>
                    </div>
                  ))}
              </div>
            </SurfaceCard>
          ) : null}

          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <SurfaceCard
              title="Providers"
              description="Live provider status with observed latency."
            >
              <div className="space-y-3">
                {loading
                  ? Array.from({ length: 4 }).map((_, index) => (
                      <Skeleton className="h-14 w-full" key={index} />
                    ))
                  : status?.providers.map((provider) => (
                      <div
                        className="flex items-center justify-between rounded-lg border border-border/70 px-4 py-3"
                        key={provider.name}
                      >
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {provider.name}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {provider.latency_ms
                              ? `${provider.latency_ms}ms latency`
                              : "Latency unavailable"}
                          </p>
                        </div>
                        <StatusBadge status={provider.status} />
                      </div>
                    ))}
              </div>
            </SurfaceCard>

            <SurfaceCard
              title="Models by tier"
              description="Availability across account tiers and current operational status."
            >
              <div className="space-y-6">
                {loading
                  ? Array.from({ length: 4 }).map((_, index) => (
                      <Skeleton className="h-24 w-full" key={index} />
                    ))
                  : tierSections.map(({ tier, label, models }) => {
                      if (models.length === 0) return null;

                      return (
                        <div className="space-y-3" key={tier}>
                          <div className="flex items-center gap-2">
                            <Badge className={tierColors[tier]}>{label}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {models.length} models
                            </span>
                          </div>
                          <div className="space-y-2">
                            {models.map((model) => (
                              <div
                                className="flex items-center justify-between rounded-lg border border-border/70 px-4 py-3"
                                key={model.id}
                              >
                                <div>
                                  <p className="text-sm font-medium text-foreground">
                                    {model.name}
                                  </p>
                                  <p className="mt-1 text-sm text-muted-foreground">
                                    {model.provider}
                                  </p>
                                </div>
                                <StatusBadge status={model.status} />
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
              </div>
            </SurfaceCard>
          </div>

          {status?.incidents?.length ? (
            <SurfaceCard
              title="Incident history"
              description="Recent resolved and active operational events."
            >
              <div className="space-y-3">
                {status.incidents.map((incident) => (
                  <div
                    className="rounded-lg border border-border/70 px-4 py-4"
                    key={incident.id}
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-medium text-foreground">
                            {incident.title}
                          </p>
                          <SeverityBadge severity={incident.severity} />
                          {incident.status === "resolved" ? (
                            <Badge className="rounded-md bg-emerald-600 text-white hover:bg-emerald-600">
                              Resolved
                            </Badge>
                          ) : null}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {incident.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        <span>
                          Started {formatTimeAgo(incident.created_at)}
                        </span>
                        {incident.resolved_at ? (
                          <span>
                            Resolved {formatTimeAgo(incident.resolved_at)}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SurfaceCard>
          ) : null}
        </>
      )}
    </div>
  );
}
