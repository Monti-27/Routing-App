"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { dashboardModels } from "@/lib/dashboard-model-catalog";
import { CopyButton } from "./CopyButton";

type NodeId = string;
type NodeState = "pending" | "processing" | "complete";

type ModelNodeMeta = {
  contextLength: string;
  inputPrice: number;
  logo: string;
  modelId: string;
  outputPrice: number;
  providerLabel: string;
  requestMultiplier?: number;
};

type GraphNode = {
  copyText?: string;
  id: NodeId;
  isProvider?: boolean;
  label: string;
  level?: number;
  meta?: ModelNodeMeta;
  x: number;
  y: number;
};

type GraphEdge = {
  from: NodeId;
  to: NodeId;
  level: number;
  path: string;
};

type ProviderId =
  | "minimax"
  | "kimi"
  | "zai"
  | "qwen"
  | "deepseek"
  | "mimo"
  | "google";

const ROOT_ID = "routing-run";
const GRAPH_HEIGHT = 580;
const NODE_WIDTH = 112;
const NODE_HEIGHT = 34;
const INITIAL_DELAY_MS = 80;
const PROCESS_DELAY_MS = 150;
const ROOT_ROW_Y = 40;
const PROVIDER_ROW_Y = 200;
const MODEL_ROW_BASE_Y = 360;
const MODEL_ROW_STAGGER = 18;

const providerConfigs: Array<{ id: ProviderId; label: string }> = [
  { id: "minimax", label: "MiniMax" },
  { id: "kimi", label: "Kimi" },
  { id: "zai", label: "Z.ai" },
  { id: "qwen", label: "Qwen" },
  { id: "deepseek", label: "DeepSeek" },
  { id: "mimo", label: "MiMo" },
  { id: "google", label: "Google" },
];

