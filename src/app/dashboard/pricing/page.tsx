"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Crown,
  Diamond,
  Leaf,
  Rocket,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-ui";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { getDashboardModelsForTier } from "@/lib/dashboard-model-catalog";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const plans = [
  {
    id: "free" as const,
    name: "Free",
    price: 0,
    requestsPerDay: 20,
    checkoutUrl: "/auth/register",
    tagline: "Try the router with zero commitment.",
    features: [
      "20 requests / day",
      "Basic model access",
      "Standard routing",
      "Community support",
    ],
  },
  {
    id: "lite" as const,
    name: "Lite",
    price: 10,
    requestsPerDay: 400,
    checkoutUrl: "https://whop.com/tropic-6587/routing-lite/",
    tagline: "For active prototypes and internal tools.",
    features: [
      "400 requests / day",
      "Extended model catalog",
      "Priority routing",
      "Email support",
    ],
  },
  {
    id: "premium" as const,
    name: "Premium",
    price: 20,
    requestsPerDay: 1_000,
    popular: true,
    checkoutUrl: "https://whop.com/tropic-6587/routing-pro/",
    tagline: "Production-ready with broader model coverage.",
    features: [
      "1,000 requests / day",
      "Highspeed model access",
      "Fastest routing",
      "Priority support",
    ],
  },
  {
    id: "max" as const,
    name: "Max",
    price: 50,
    requestsPerDay: 2_500,
    checkoutUrl: "https://whop.com/tropic-6587/routing-max/",
    tagline: "Full catalog, highest throughput.",
    features: [
      "2,500 requests / day",
      "All models access",
      "Fastest routing",
      "Dedicated support",
    ],
  },
] as const;

type PlanId = (typeof plans)[number]["id"];

const tierVisual: Record<
  PlanId,
  { icon: LucideIcon; accent: string; bg: string; ring: string }
