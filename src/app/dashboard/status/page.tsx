"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import {
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
  Server,
  Bot,
} from "lucide-react";

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

const providerLogos: Record<string, string> = {
  "MiniMax": "/providers/minimax.png",
  "OpenCode": "/providers/opencode.png",
  "Zai": "/providers/zai.svg",
  "OpenRouter": "/providers/openrouter.png",
  "OpenRouter Xiaomi": "/providers/openrouter.png",
  "OpenRouter DeepSeek": "/providers/openrouter.png",
  "OpenRouter Grok": "/providers/openrouter.png",
  "Chutes": "/providers/chutes.png",
};

const modelLogos: Record<string, string> = {
  "minimax": "/model-logos/route-minimax.png",
  "opencode": "/providers/opencode.png",
  "zai": "/model-logos/route-zai.svg",
  "openrouter": "/providers/openrouter.png",
  "nvidia": "/model-logos/route-nvidia.svg",
  "arcee": "/model-logos/route-arcee.png",
  "qwen": "/model-logos/route-qwen.png",
  "openai": "/model-logos/route-openai.svg",
  "nous": "/model-logos/route-nous.png",
  "meta": "/model-logos/route-meta.png",
  "google": "/model-logos/route-google.svg",
  "kimi": "/model-logos/route-kimi.png",
  "deepseek": "/model-logos/route-deepseek.png",
  "xiaomi": "/model-logos/route-xiaomi.png",
  "chutes": "/providers/chutes.png",
};

const modelIdLogos: Record<string, string> = {
  "route/nemotron-3-super-120b": "/model-logos/route-nvidia.svg",
  "route/nemotron-3-nano-30b": "/model-logos/route-nvidia.svg",
  "route/qwen3-coder": "/model-logos/route-qwen.png",
  "route/qwen3-coder-next": "/model-logos/route-qwen.png",
  "route/qwen3-32b": "/model-logos/route-qwen.png",
  "route/gpt-oss-120b": "/model-logos/route-openai.svg",
  "route/hermes-3-llama-3.1-405b": "/model-logos/route-nous.png",
  "route/llama-3.2-3b-instruct": "/model-logos/route-meta.png",
  "route/gemma-3-27b-it": "/model-logos/route-google.svg",
  "route/qwen3.6-plus-preview": "/model-logos/route-qwen.png",
  "route/qwen3-next-80b": "/model-logos/route-qwen.png",
  "route/glm-4.5-air": "/model-logos/route-zai.svg",
  "route/glm-5": "/model-logos/route-zai.svg",
  "route/glm-5-turbo": "/model-logos/route-zai.svg",
  "route/kimi-k2.5": "/model-logos/route-kimi.png",
  "route/deepseek-v3.2": "/model-logos/route-deepseek.png",
  "route/deepseek-v3.2-speciale": "/model-logos/route-deepseek.png",
  "route/deepseek-r1": "/model-logos/route-deepseek.png",
  "route/grok-4-fast": "/model-logos/route-xai.png",
  "route/grok-4.20-beta": "/model-logos/route-xai.png",
  "route/grok-4.20-multi-agent-beta": "/model-logos/route-xai.png",
  "route/mimo-v2-omni": "/model-logos/route-xiaomi.png",
  "route/mimo-v2-pro": "/model-logos/route-xiaomi.png",
  "route/mimo-v2-flash": "/model-logos/route-xiaomi.png",
  "route/minimax-image-1": "/model-logos/route-minimax.png",
};

const tierColors: Record<string, string> = {
  free: "bg-zinc-600",
  lite: "bg-blue-600",
  pro: "bg-indigo-600",
  max: "bg-violet-600",
};

function StatusBadge({ status }: { status: string }) {
  if (status === "online" || status === "healthy" || status === "operational") {
    return (
      <Badge className="bg-green-600 hover:bg-green-700">
        <CheckCircle className="h-3 w-3 mr-1" />
        Online
      </Badge>
    );
  }
  if (status === "degraded") {
    return (
      <Badge className="bg-amber-600 hover:bg-amber-700">
        <AlertTriangle className="h-3 w-3 mr-1" />
        Degraded
      </Badge>
    );
  }
  if (status === "error" || status === "down") {
    return (
      <Badge className="bg-red-600 hover:bg-red-700">
        <XCircle className="h-3 w-3 mr-1" />
        Offline
      </Badge>
    );
  }
  return (
    <Badge variant="secondary">
      <Clock className="h-3 w-3 mr-1" />
      Unknown
    </Badge>
  );
}

function getModelLogo(modelId: string, provider: string): string | undefined {
  if (modelIdLogos[modelId]) {
    return modelIdLogos[modelId];
  }
  const key = provider.toLowerCase();
  return modelLogos[key];
}

