"use client";

import Image from "next/image";
import { useState } from "react";
import {
  Bot,
  Check,
  Coins,
  Copy,
  Crown,
  Gem,
  Globe,
  Layers3,
  Shield,
  type LucideIcon,
  Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Model {
  id: string;
  name: string;
  description: string;
  provider: string;
  context_length: string;
  input_price: number;
  output_price: number;
  tiers: ("free" | "lite" | "premium" | "max")[];
  gradient: "purple" | "amber" | "coral";
  logo?: string;
}

type Tier = Model["tiers"][number];

const allModels: Model[] = [
  {
    id: "route/minimax-m2.5",
    name: "MiniMax M2.5",
    description: "Balanced performance and speed",
    provider: "minimax",
    context_length: "100K",
    input_price: 0.193,
    output_price: 1.238,
    tiers: ["lite", "premium", "max"],
    gradient: "amber",
    logo: "/model-logos/route-minimax.png",
  },
  {
    id: "route/minimax-m2.7",
    name: "MiniMax M2.7",
    description: "High-performance reasoning model with 100K context",
    provider: "minimax",
    context_length: "100K",
    input_price: 0.33,
    output_price: 1.32,
    tiers: ["lite", "premium", "max"],
    gradient: "purple",
    logo: "/model-logos/route-minimax.png",
  },
  {
    id: "route/minimax-m2.5-highspeed",
    name: "MiniMax M2.5 Highspeed",
    description: "Same as M2.5 with faster output ~70 tokens/sec",
    provider: "minimax",
    context_length: "100K",
    input_price: 0.193,
    output_price: 1.238,
    tiers: ["premium"],
    gradient: "coral",
    logo: "/model-logos/route-minimax.png",
  },
  {
    id: "route/minimax-m2.7-highspeed",
    name: "MiniMax M2.7 Highspeed",
    description: "M2.7 with faster output ~100 tokens/sec",
    provider: "minimax",
    context_length: "100K",
    input_price: 0.33,
    output_price: 1.32,
    tiers: ["premium", "max"],
    gradient: "coral",
    logo: "/model-logos/route-minimax.png",
  },
  {
    id: "route/kimi-k2.5",
    name: "Kimi K2.5",
    description: "Long context understanding with excellent reasoning",
    provider: "kimi",
    context_length: "131K",
    input_price: 0.462,
    output_price: 2.42,
    tiers: ["free", "lite", "premium", "max"],
    gradient: "coral",
    logo: "/model-logos/route-kimi.png",
  },
  {
    id: "route/kimi-k2.5-highspeed",
    name: "Kimi K2.5 Highspeed",
    description: "Kimi K2.5 with faster output ~100 tokens/sec",
    provider: "kimi",
    context_length: "131K",
    input_price: 0.6468,
    output_price: 3.388,
    tiers: ["premium", "max"],
    gradient: "purple",
    logo: "/model-logos/route-kimi.png",
  },
  {
    id: "route/glm-5",
    name: "GLM-5",
    description: "Latest generation GLM with enhanced reasoning",
    provider: "zai",
    context_length: "200K",
    input_price: 0.792,
    output_price: 2.53,
    tiers: ["free", "lite", "premium", "max"],
    gradient: "purple",
    logo: "/model-logos/route-zai.svg",
  },
  {
    id: "route/glm-5.1",
    name: "GLM-5.1",
    description: "Enhanced GLM with improved capabilities",
    provider: "route",
    context_length: "128K",
    input_price: 1,
    output_price: 3,
    tiers: ["lite", "premium", "max"],
    gradient: "purple",
    logo: "/model-logos/route-zai.svg",
  },
  {
    id: "route/qwen3.5-397b-a17b",
    name: "Qwen3.5 397B A17B",
    description: "Large 397B parameter model",
    provider: "route",
    context_length: "262K",
    input_price: 1.1,
    output_price: 3.3,
    tiers: ["free", "lite", "premium", "max"],
    gradient: "amber",
    logo: "/model-logos/route-qwen.png",
  },
  {
    id: "route/deepseek-v3.2",
    name: "DeepSeek V3.2",
    description: "Advanced reasoning model",
    provider: "route",
    context_length: "164K",
    input_price: 0.4928,
    output_price: 0.7392,
    tiers: ["free", "lite", "premium", "max"],
    gradient: "coral",
    logo: "/model-logos/route-deepseek.png",
  },
  {
    id: "route/gemma-4-31b-it",
    name: "Gemma 4 31B IT",
    description: "Google Gemma 4 instruction-tuned model for versatile tasks",
    provider: "route",
    context_length: "131K",
    input_price: 0.10,
    output_price: 0.30,
    tiers: ["free", "lite", "premium", "max"],
    gradient: "amber",
    logo: "/model-logos/route-google.svg",
  },
  {
    id: "route/deepseek-v3.2-speciale",
    name: "DeepSeek V3.2 Speciale",
    description: "Special edition DeepSeek model with enhanced capabilities",
    provider: "chutes",
    context_length: "164K",
    input_price: 0.55,
    output_price: 0.82,
    tiers: ["max"],
    gradient: "purple",
    logo: "/model-logos/route-deepseek.png",
  },
  {
    id: "route/deepseek-r1",
    name: "DeepSeek R1",
    description: "Advanced reasoning with chain-of-thought",
    provider: "chutes",
    context_length: "163K",
    input_price: 0.495,
    output_price: 2.365,
    tiers: ["max"],
    gradient: "amber",
    logo: "/model-logos/route-deepseek.png",
  },
];

const tierColors = {
  free: "bg-brand-amber/20 text-brand-amber",
  lite: "bg-brand-blue/20 text-brand-blue",
  premium: "bg-brand-coral/20 text-brand-coral",
  max: "bg-brand-purple/20 text-brand-purple",
};

const tierBadgeColors = {
  free: "border-brand-amber/30 bg-brand-amber/10 text-brand-amber dark:border-brand-amber/40 dark:bg-brand-amber/14",
  lite: "border-brand-blue/30 bg-brand-blue/10 text-brand-blue dark:border-brand-blue/40 dark:bg-brand-blue/14",
  premium:
    "border-brand-coral/30 bg-brand-coral/10 text-brand-coral dark:border-brand-coral/40 dark:bg-brand-coral/14",
  max: "border-brand-purple/30 bg-brand-purple/10 text-brand-purple dark:border-brand-purple/40 dark:bg-brand-purple/14",
};

const iconBgClasses = {
  purple: "bg-brand-purple/20 text-brand-purple",
  amber: "bg-brand-amber/20 text-brand-amber",
  coral: "bg-brand-coral/20 text-brand-coral",
  blue: "bg-brand-blue/20 text-brand-blue",
};

const tierRequestsPerDay = {
  free: 50,
  lite: 400,
  premium: 1000,
  max: 2500,
};

const tierMeta: Record<
  Tier,
  {
    icon: LucideIcon;
    iconBg: keyof typeof iconBgClasses;
    accentClass: string;
    softCardClass: string;
    label: string;
    blurb: string;
  }
> = {
  free: {
    icon: Shield,
    iconBg: "amber",
    accentClass: "text-brand-amber",
    softCardClass:
      "border-brand-amber/20 bg-gradient-to-br from-brand-amber/10 via-brand-amber/5 to-transparent",
    label: "Free Tier",
    blurb: "Entry access for testing and light usage",
  },
  lite: {
    icon: Zap,
    iconBg: "blue",
    accentClass: "text-brand-blue",
    softCardClass:
      "border-brand-blue/20 bg-gradient-to-br from-brand-blue/10 via-brand-blue/5 to-transparent",
    label: "Lite Tier",
    blurb: "Faster daily volume for active builders",
  },
  premium: {
    icon: Crown,
    iconBg: "coral",
    accentClass: "text-brand-coral",
    softCardClass:
      "border-brand-coral/20 bg-gradient-to-br from-brand-coral/10 via-brand-coral/5 to-transparent",
    label: "Premium Tier",
    blurb: "More capacity plus premium-only models",
  },
  max: {
    icon: Gem,
    iconBg: "purple",
    accentClass: "text-brand-purple",
    softCardClass:
      "border-brand-purple/20 bg-gradient-to-br from-brand-purple/10 via-brand-purple/5 to-transparent",
    label: "Max Tier",
    blurb: "Full catalog access with the highest limits",
  },
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      className="h-6 px-2 text-xs"
      onClick={handleCopy}
      size="sm"
      variant="ghost"
    >
      {copied ? (
        <Check className="h-3 w-3 text-green-500" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
    </Button>
  );
}

function getModelInitials(name: string): string {
  const words = name.split(" ");
  if (words.length >= 2) {
    return words[0][0] + words[1][0];
  }
  return name.substring(0, 2).toUpperCase();
}

function ModelAvatar({
  name,
  gradient,
  logo,
}: {
  name: string;
  gradient: "purple" | "amber" | "coral";
  logo?: string;
}) {
  if (logo) {
    return (
      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-black/5 bg-white/70 dark:border-white/10 dark:bg-white/5">
        <Image
          alt={name}
          className="object-contain p-2"
          fill
          sizes="48px"
          src={logo}
        />
      </div>
    );
  }
  return (
    <div
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${iconBgClasses[gradient]} font-bold text-sm`}
    >
      {getModelInitials(name)}
    </div>
  );
}

function ModelCard({ model }: { model: Model }) {
  return (
    <Card className="rounded-xl border-zinc-200 bg-white shadow-none dark:border-zinc-800 dark:bg-[#181818]">
      <div className="space-y-4 p-5">
        <div className="flex items-start gap-3">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <ModelAvatar
              gradient={model.gradient}
              logo={model.logo}
              name={model.name}
            />
            <div className="min-w-0 space-y-1">
              <h3 className="truncate text-base font-semibold">{model.name}</h3>
              <p className="line-clamp-2 text-xs text-muted-foreground">
                {model.description}
              </p>
            </div>
          </div>
          <div className="ml-auto flex max-w-[9rem] shrink-0 flex-wrap justify-end gap-1.5">
            {model.tiers.map((tier) => (
              <Badge
                className={`h-6 rounded-full px-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] shadow-sm ${tierBadgeColors[tier]}`}
                key={tier}
                variant="outline"
              >
                <span
                  aria-hidden
                  className="size-1.5 rounded-full bg-current/70"
                />
                {tier.toUpperCase()}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Ctx:</span>
            <span className="font-medium">{model.context_length}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bot className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="max-w-[100px] truncate font-medium">
              {model.provider}
            </span>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 dark:border-zinc-800 dark:bg-zinc-900/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs">
              <div>
                <span className="text-muted-foreground">In: </span>
                <span className="font-medium">
                  ${model.input_price.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Out: </span>
                <span className="font-medium">
                  ${model.output_price.toFixed(2)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-muted-foreground">/1M</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <code className="max-w-[160px] truncate rounded bg-muted/50 px-1.5 py-1 font-mono text-[10px] text-muted-foreground">
            {model.id}
          </code>
          <CopyButton text={model.id} />
        </div>
      </div>
    </Card>
  );
}

function ModelSection({
  title,
  description,
  tier,
  models,
  viewMode,
}: {
  title: string;
  description: string;
  tier: Tier;
  models: Model[];
  viewMode: "grid" | "list";
}) {
  const Icon = tierMeta[tier].icon;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconBgClasses[tierMeta[tier].iconBg]}`}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Badge className={`${tierColors[tier]} ml-auto`} variant="secondary">
          {models.length} models
        </Badge>
      </div>

      {viewMode === "grid" ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {models.map((model) => (
            <ModelCard key={model.id} model={model} />
          ))}
        </div>
      ) : (
        <Card className="rounded-xl border-zinc-200 bg-white shadow-none dark:border-zinc-800 dark:bg-[#181818]">
          <CardContent className="p-0">
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {models.map((model) => (
                <div
                  className="flex items-center justify-between p-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/40"
                  key={model.id}
                >
                  <div className="flex items-center gap-3">
                    <ModelAvatar
                      gradient={model.gradient}
                      logo={model.logo}
                      name={model.name}
                    />
                    <div>
                      <p className="text-sm font-medium">{model.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {model.provider}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xs font-medium">
                        {model.context_length}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        context
                      </p>
                    </div>
                    <div className="min-w-[60px] text-right">
                      <p className="text-xs font-medium">
                        ${model.input_price.toFixed(2)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">input</p>
                    </div>
                    <div className="min-w-[60px] text-right">
                      <p className="text-xs font-medium">
                        ${model.output_price.toFixed(2)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        output
                      </p>
                    </div>
                    <code className="hidden rounded bg-muted/50 px-1.5 py-1 font-mono text-[9px] text-muted-foreground lg:inline-block">
                      {model.id}
                    </code>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function LegacyModelsView() {
  const [activeTab, setActiveTab] = useState<
    "all" | "free" | "lite" | "premium" | "max"
  >("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const freeModels = allModels.filter((m) => m.tiers.includes("free"));
  const liteModels = allModels.filter((m) => m.tiers.includes("lite"));
  const premiumModels = allModels.filter((m) => m.tiers.includes("premium"));
  const maxModels = allModels.filter((m) => m.tiers.includes("max"));

  const tierSummaryCards: Array<{
    key: Tier | "all";
    title: string;
    value: number;
    unit: string;
    meta: string;
    icon: LucideIcon;
    cardClass: string;
    iconWrapClass: string;
    iconClass: string;
  }> = [
    {
      key: "free",
      title: tierMeta.free.label,
      value: tierRequestsPerDay.free,
      unit: "requests/day",
      meta: `${freeModels.length} models`,
      icon: tierMeta.free.icon,
      cardClass: tierMeta.free.softCardClass,
      iconWrapClass: iconBgClasses[tierMeta.free.iconBg],
      iconClass: tierMeta.free.accentClass,
    },
    {
      key: "lite",
      title: tierMeta.lite.label,
      value: tierRequestsPerDay.lite,
      unit: "requests/day",
      meta: `${liteModels.length} models`,
      icon: tierMeta.lite.icon,
      cardClass: tierMeta.lite.softCardClass,
      iconWrapClass: iconBgClasses[tierMeta.lite.iconBg],
      iconClass: tierMeta.lite.accentClass,
    },
    {
      key: "premium",
      title: tierMeta.premium.label,
      value: tierRequestsPerDay.premium,
      unit: "requests/day",
      meta: `${premiumModels.length} models`,
      icon: tierMeta.premium.icon,
      cardClass: tierMeta.premium.softCardClass,
      iconWrapClass: iconBgClasses[tierMeta.premium.iconBg],
      iconClass: tierMeta.premium.accentClass,
    },
    {
      key: "max",
      title: tierMeta.max.label,
      value: tierRequestsPerDay.max,
      unit: "requests/day",
      meta: `${maxModels.length} models`,
      icon: tierMeta.max.icon,
      cardClass: tierMeta.max.softCardClass,
      iconWrapClass: iconBgClasses[tierMeta.max.iconBg],
      iconClass: tierMeta.max.accentClass,
    },
    {
      key: "all",
      title: "All Models",
      value: allModels.length,
      unit: "total models",
      meta: "route/ prefix",
      icon: Layers3,
      cardClass:
        "border-zinc-200 bg-gradient-to-br from-zinc-100/80 via-white to-white dark:border-zinc-800 dark:from-zinc-900 dark:via-[#181818] dark:to-[#181818]",
      iconWrapClass:
        "bg-zinc-900/5 text-zinc-700 dark:bg-white/10 dark:text-zinc-200",
      iconClass: "text-zinc-700 dark:text-zinc-200",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Models</h2>
          <p className="text-muted-foreground">
            All models use{" "}
            <code className="rounded bg-muted px-1 text-xs">route/</code> prefix
            in API calls
          </p>
        </div>
        <Tabs
          onValueChange={(v) => setViewMode(v as "grid" | "list")}
          value={viewMode}
        >
          <TabsList>
            <TabsTrigger value="grid">Grid</TabsTrigger>
            <TabsTrigger value="list">List</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        {tierSummaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <Card
              className={`rounded-2xl shadow-none ${card.cardClass}`}
              key={card.key}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      {card.title}
                    </p>
                    <div className="text-3xl font-semibold tracking-[-0.03em] text-foreground">
                      {card.value}
                    </div>
                    <p className="text-xs text-muted-foreground">{card.unit}</p>
                  </div>
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${card.iconWrapClass}`}
                  >
                    <Icon className={`h-5 w-5 ${card.iconClass}`} />
                  </div>
                </div>
                <div className="mt-4 border-t border-black/5 pt-3 text-xs text-muted-foreground dark:border-white/10">
                  {card.meta}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs
        onValueChange={(v) => setActiveTab(v as typeof activeTab)}
        value={activeTab}
      >
        <TabsList className="grid w-fit grid-cols-5">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="free">Free</TabsTrigger>
          <TabsTrigger value="lite">Lite</TabsTrigger>
          <TabsTrigger value="premium">Premium</TabsTrigger>
          <TabsTrigger value="max">Max</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-8">
        {(activeTab === "all" || activeTab === "free") && (
          <ModelSection
            description="Available to all users"
            models={freeModels}
            tier="free"
            title="Free Models"
            viewMode={viewMode}
          />
        )}
        {(activeTab === "all" || activeTab === "lite") && (
          <ModelSection
            description="Additional models for Lite plan users"
            models={liteModels}
            tier="lite"
            title="Lite Models"
            viewMode={viewMode}
          />
        )}
        {(activeTab === "all" || activeTab === "premium") && (
          <ModelSection
            description="Additional models for Premium plan users"
            models={premiumModels}
            tier="premium"
            title="Premium Models"
            viewMode={viewMode}
          />
        )}
        {(activeTab === "all" || activeTab === "max") && (
          <ModelSection
            description="Extra models for Max plan users"
            models={maxModels}
            tier="max"
            title="Max Models"
            viewMode={viewMode}
          />
        )}
      </div>

      <Card className="rounded-xl border-zinc-200 bg-white shadow-none dark:border-zinc-800 dark:bg-[#181818]">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-brand-purple/20 p-3">
              <Coins className="h-6 w-6 text-brand-purple" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Plan-Based Access</h3>
              <p className="text-muted-foreground">
                Your plan determines which models you can access. Free tier gets
                50 requests/day, Lite gets 400/day, Premium gets 1,000/day, and
                Max gets 2,500/day. Upgrade anytime to unlock more models and
                higher limits.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
