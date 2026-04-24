"use client";

import Image from "next/image";
import { useState } from "react";
import { Check, Copy, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  dashboardModels as allModels,
  type DashboardModel as Model,
  type PlanTier,
} from "@/lib/dashboard-model-catalog";

const tierLabel: Record<PlanTier, string> = {
  free: "Free",
  lite: "Lite",
  premium: "Premium",
  max: "Max",
};

const tierBadgeVariant: Record<PlanTier, "amber" | "blue" | "destructive" | "default"> = {
  free: "amber",
  lite: "blue",
  premium: "destructive",
  max: "default",
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-mono text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      onClick={handleCopy}
      type="button"
    >
      {copied ? (
        <Check className="size-3 text-emerald-500" />
      ) : (
        <Copy className="size-3" />
      )}
      <span className="max-w-[140px] truncate">{text}</span>
    </button>
  );
}

function ModelLogo({ name, logo }: { name: string; logo?: string }) {
  if (logo) {
    return (
      <div className="relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/50 bg-background">
        <Image
          alt={name}
          className="object-contain p-1.5"
          fill
          sizes="32px"
          src={logo}
        />
      </div>
    );
  }
  return (
    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-[11px] font-semibold text-muted-foreground">
      {name.substring(0, 2).toUpperCase()}
    </div>
  );
}

function ModelRow({ model }: { model: Model }) {
  return (
    <div className="group flex items-center gap-4 border-b border-border/50 px-4 py-3 transition-colors last:border-b-0 hover:bg-accent/40">
      <ModelLogo logo={model.logo} name={model.name} />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{model.name}</span>
          {model.request_multiplier ? (
            <Badge className="text-[10px]" variant="destructive">
              {model.request_multiplier}x
            </Badge>
          ) : null}
        </div>
        <p className="text-xs text-muted-foreground">{model.provider}</p>
      </div>

      <div className="hidden items-center gap-1 sm:flex">
        {model.tiers.map((tier) => (
          <Badge
            className="text-[10px]"
            key={tier}
            variant={tierBadgeVariant[tier]}
          >
            {tierLabel[tier]}
          </Badge>
        ))}
      </div>

      <div className="hidden w-16 text-right text-xs text-muted-foreground md:block">
        {model.context_length}
      </div>

      <div className="hidden w-28 text-right text-xs md:block">
        <span className="text-muted-foreground">$</span>
        <span>{model.input_price.toFixed(2)}</span>
        <span className="text-muted-foreground"> / </span>
        <span className="text-muted-foreground">$</span>
        <span>{model.output_price.toFixed(2)}</span>
      </div>

      <div className="shrink-0">
        <CopyButton text={model.id} />
      </div>
    </div>
  );
}

export function LegacyModelsView() {
  const [activeTab, setActiveTab] = useState<"all" | PlanTier>("all");
  const [search, setSearch] = useState("");

  const filtered = allModels.filter((m) => {
    const matchesTier = activeTab === "all" || m.tiers.includes(activeTab as PlanTier);
    const matchesSearch =
      !search ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.provider.toLowerCase().includes(search.toLowerCase()) ||
      m.id.toLowerCase().includes(search.toLowerCase());
    return matchesTier && matchesSearch;
  });

  const tierCounts = {
    all: allModels.length,
    free: allModels.filter((m) => m.tiers.includes("free")).length,
    lite: allModels.filter((m) => m.tiers.includes("lite")).length,
    premium: allModels.filter((m) => m.tiers.includes("premium")).length,
    max: allModels.filter((m) => m.tiers.includes("max")).length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Models</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {allModels.length} models available, including Kimi and GLM. Use the{" "}
          <code className="rounded bg-accent px-1.5 py-0.5 text-[11px]">route/</code>{" "}
          prefix in API calls.
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="overflow-x-auto -mx-1 px-1">
          <Tabs
            onValueChange={(v) => setActiveTab(v as typeof activeTab)}
            value={activeTab}
          >
            <TabsList>
              <TabsTrigger value="all">All ({tierCounts.all})</TabsTrigger>
              <TabsTrigger value="free">Free ({tierCounts.free})</TabsTrigger>
              <TabsTrigger value="lite">Lite ({tierCounts.lite})</TabsTrigger>
              <TabsTrigger value="premium">Pro ({tierCounts.premium})</TabsTrigger>
              <TabsTrigger value="max">Max ({tierCounts.max})</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            className="h-8 w-full rounded-md border border-border bg-background pl-8 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring sm:w-56"
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search models..."
            type="text"
            value={search}
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-background">
        <div className="hidden items-center gap-4 border-b border-border bg-accent/30 px-4 py-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground sm:flex">
          <div className="size-8 shrink-0" />
          <div className="flex-1">Model</div>
          <div>Tiers</div>
          <div className="hidden w-16 text-right md:block">Context</div>
          <div className="hidden w-28 text-right md:block">Price /1M tok</div>
          <div className="w-[120px] shrink-0 text-right">ID</div>
        </div>

        {filtered.length > 0 ? (
          filtered.map((model) => <ModelRow key={model.id} model={model} />)
        ) : (
          <div className="px-4 py-12 text-center text-sm text-muted-foreground">
            No models found.
          </div>
        )}
      </div>
    </div>
  );
}