function SeverityBadge({ severity }: { severity: string }) {
  if (severity === "error") {
    return <Badge className="bg-red-600">Critical</Badge>;
  }
  if (severity === "warning") {
    return <Badge className="bg-amber-600">Warning</Badge>;
  }
  if (severity === "info") {
    return <Badge className="bg-blue-600">Info</Badge>;
  }
  return <Badge variant="secondary">{severity}</Badge>;
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
  const { user } = useAuth();
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
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">System Status</h2>
          <p className="text-muted-foreground">
            Monitor the health of our API and models.
          </p>
        </div>
        <Card className="border-destructive/50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <XCircle className="h-12 w-12 text-destructive mb-4" />
            <p className="text-lg font-medium">Failed to load status</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const onlineProviders = status?.providers.filter(p => p.status === "online" || p.status === "healthy").length || 0;
  const totalProviders = status?.providers.length || 0;
  const onlineModels = status?.models.filter(m => m.status === "online" || m.status === "healthy").length || 0;
  const totalModels = status?.models.length || 0;
  const activeIncidents = status?.incidents.filter(i => i.status === "ongoing").length || 0;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">System Status</h2>
        <p className="text-muted-foreground mt-1">
          Monitor the health of our API, providers, and models.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Providers</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{onlineProviders}</span>
                <span className="text-muted-foreground">/ {totalProviders}</span>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">providers online</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Models</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{onlineModels}</span>
                <span className="text-muted-foreground">/ {totalModels}</span>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">models operational</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Incidents</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{activeIncidents}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">open incidents</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Last Updated</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-sm font-medium">
                {status?.last_updated ? formatTimeAgo(status.last_updated) : "N/A"}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">auto-refreshes every 30s</p>
          </CardContent>
        </Card>
      </div>

      {activeIncidents > 0 && (
        <Card className="border-amber-500/50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <CardTitle className="text-base">Active Incidents</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {status?.incidents.filter(i => i.status === "ongoing").map((incident) => (
              <div key={incident.id} className="flex items-start gap-4 p-4 rounded-lg bg-amber-500/10">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{incident.title}</h4>
                    <SeverityBadge severity={incident.severity} />
                  </div>
                  <p className="text-sm text-muted-foreground">{incident.description}</p>
                  <p className="text-xs text-muted-foreground">
                    Started {formatTimeAgo(incident.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Providers</CardTitle>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <RefreshCw className="h-3 w-3" />
              Auto-refresh
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {status?.providers.map((provider) => (
                <div
                  key={provider.name}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    {providerLogos[provider.name] ? (
                      <img
                        src={providerLogos[provider.name]}
                        alt={provider.name}
                        className="w-8 h-8 object-contain"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                        <Server className="h-4 w-4" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-sm">{provider.name}</p>
                      {provider.latency_ms && (
                        <p className="text-xs text-muted-foreground">
                          {provider.latency_ms}ms latency
                        </p>
                      )}
                    </div>
                  </div>
                  <StatusBadge status={provider.status} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Models by Tier</CardTitle>
            <Badge variant="secondary">{totalModels} models</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {["free", "lite", "pro", "max"].map((tier) => {
                const tierModels = status?.models.filter(m => m.tier === tier) || [];
                if (tierModels.length === 0) return null;
                return (
                  <div key={tier} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge className={tierColors[tier]}>{tier.toUpperCase()}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {tierModels.length} models
                      </span>
                    </div>
                    <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                      {tierModels.map((model) => (
                        <div
                          key={model.id}
                          className="flex items-center gap-3 p-3 rounded-lg border"
                        >
                          {(() => {
                            const logo = getModelLogo(model.id, model.provider);
                            return logo ? (
                              <img
                                src={logo}
                                alt={model.provider}
                                className="w-8 h-8 object-contain shrink-0"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded bg-muted flex items-center justify-center shrink-0">
                                <Bot className="h-4 w-4 text-muted-foreground" />
                              </div>
                            );
                          })()}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{model.name}</p>
                            <p className="text-xs text-muted-foreground">{model.provider}</p>
                          </div>
                          <StatusBadge status={model.status} />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {status?.incidents && status.incidents.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Incident History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {status.incidents.map((incident) => (
              <div
                key={incident.id}
                className={`p-4 rounded-lg border ${
                  incident.status === "ongoing"
                    ? "bg-amber-500/10 border-amber-500/30"
                    : "bg-muted/50"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{incident.title}</h4>
                      <SeverityBadge severity={incident.severity} />
                      {incident.status === "resolved" && (
                        <Badge className="bg-green-600">Resolved</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{incident.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                      <span>Started {formatTimeAgo(incident.created_at)}</span>
                      {incident.resolved_at && (
                        <span>Resolved {formatTimeAgo(incident.resolved_at)}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
