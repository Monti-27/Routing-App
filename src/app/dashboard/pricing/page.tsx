"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  Check,
  Coins,
  Crown,
  Diamond,
  Leaf,
  Rocket,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import {
  PageHeader,
  PillStat,
  SubtleBadge,
  SurfaceCard,
} from "@/components/dashboard/page-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth-context";
import {
  getDashboardModelsForTier,
  type PlanTier,
} from "@/lib/dashboard-model-catalog";
import { cn } from "@/lib/utils";

const plans = [
  {
    id: "free",
    name: "Free",
    label: "Free",
    price: "$0",
    priceDetail: "forever",
    requestsPerDay: 50,
    checkoutUrl: "/auth/register",
    summary: "Best for trying the router and light personal usage.",
    popular: false,
    features: [
      "50 requests per day",
      "Basic model access",
      "Standard routing",
      "Community support",
    ],
  },
  {
    id: "lite",
    name: "Lite",
    label: "Lite",
    price: "$10",
    priceDetail: "/month",
    requestsPerDay: 400,
    checkoutUrl: "https://whop.com/tropic-6587/routing-lite/",
    summary: "A stronger daily cap for active prototypes and internal tools.",
    popular: false,
    features: [
      "400 requests per day",
      "Extended model access",
      "Priority routing",
      "Email support",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    label: "Popular",
    price: "$20",
    priceDetail: "/month",
    requestsPerDay: 1000,
    checkoutUrl: "https://whop.com/tropic-6587/routing-pro/",
    summary:
      "The balanced tier for production apps with broader model coverage.",
    popular: true,
    features: [
      "1,000 requests per day",
      "Highspeed model access",
      "Fastest routing",
      "Priority support",
    ],
  },
  {
    id: "max",
    name: "Max",
    label: "Max",
    price: "$50",
    priceDetail: "/month",
    requestsPerDay: 2500,
    checkoutUrl: "https://whop.com/tropic-6587/routing-max/",
    summary: "Full catalog access and the highest daily throughput envelope.",
    popular: false,
    features: [
      "2,500 requests per day",
      "All models access",
      "Fastest routing",
      "Dedicated support",
    ],
  },
] as const;

const tierMeta: Record<
  (typeof plans)[number]["id"],
  {
    icon: LucideIcon;
    iconClassName: string;
    chipClassName: string;
    cardClassName: string;
    accentClassName: string;
  }
> = {
  free: {
    icon: Leaf,
    iconClassName: "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900",
    chipClassName:
      "border-zinc-200 bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200",
    cardClassName: "border-zinc-200 dark:border-zinc-800",
    accentClassName: "text-zinc-700 dark:text-zinc-200",
  },
  lite: {
    icon: Rocket,
    iconClassName: "bg-[#1470e3] text-white",
    chipClassName:
      "border-[#1470e3]/20 bg-[#1470e3]/10 text-[#1470e3] dark:border-[#1470e3]/30",
    cardClassName: "border-[#1470e3]/20 dark:border-[#1470e3]/25",
    accentClassName: "text-[#1470e3]",
  },
  premium: {
    icon: Crown,
    iconClassName: "bg-[#8350e8] text-white",
    chipClassName:
      "border-[#8350e8]/20 bg-[#8350e8]/10 text-[#8350e8] dark:border-[#8350e8]/30",
    cardClassName: "border-[#8350e8]/30 dark:border-[#8350e8]/40",
    accentClassName: "text-[#8350e8]",
  },
  max: {
    icon: Diamond,
    iconClassName: "bg-[#8350e8] text-white",
    chipClassName:
      "border-[#8350e8]/20 bg-[#8350e8]/10 text-[#8350e8] dark:border-[#8350e8]/30",
    cardClassName: "border-[#8350e8]/25 dark:border-[#8350e8]/30",
    accentClassName: "text-[#8350e8]",
  },
};

function formatPrice(perMillion: number) {
  if (perMillion === 0) return "Free";
  return `$${perMillion.toFixed(3)}/M`;
}

function ModelAvatar({
  displayName,
  logo,
}: {
  displayName: string;
  logo?: string;
}) {
  if (logo) {
    return (
      <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
        <Image
          alt={displayName}
          className="object-contain p-1.5"
          fill
          sizes="36px"
          src={logo}
        />
      </div>
    );
  }

  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-100 text-[11px] font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
      {displayName.slice(0, 2).toUpperCase()}
    </div>
  );
}