> = {
  free: {
    icon: Leaf,
    accent: "text-zinc-500",
    bg: "bg-zinc-100 dark:bg-zinc-800",
    ring: "ring-zinc-200 dark:ring-zinc-700",
  },
  lite: {
    icon: Rocket,
    accent: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950/40",
    ring: "ring-blue-200 dark:ring-blue-800",
  },
  premium: {
    icon: Crown,
    accent: "text-violet-500",
    bg: "bg-violet-50 dark:bg-violet-950/40",
    ring: "ring-violet-300 dark:ring-violet-800",
  },
  max: {
    icon: Diamond,
    accent: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    ring: "ring-amber-300 dark:ring-amber-800",
  },
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatTokenPrice(perMillion: number) {
  if (perMillion === 0) return "Free";
  return `$${perMillion.toFixed(3)}`;
}

/* ------------------------------------------------------------------ */
/*  Plan card                                                          */
/* ------------------------------------------------------------------ */

function PlanCard({
  plan,
  isCurrent,
}: {
  plan: (typeof plans)[number];
  isCurrent: boolean;
}) {
  const v = tierVisual[plan.id];
  const Icon = v.icon;
  const isPopular = "popular" in plan && plan.popular;

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
        "relative flex flex-col rounded-2xl border bg-white p-5 transition-shadow hover:shadow-md dark:bg-[#18181b]",
        isPopular
          ? "border-violet-400/60 dark:border-violet-600/50"
          : "border-zinc-200 dark:border-zinc-800",
      )}
    >
      {isPopular && (
        <span className="absolute -top-2.5 left-4 rounded-full bg-violet-600 px-2.5 py-0.5 text-[11px] font-semibold text-white">
          Most popular
        </span>
      )}

      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-xl",
            v.bg,
          )}
        >
          <Icon className={cn("h-4 w-4", v.accent)} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">
              {plan.name}
            </span>
            {isCurrent && (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                Current
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{plan.tagline}</p>
        </div>
      </div>

      <div className="mt-5 flex items-baseline gap-0.5">
        <span className="text-3xl font-bold tracking-tight text-foreground">
          ${plan.price}
        </span>
        <span className="text-sm text-muted-foreground">
          {plan.price === 0 ? " forever" : "/mo"}
        </span>
      </div>

      <div className="mt-4 rounded-xl bg-zinc-50 px-3.5 py-2.5 dark:bg-zinc-900/50">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Daily requests</span>
          <span className="font-semibold tabular-nums text-foreground">
            {plan.requestsPerDay.toLocaleString()}
          </span>
        </div>
      </div>

      <ul className="mt-4 flex-1 space-y-2">
        {plan.features.map((f) => (
          <li className="flex items-start gap-2 text-[13px] text-foreground" key={f}>
            <Check className={cn("mt-0.5 h-3.5 w-3.5 shrink-0", v.accent)} />
            {f}
          </li>
        ))}
      </ul>

      <Button
        className={cn(
          "mt-5 h-10 w-full rounded-xl text-sm font-medium",
          isPopular
            ? "bg-violet-600 text-white hover:bg-violet-700"
            : "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200",
        )}
        onClick={handleAction}
      >
        {plan.price === 0
          ? "Get started"
          : isCurrent
            ? "Manage plan"
            : "Upgrade"}
        <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Model pricing table                                                */
/* ------------------------------------------------------------------ */

function ModelRow({
  model,
}: {
  model: { id: string; name: string; logo?: string; input_price: number; output_price: number };
}) {
  return (
    <tr className="border-b border-zinc-100 last:border-0 dark:border-zinc-800/60">
      <td className="py-3 pr-4 pl-5">
        <div className="flex items-center gap-2.5">
          {model.logo ? (
            <div className="relative flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
              <Image
                alt={model.name}
                className="object-contain p-1"
                fill
                sizes="28px"
                src={model.logo}
              />
            </div>
          ) : (
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-[10px] font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
              {model.name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-foreground">{model.name}</p>
            <p className="font-mono text-[10px] text-muted-foreground">{model.id}</p>
          </div>
        </div>
      </td>
      <td className="py-3 px-4 text-right text-sm tabular-nums text-foreground">
        {formatTokenPrice(model.input_price)}
      </td>
      <td className="py-3 pl-4 pr-5 text-right text-sm tabular-nums text-foreground">
        {formatTokenPrice(model.output_price)}
      </td>
    </tr>
  );
}

function ModelPricingSection({ tier }: { tier: PlanId }) {
  const models = useMemo(() => getDashboardModelsForTier(tier), [tier]);
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? models : models.slice(0, 6);

  if (models.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-[#18181b]">
      <table className="w-full min-w-[400px] text-left">
        <thead>
          <tr className="border-b border-zinc-200 text-xs uppercase tracking-wider text-muted-foreground dark:border-zinc-800">
            <th className="py-2.5 pl-5 pr-4 font-medium">Model</th>
            <th className="py-2.5 px-4 text-right font-medium">Input / M</th>
            <th className="py-2.5 pl-4 pr-5 text-right font-medium">Output / M</th>
          </tr>
        </thead>
        <tbody>
          {visible.map((m) => (
            <ModelRow key={m.id} model={m} />
          ))}
        </tbody>
      </table>

      {models.length > 6 && (
        <button
          className="flex w-full items-center justify-center gap-1.5 border-t border-zinc-200 py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground dark:border-zinc-800"
          onClick={() => setExpanded((e) => !e)}
          type="button"
        >
          {expanded ? "Show less" : `Show all ${models.length} models`}
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 transition-transform",
              expanded && "rotate-180",
            )}
          />
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function PricingPage() {
  const [selectedTier, setSelectedTier] = useState<PlanId>("free");
  const { user } = useAuth();

  const currentTier = (user?.plan_tier?.toLowerCase() as PlanId | undefined) ?? "free";

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        description="Simple, transparent pricing. Upgrade or downgrade anytime."
        meta={
          <div className="flex items-center gap-2 pt-0.5">
            <Zap className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-xs text-muted-foreground">
              You&apos;re on the{" "}
              <span className="font-medium text-foreground">
                {currentTier.charAt(0).toUpperCase() + currentTier.slice(1)}
              </span>{" "}
              plan
            </span>
          </div>
        }
        title="Plans & Pricing"
      />

      {/* Whop notice */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-200/60 bg-amber-50/50 px-4 py-3 dark:border-amber-800/30 dark:bg-amber-950/20">
        <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40">
          <span className="text-[11px]">!</span>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Plan purchases aren&apos;t auto-upgrading right now. After buying, message us on{" "}
          <a
            className="font-medium text-foreground underline underline-offset-4"
            href="https://discord.gg/routing"
            rel="noopener noreferrer"
            target="_blank"
          >
            Discord
          </a>{" "}
          or email{" "}
          <a
            className="font-medium text-foreground underline underline-offset-4"
            href="mailto:support@routing.run"
          >
            support@routing.run
          </a>{" "}
          and we&apos;ll upgrade you.
        </p>
      </div>

      {/* Plan cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => (
          <PlanCard
            isCurrent={currentTier === plan.id}
            key={plan.id}
            plan={plan}
          />
        ))}
      </div>

      {/* Model pricing */}
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Model Pricing
            </h2>
            <p className="text-sm text-muted-foreground">
              Per-million token rates by plan tier.
            </p>
          </div>

          <div className="overflow-x-auto">
            <div className="flex gap-1 rounded-xl border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-800 dark:bg-zinc-900/40">
              {plans.map((p) => {
                const active = selectedTier === p.id;
                return (
                  <button
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors",
                      active
                        ? "bg-white text-foreground shadow-sm dark:bg-[#18181b]"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                    key={p.id}
                    onClick={() => setSelectedTier(p.id)}
                    type="button"
                  >
                    {p.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <ModelPricingSection tier={selectedTier} />
      </div>
    </div>
  );
}