const getProviderId = (provider: string): ProviderId => {
  switch (provider) {
    case "chutes":
    case "deepseek":
      return "deepseek";
    case "opencode":
      return "mimo";
    case "google":
    case "kimi":
    case "minimax":
    case "qwen":
    case "zai":
      return provider;
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
};

const providerTree = providerConfigs
  .map((provider) => ({
    id: provider.id,
    label: provider.label,
    models: dashboardModels
      .filter((model) => getProviderId(model.provider) === provider.id)
      .map((model) => ({
        contextLength: model.context_length,
        inputPrice: model.input_price,
        label: model.name,
        logo: model.logo ?? "",
        modelId: model.id,
        outputPrice: model.output_price,
        requestMultiplier: model.request_multiplier,
      })),
  }))
  .filter((provider) => provider.models.length > 0);

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function buildGraph(activeProvider: ProviderId | null) {
  const providerSpacing = 160;
  const providerStartX = 40;
  const horizontalPadding = 24;
  const graphWidth = Math.max(
    920,
    providerStartX * 2 +
      providerSpacing * (providerTree.length - 1) +
      NODE_WIDTH,
  );
  const rootX = Math.round(graphWidth / 2 - NODE_WIDTH / 2);

  const providerNodes = providerTree.map((provider, index) => ({
    id: provider.id,
    isProvider: true,
    label: provider.label,
    level: 1,
    x: providerStartX + index * providerSpacing,
    y: PROVIDER_ROW_Y,
  }));

  const graphEdges: GraphEdge[] = [];
  const modelNodes: GraphNode[] = [];

  for (const providerNode of providerNodes) {
    const provider = providerTree.find((item) => item.id === providerNode.id);
    if (!provider) continue;

    const modelSpacing = 146;
    const providerCenterX = providerNode.x + NODE_WIDTH / 2;
    const groupWidth =
      provider.models.length * NODE_WIDTH +
      (provider.models.length - 1) * (modelSpacing - NODE_WIDTH);
    const centeredStartX = Math.round(providerCenterX - groupWidth / 2);
    const minStartX = horizontalPadding;
    const maxStartX = graphWidth - horizontalPadding - groupWidth;
    const groupStartX = Math.max(minStartX, Math.min(centeredStartX, maxStartX));

    graphEdges.push({
      from: ROOT_ID,
      level: 1,
      to: provider.id,
      path: `M ${rootX + NODE_WIDTH / 2} ${ROOT_ROW_Y + NODE_HEIGHT + 8} C ${rootX + NODE_WIDTH / 2} ${PROVIDER_ROW_Y - 40}, ${providerCenterX} ${PROVIDER_ROW_Y - 40}, ${providerCenterX} ${PROVIDER_ROW_Y}`,
    });

    if (provider.id !== activeProvider) continue;

    for (const [index, model] of provider.models.entries()) {
      const x = groupStartX + index * modelSpacing;
      const id = slugify(`${provider.id}-${model.label}`);
      const y = MODEL_ROW_BASE_Y + index * MODEL_ROW_STAGGER;

      modelNodes.push({
        copyText: model.modelId,
        id,
        label: model.label,
        meta: {
          contextLength: model.contextLength,
          inputPrice: model.inputPrice,
          logo: model.logo,
          modelId: model.modelId,
          outputPrice: model.outputPrice,
          providerLabel: provider.label,
          requestMultiplier: model.requestMultiplier,
        },
        level: 2,
        x,
        y,
      });

      graphEdges.push({
        from: provider.id,
        level: 2,
        to: id,
        path: `M ${providerCenterX} ${PROVIDER_ROW_Y + NODE_HEIGHT + 4} C ${providerCenterX} ${y - 30}, ${x + NODE_WIDTH / 2} ${y - 30}, ${x + NODE_WIDTH / 2} ${y}`,
      });
    }
  }

  const graphNodes: GraphNode[] = [
    { id: ROOT_ID, label: "routing.run", level: 0, x: rootX, y: ROOT_ROW_Y },
    ...providerNodes,
    ...modelNodes,
  ];

  const maxStage = activeProvider ? 2 : 1;
  return { graphEdges, graphNodes, graphWidth, maxStage };
}

function getProviderById(providerId: ProviderId | null) {
  if (!providerId) return null;
  return providerTree.find((provider) => provider.id === providerId) ?? null;
}

const getNodeState = (level: number, step: number): NodeState => {
  if (step > level) return "complete";
  if (step === level) return "processing";
  return "pending";
};

const ACCENT = "var(--brand-purple, #453c7c)";

export default function ComponentOrderingGraph() {
  const [step, setStep] = useState(0);
  const [activeProvider, setActiveProvider] = useState<ProviderId | null>(null);
  const [useCompactMode, setUseCompactMode] = useState(false);
  const [scale, setScale] = useState(1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const { graphEdges, graphNodes, graphWidth, maxStage } = useMemo(
    () => buildGraph(activeProvider),
    [activeProvider],
  );

  useEffect(() => {
    const update = () => setUseCompactMode(window.innerWidth < 1024);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    if (!wrapperRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const w = entries[0].contentRect.width;
      if (w > 0 && graphWidth > 0) {
        setScale(Math.min(1.15, (w - 8) / graphWidth));
      }
    });
    observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, [graphWidth]);

  useEffect(() => {
    if (step >= maxStage) return;
    const id = setTimeout(
      () => setStep(step + 1),
      step === 0 ? INITIAL_DELAY_MS : PROCESS_DELAY_MS,
    );
    return () => clearTimeout(id);
  }, [maxStage, step]);

  const nodeStates = useMemo(
    () => new Map(graphNodes.map((n) => [n.id, getNodeState(n.level ?? 0, step)])),
    [graphNodes, step],
  );
  const activeProviderData = getProviderById(activeProvider);

  const nodeClasses = (state: NodeState, isActive: boolean) => {
    if (isActive || state === "complete")
      return "border-brand-purple/40 bg-brand-purple/8 text-brand-purple dark:border-brand-purple/50 dark:bg-brand-purple/12 dark:text-[#C9BFE8]";
    if (state === "processing")
      return "border-border bg-accent text-foreground";
    return "border-border/60 bg-background text-muted-foreground";
  };

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes tree-dash-flow {
          from { stroke-dashoffset: 0; }
          to { stroke-dashoffset: -24; }
        }
        .animate-tree-dash-flow {
          animation: tree-dash-flow 1.4s linear infinite;
        }
      `,
        }}
      />

      {/* Compact / mobile layout */}
      <div className={useCompactMode ? "space-y-3" : "hidden"}>
        <div className="mx-auto w-fit rounded-lg border border-brand-purple/30 bg-brand-purple/8 px-4 py-2 text-sm font-medium text-brand-purple">
          routing.run
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {providerTree.map((provider) => {
            const isActive = activeProvider === provider.id;
            return (
              <button
                key={provider.id}
                type="button"
                onClick={() => {
                  setActiveProvider((c) => {
                    const next = c === provider.id ? null : provider.id;
                    setStep(next ? 1 : 0);
                    return next;
                  });
                }}
                className={[
                  "rounded-lg border px-3 py-2 text-sm font-medium transition-all",
                  isActive
                    ? "border-brand-purple/30 bg-brand-purple/8 text-brand-purple"
                    : "border-border bg-background text-muted-foreground hover:bg-accent",
                ].join(" ")}
              >
                {provider.label}
              </button>
            );
          })}
        </div>

        {activeProviderData ? (
          <div className="grid gap-3 pt-1">
            {activeProviderData.models.map((model) => (
              <div
                key={model.modelId}
                className="rounded-xl border border-border bg-background p-3"
              >
                <div className="flex items-start gap-3">
                  <div className="relative size-10 shrink-0 overflow-hidden rounded-lg border border-border/50 bg-background">
                    <Image
                      src={model.logo}
                      alt={model.label}
                      fill
                      sizes="40px"
                      className="object-contain p-1.5"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{model.label}</p>
                    {model.requestMultiplier ? (
                      <p className="text-[10px] font-medium text-brand-coral">
                        {model.requestMultiplier}x requests
                      </p>
                    ) : null}
                    <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                      <span>In: ${model.inputPrice.toFixed(2)}/1M</span>
                      <span>Out: ${model.outputPrice.toFixed(2)}/1M</span>
                      <span>Ctx: {model.contextLength}</span>
                    </div>
                    <code className="mt-1 block truncate text-[10px] text-muted-foreground">
                      {model.modelId}
                    </code>
                  </div>
                  <CopyButton text={model.modelId} />
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {/* Desktop graph */}
      <div
        ref={wrapperRef}
        className={useCompactMode ? "hidden" : "relative flex w-full justify-center"}
      >
        <div
          className="relative"
          style={{
            width: `${graphWidth * scale}px`,
            height: `${GRAPH_HEIGHT * scale}px`,
          }}
        >
          <div
            className="absolute left-0 top-0 origin-top-left"
            style={{
              height: `${GRAPH_HEIGHT}px`,
              width: `${graphWidth}px`,
              transform: `scale(${scale})`,
            }}
          >
            {/* SVG edges */}
            <svg
              aria-hidden="true"
              className="absolute inset-0 h-full w-full overflow-visible"
              viewBox={`0 0 ${graphWidth} ${GRAPH_HEIGHT}`}
            >
              {graphEdges.map((edge) => {
                const isActive = step >= edge.level;
                return (
                  <g key={`${edge.from}-${edge.to}`}>
                    <path
                      d={edge.path}
                      fill="none"
                      className="stroke-border/60 dark:stroke-border/40"
                      strokeLinecap="round"
                      strokeWidth="1.5"
                    />
                    <path
                      d={edge.path}
                      fill="none"
                      stroke={ACCENT}
                      strokeOpacity="0.15"
                      strokeLinecap="round"
                      strokeWidth="1.5"
                      style={{
                        opacity: isActive ? 1 : 0,
                        transition: "opacity 300ms ease",
                      }}
                    />
                    <path
                      d={edge.path}
                      fill="none"
                      stroke={ACCENT}
                      strokeOpacity="0.5"
                      strokeLinecap="round"
                      strokeWidth="1.5"
                      strokeDasharray="5 5"
                      className={isActive ? "animate-tree-dash-flow" : ""}
                      style={{
                        opacity: isActive ? 1 : 0,
                        transition: "opacity 300ms ease",
                      }}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Nodes */}
            {graphNodes.map((node) => {
              const state = nodeStates.get(node.id) ?? "pending";
              const isProvider = node.isProvider ?? false;
              const isActiveProvider = activeProvider === node.id;
              const isRoot = node.id === ROOT_ID;
              const isVisible = state === "processing" || state === "complete";

              const classes = nodeClasses(
                state,
                isRoot ? state === "complete" : isActiveProvider,
              );

              const nodeStyle = {
                opacity: isVisible ? 1 : 0.4,
                transform: isVisible
                  ? "translateY(0) scale(1)"
                  : "translateY(-6px) scale(0.97)",
              };

              return (
                <div
                  key={node.id}
                  className="absolute"
                  style={{
                    left: `${node.x}px`,
                    top: `${node.y}px`,
                    height: `${NODE_HEIGHT}px`,
                    width: `${NODE_WIDTH}px`,
                  }}
                >
                  {isProvider ? (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveProvider((c) => {
                          const next = c === node.id ? null : (node.id as ProviderId);
                          setStep(next ? 1 : 0);
                          return next;
                        });
                      }}
                      className={[
                        "absolute inset-0 flex cursor-pointer items-center justify-center rounded-lg border px-2 text-[0.78rem] font-medium transition-all duration-500 ease-out",
                        classes,
                      ].join(" ")}
                      style={nodeStyle}
                    >
                      <span className="line-clamp-1 text-[0.72rem]">
                        {node.label}
                      </span>
                    </button>
                  ) : (
                    <HoverCard closeDelay={75} openDelay={0}>
                      <HoverCardTrigger asChild>
                        <div
                          className={[
                            "absolute inset-0 flex items-center justify-center rounded-lg border px-2 text-[0.78rem] font-medium transition-all duration-500 ease-out",
                            node.copyText ? "pr-8" : "",
                            classes,
                          ].join(" ")}
                          style={nodeStyle}
                        >
                          <span className="line-clamp-1 text-[0.72rem]">
                            {node.label}
                          </span>
                          {node.copyText ? (
                            <div className="absolute right-1 top-1/2 -translate-y-1/2">
                              <CopyButton text={node.copyText} />
                            </div>
                          ) : null}
                        </div>
                      </HoverCardTrigger>
                      {node.meta ? (
                        <HoverCardContent
                          align="start"
                          className="w-72 p-4"
                          side="top"
                        >
                          <div className="flex items-start gap-3">
                            <div className="relative size-10 shrink-0 overflow-hidden rounded-lg border border-border/50 bg-background">
                              <Image
                                src={node.meta.logo}
                                alt={node.label}
                                fill
                                sizes="40px"
                                className="object-contain p-1.5"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold">{node.label}</p>
                              <p className="text-xs text-muted-foreground">
                                {node.meta.providerLabel}
                              </p>
                              {node.meta.requestMultiplier ? (
                                <p className="text-[10px] font-medium text-brand-coral">
                                  {node.meta.requestMultiplier}x requests
                                </p>
                              ) : null}
                            </div>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span>In: ${node.meta.inputPrice.toFixed(2)}/1M</span>
                            <span>Out: ${node.meta.outputPrice.toFixed(2)}/1M</span>
                            <span>Ctx: {node.meta.contextLength}</span>
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <code className="truncate text-[10px] text-muted-foreground">
                              {node.meta.modelId}
                            </code>
                            <CopyButton text={node.meta.modelId} />
                          </div>
                        </HoverCardContent>
                      ) : null}
                    </HoverCard>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