function PricingPlanCard({
  plan,
  isCurrentPlan,
}: {
  plan: (typeof plans)[number];
  isCurrentPlan: boolean;
}) {
  const tierStyles = tierMeta[plan.id];
  const TierIcon = tierStyles.icon;

  const handleAction = () => {
    if (plan.checkoutUrl.startsWith("/")) {
      window.location.href = plan.checkoutUrl;
      return;
    }

    window.open(plan.checkoutUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className={cn(
        "group relative flex h-full flex-col rounded-2xl border bg-white p-6 transition-all hover:border-zinc-300 hover:shadow-lg dark:bg-[#181818] dark:hover:border-zinc-700",
        tierStyles.cardClassName,
        plan.popular && "ring-2 ring-[#8350e8]/40",
      )}
    >
      {plan.popular && (
        <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-[#8350e8]" />
      )}

      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl",
            tierStyles.iconClassName,
          )}
        >
          <TierIcon className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-foreground">
              {plan.name}
            </h3>
            {isCurrentPlan && <SubtleBadge>Current</SubtleBadge>}
            {plan.popular && !isCurrentPlan && (
              <SubtleBadge>Popular</SubtleBadge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {plan.priceDetail === "forever" ? "Free forever" : plan.priceDetail}
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-baseline gap-1">
        <span className="text-4xl font-semibold tracking-tight text-foreground">
          {plan.price}
        </span>
        {plan.priceDetail !== "forever" && (
          <span className="text-sm text-muted-foreground">/month</span>
        )}
      </div>

      <p className="mt-3 text-sm text-muted-foreground">{plan.summary}</p>

      <div className="mt-6 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900/50">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Daily requests</span>
          <span className="text-lg font-semibold text-foreground">
            {plan.requestsPerDay.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="mt-4 flex-1 space-y-2.5">
        {plan.features.map((feature) => (
          <div className="flex items-center gap-2.5" key={feature}>
            <Check className={cn("h-4 w-4", tierStyles.accentClassName)} />
            <span className="text-sm text-foreground">{feature}</span>
          </div>
        ))}
      </div>

      <Button
        className={cn(
          "mt-6 h-11 w-full justify-center rounded-xl text-sm font-medium transition-all",
          plan.popular
            ? "bg-[#8350e8] text-white hover:opacity-90"
            : "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200",
          isCurrentPlan && plan.id !== "free" && "opacity-70",
        )}
        onClick={handleAction}
        type="button"
      >
        {plan.id === "free"
          ? "Get started free"
          : isCurrentPlan
            ? "Manage plan"
            : `Upgrade to ${plan.name}`}
      </Button>
    </div>
  );
}

export default function PricingPage() {
  const [selectedTier, setSelectedTier] = useState<PlanTier>("free");
  const { user } = useAuth();

  const currentTier =
    (user?.plan_tier?.toLowerCase() as
      | (typeof plans)[number]["id"]
      | undefined) ?? "free";

  const filteredModels = useMemo(
    () => getDashboardModelsForTier(selectedTier),
    [selectedTier],
  );

  const selectedPlan =
    plans.find((plan) => plan.id === selectedTier) ?? plans[0];

  return (
    <div className="space-y-6">
      <PageHeader
        description="Choose a plan that matches your traffic volume and model needs."
        meta={<SubtleBadge>Current: {currentTier}</SubtleBadge>}
        title="Pricing"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => (
          <PricingPlanCard
            isCurrentPlan={currentTier === plan.id}
            key={plan.id}
            plan={plan}
          />
        ))}
      </div>

      <SurfaceCard
        action={
          <Tabs
            className="w-full md:w-auto"
            onValueChange={(value) =>
              setSelectedTier(value as (typeof plans)[number]["id"])
            }
            value={selectedTier}
          >
            <TabsList className="grid h-auto w-full grid-cols-2 gap-2 rounded-xl border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-800 dark:bg-zinc-900/40 md:w-auto md:grid-cols-4">
              {plans.map((plan) => (
                <TabsTrigger
                  className="rounded-lg px-3 py-2 text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-none dark:data-[state=active]:bg-[#181818]"
                  key={plan.id}
                  value={plan.id}
                >
                  {plan.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        }
        contentClassName="p-0"
        description="Token pricing for each plan tier. Input and output rates are shown per one million tokens."
        title="Model Pricing"
      >
        <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                {selectedPlan.name} tier catalog
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {filteredModels.length} models currently listed for this tier.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <PillStat
                label="Requests / day"
                value={selectedPlan.requestsPerDay.toLocaleString()}
              />
              <PillStat label="Tier" value={selectedPlan.label} />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-[0.18em] text-muted-foreground dark:border-zinc-800">
                <th className="px-5 py-3 font-medium">Model</th>
                <th className="px-5 py-3 font-medium">Tier</th>
                <th className="px-5 py-3 font-medium">Input</th>
                <th className="px-5 py-3 font-medium">Output</th>
              </tr>
            </thead>
            <tbody>
              {filteredModels.map((model) => {
                const tierStyles = tierMeta[selectedTier];

                return (
                  <tr
                    className="border-b border-zinc-200/80 last:border-0 dark:border-zinc-800/80"
                    key={`${selectedTier}-${model.id}`}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <ModelAvatar
                          displayName={model.name}
                          logo={model.logo}
                        />
                        <div>
                          <p className="font-medium text-foreground">
                            {model.name}
                          </p>
                          <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                            {model.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <Badge
                        className={cn(
                          "rounded-md border px-2.5 py-1 text-[11px] font-medium shadow-none",
                          tierStyles.chipClassName,
                        )}
                        variant="outline"
                      >
                        {selectedTier}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-foreground">
                      {formatPrice(model.input_price)}
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-foreground">
                      {formatPrice(model.output_price)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SurfaceCard>

      <SurfaceCard
        contentClassName="grid gap-3 md:grid-cols-3"
        description="A few practical notes so the pricing page answers the common questions without sending you elsewhere."
        title="Notes"
      >
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Sparkles className="h-4 w-4 text-[#1470e3]" />
            Routing behavior
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            All plans use the same router. Higher tiers mainly expand daily
            limits, model access, and access to faster variants.
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Coins className="h-4 w-4 text-[#1470e3]" />
            Token billing
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Input and output prices are shown per million tokens so you can
            compare models directly inside the dashboard before changing tiers.
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Crown className="h-4 w-4 text-[#8350e8]" />
            Upgrades
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            If you outgrow your current cap, you can upgrade from here and keep
            the same app integration, keys, and routing behavior.
          </p>
        </div>
      </SurfaceCard>
    </div>
  );
}
