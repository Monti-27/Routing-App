"use client";

import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowUpRight,
  Building2,
  Check,
  ChevronUp,
  Copy,
  Fingerprint,
  Layers,
  Search,
  Server,
  Tag,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import type { MouseEvent, ReactNode } from "react";
import { useState } from "react";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  dashboardModels as allModels,
  type DashboardModel,
  type PlanTier,
} from "@/lib/dashboard-model-catalog";

const providerLabels: Record<string, string> = {
  chutes: "Chutes",
  deepseek: "DeepSeek",
  google: "Google",
  kimi: "Kimi",
  minimax: "MiniMax",
  opencode: "OpenCode",
  qwen: "Qwen",
  xiaomi: "Xiaomi",
  zai: "ZAI",
};

const springConfig = { type: "spring", stiffness: 300, damping: 30 } as const;

function DataRow({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-0.5">
      <div className="flex shrink-0 items-center gap-3 text-muted-foreground/60">
        {icon}
        <span className="text-[13px] font-medium whitespace-nowrap text-muted-foreground">
          {label}
        </span>
      </div>
      <div className="flex min-w-0 flex-1 justify-end">{children}</div>
    </div>
  );
}

function CardContent({ model, onCopy, isCopied }: { model: DashboardModel; onCopy: (e: MouseEvent) => void; isCopied: boolean }) {
  const host = providerLabels[model.provider] ?? model.provider;
  return (
    <div className="space-y-4 p-5">
      <DataRow icon={<Fingerprint size={16} />} label="Model ID">
        <button
          className="flex items-center gap-1.5 truncate rounded-full border-[1.5px] border-border px-2 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:bg-accent sm:text-[12px]"
          onClick={onCopy}
          title="Copy to clipboard"
          type="button"
        >
          {isCopied ? (
            <Check className="shrink-0 text-emerald-500" size={12} />
          ) : (
            <Copy className="shrink-0" size={12} />
          )}
          <span className="truncate">{model.id}</span>
        </button>
      </DataRow>

      <DataRow icon={<Server size={16} />} label="Host">
        <span className="text-[14px] font-semibold text-foreground/80">{host}</span>
      </DataRow>

      <DataRow icon={<Layers size={16} />} label="Context">
        <div className="flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[12px] font-bold text-emerald-600 dark:text-emerald-400">
          {model.context_length} <ArrowUpRight size={14} strokeWidth={2} />
        </div>
      </DataRow>

      <DataRow icon={<Building2 size={16} />} label="Provider">
        <span className="ml-2 truncate text-right text-[14px] font-semibold text-foreground/80">
          {host}
        </span>
      </DataRow>

      <DataRow icon={<Tag size={16} />} label="Tiers">
        <div className="flex flex-wrap justify-end gap-2">
          {model.tiers.map((tier) => (
            <span
              className="rounded-full border border-purple-500/20 bg-purple-500/10 px-2.5 py-0.5 text-[11px] font-bold whitespace-nowrap text-purple-600 dark:text-purple-400 uppercase tracking-wider"
              key={tier}
            >
              {tier}
            </span>
          ))}
        </div>
      </DataRow>

      {model.request_multiplier ? (
        <DataRow icon={<Tag size={16} />} label="Requests">
          <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[12px] font-bold text-amber-600 dark:text-amber-400">
            {model.request_multiplier}x multiplier
          </span>
        </DataRow>
      ) : null}

      <DataRow icon={<ArrowDownToLine size={16} />} label="Input Price">
        <span className="text-[14px] font-semibold text-foreground/80">
          ${model.input_price.toFixed(3)} / M
        </span>
      </DataRow>

      <DataRow icon={<ArrowUpFromLine size={16} />} label="Output Price">
        <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[12px] font-bold text-emerald-600 dark:text-emerald-400">
          ${model.output_price.toFixed(3)} / M
        </span>
      </DataRow>
    </div>
  );
}

function ModelCard({ model }: { model: DashboardModel }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async (e: MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(model.id);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      /* noop */
    }
  };

  return (
    <motion.div
      className="w-full overflow-hidden rounded-xl border border-border bg-accent/50 shadow-sm"
    >
        <button
          aria-expanded={isExpanded}
          className="flex w-full cursor-pointer items-center justify-between bg-accent/50 p-3.5 pr-4 text-left transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
          type="button"
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-background shadow-sm overflow-hidden border border-border/50">
              {!imgError && model.logo ? (
                <Image
                  alt={model.name}
                  className="object-contain p-1"
                  height={40}
                  onError={() => setImgError(true)}
                  src={model.logo}
                  width={40}
                />
              ) : (
                <span className="text-lg font-bold text-muted-foreground">
                  {model.name.charAt(0)}
                </span>
              )}
            </div>
            <span className="truncate text-[15px] font-semibold text-foreground">
              {model.name}
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-2.5">
            <motion.div
              animate={{ rotate: isExpanded ? 0 : 180 }}
              className="flex h-9 w-9 min-w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-accent/50 text-muted-foreground transition-colors duration-200 hover:text-foreground"
            >
              <ChevronUp size={22} />
            </motion.div>
          </div>
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              animate={{ height: "auto", opacity: 1 }}
              className="border-t border-border bg-background"
              exit={{ height: 0, opacity: 0 }}
              initial={{ height: 0, opacity: 0 }}
              transition={springConfig}
            >
              <CardContent model={model} onCopy={handleCopy} isCopied={isCopied} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
  );
}

export function ModelsCardView() {
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
          Connect to {allModels.length} AI models through a single, unified endpoint.
          We handle provider failover automatically.
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Qwen 3.5 Plus, Qwen 3.6 Plus, and MiMo models use a 2x request multiplier.
          Kimi K2.6 Precision uses INT4 quantization and a 2x request multiplier.
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

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 items-start">
        {filtered.length > 0 ? (
          filtered.map((model) => <ModelCard key={model.id} model={model} />)
        ) : (
          <div className="col-span-full px-4 py-12 text-center text-sm text-muted-foreground">
            No models found.
          </div>
        )}
      </div>
    </div>
  );
}
