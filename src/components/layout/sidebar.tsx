"use client";

import { useEffect, useState } from "react";
import {
  ChartBar,
  CreditCard,
  Gauge,
  GearSix,
  Key,
  Stack,
} from "@phosphor-icons/react";

import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { dashboardModels } from "@/lib/dashboard-model-catalog";
import SidebarWithSubmenu, {
  type SidebarMenuItem,
  type SidebarModelUsage,
} from "@/components/ui/sidebar-with-submenu";

const navigation: SidebarMenuItem[] = [
  { href: "/dashboard", name: "Overview", icon: Gauge },
  { href: "/dashboard/keys", name: "API Keys", icon: Key },
  { href: "/dashboard/models", name: "Models", icon: Stack },
];

const billingItems: SidebarMenuItem[] = [
  { href: "/dashboard/pricing", name: "Plans", icon: CreditCard },
  { href: "/dashboard/usage", name: "Usage", icon: ChartBar },
];

const footerItems: SidebarMenuItem[] = [
  { href: "/dashboard/settings", name: "Settings", icon: GearSix },
];

const DEV_TOP_MODELS: SidebarModelUsage[] = [
  {
    id: "route/kimi-k2.5",
    name: "Kimi K2.5",
    logo: "/model-logos/route-kimi.png",
    requests: 6420,
  },
  {
    id: "route/deepseek-v3.2",
    name: "DeepSeek V3.2",
    logo: "/model-logos/route-deepseek.png",
    requests: 5180,
  },
  {
    id: "route/qwen3.5-9b",
    name: "Qwen3.5 9B",
    logo: "/model-logos/route-qwen.png",
    requests: 4030,
  },
  {
    id: "route/glm-5",
    name: "glm-5",
    logo: "/model-logos/route-zai.svg",
    requests: 2790,
  },
];

const modelCatalogMap = new Map(
  dashboardModels.map((m) => [m.id, m]),
);

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { user, isDevBypassEnabled, logout } = useAuth();
  const [topModels, setTopModels] = useState<SidebarModelUsage[]>([]);
  const [requestsRemaining, setRequestsRemaining] = useState<number | undefined>();
  const [requestsLimit, setRequestsLimit] = useState<number | undefined>();

  useEffect(() => {
    if (isDevBypassEnabled) {
      return;
    }

    Promise.all([api.usage.get("monthly"), api.requests.get()])
      .then(([usageData, requestsData]) => {
        const modelEntries = Object.entries(usageData.models || {})
          .map(([id, stats]) => {
            const reqs = typeof stats === "object" && stats !== null
              ? (stats as Record<string, number>).requests ?? 0
              : 0;
            const catalog = modelCatalogMap.get(id);
            return {
              id,
              name: catalog?.name ?? id.replace("route/", ""),
              logo: catalog?.logo,
              requests: reqs,
            };
          })
          .sort((a, b) => b.requests - a.requests)
          .slice(0, 4);

        setTopModels(modelEntries);
        setRequestsRemaining(requestsData.requests_remaining);
        setRequestsLimit(requestsData.requests_limit_today);
      })
      .catch(() => {});
  }, [isDevBypassEnabled]);

  const effectiveTopModels = isDevBypassEnabled ? DEV_TOP_MODELS : topModels;
  const effectiveRequestsRemaining = isDevBypassEnabled
    ? 2188
    : requestsRemaining ?? 0;
  const effectiveRequestsLimit = isDevBypassEnabled
    ? 2500
    : requestsLimit ?? 20;

  return (
    <SidebarWithSubmenu
      billingItems={billingItems}
      footerItems={footerItems}
      navigation={navigation}
      onNavigate={onNavigate}
      onLogout={() => void logout()}
      profile={{
        email: user?.email || "dev@routing.run",
        name: user?.name || "Dev User",
        plan: `${(user?.plan_tier || "free").toUpperCase()} Plan`,
      }}
      requestsLimit={effectiveRequestsLimit}
      requestsRemaining={effectiveRequestsRemaining}
      topModels={effectiveTopModels}
    />
  );
}
