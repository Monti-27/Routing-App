"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
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

type ProviderId = (typeof providerTree)[number]["id"];

const ROOT_ID = "routing-run";
const GRAPH_HEIGHT = 620;
const NODE_WIDTH = 112;
const NODE_HEIGHT = 34;
const NODE_HALO_INSET = 0;
const INITIAL_DELAY_MS = 80;
const PROCESS_DELAY_MS = 150;
const ROOT_ROW_Y = 28;
const PROVIDER_ROW_Y = 212;
const MODEL_ROW_BASE_Y = 380;
const MODEL_ROW_STAGGER = 20;

const providerTree = [
  {
    id: "minimax",
    label: "MiniMax",
    models: [
      {
        contextLength: "100K",
        inputPrice: 0.33,
        label: "MiniMax M2.7 Highspeed",
        logo: "/model-logos/route-minimax.png",
        modelId: "route/minimax-m2.7-highspeed",
        outputPrice: 1.32,
      },
      {
        contextLength: "100K",
        inputPrice: 0.33,
        label: "MiniMax M2.7",
        logo: "/model-logos/route-minimax.png",
        modelId: "route/minimax-m2.7",
        outputPrice: 1.32,
      },
      {
        contextLength: "100K",
        inputPrice: 0.193,
        label: "MiniMax M2.5 Highspeed",
        logo: "/model-logos/route-minimax.png",
        modelId: "route/minimax-m2.5-highspeed",
        outputPrice: 1.238,
      },
      {
        contextLength: "100K",
        inputPrice: 0.193,
        label: "MiniMax M2.5",
        logo: "/model-logos/route-minimax.png",
        modelId: "route/minimax-m2.5",
        outputPrice: 1.238,
      },
    ],
  },
  {
    id: "kimi",
    label: "Kimi",
    models: [
      {
        contextLength: "131K",
        inputPrice: 0.6468,
        label: "Kimi K2.5 Highspeed",
        logo: "/model-logos/route-kimi.png",
        modelId: "route/kimi-k2.5-highspeed",
        outputPrice: 3.388,
      },
      {
        contextLength: "262K",
        inputPrice: 0.462,
        label: "Kimi K2.5",
        logo: "/model-logos/route-kimi.png",
        modelId: "route/kimi-k2.5",
        outputPrice: 2.42,
      },
    ],
  },
  {
    id: "zai",
    label: "Z.ai",
    models: [
      {
        contextLength: "200K",
        inputPrice: 1.1088,
        label: "GLM-5 Highspeed",
        logo: "/model-logos/route-zai.svg",
        modelId: "route/glm-5-highspeed",
        outputPrice: 3.542,
      },
      {
        contextLength: "203K",
        inputPrice: 1.2,
        label: "GLM-5.1 Precision",
        logo: "/model-logos/route-zai.svg",
        modelId: "route/glm-5.1-precision",
        outputPrice: 3.5,
      },
      {
        contextLength: "128K",
        inputPrice: 1,
        label: "GLM-5.1",
        logo: "/model-logos/route-zai.svg",
        modelId: "route/glm-5.1",
        outputPrice: 3,
      },
      {
        contextLength: "80K",
        inputPrice: 0.792,
        label: "GLM-5",
        logo: "/model-logos/route-zai.svg",
        modelId: "route/glm-5",
        outputPrice: 2.53,
      },
      {
        contextLength: "200K",
        inputPrice: 1.32,
        label: "GLM-4.7 Flash",
        logo: "/model-logos/route-zai.svg",
        modelId: "route/glm-4.7-flash",
        outputPrice: 4.4,
      },
      {
        contextLength: "200K",
        inputPrice: 1.32,
        label: "GLM-4.7",
        logo: "/model-logos/route-zai.svg",
        modelId: "route/glm-4.7",
        outputPrice: 4.4,
      },
    ],
  },
  {
    id: "qwen",
    label: "Qwen",
    models: [
      {
        contextLength: "262K",
        inputPrice: 1.1,
        label: "Qwen3.5 397B A17B",
        logo: "/model-logos/route-qwen.png",
        modelId: "route/qwen3.5-397b-a17b",
        outputPrice: 3.3,
      },
      {
        contextLength: "131K",
        inputPrice: 0.55,
        label: "Qwen3.5 Plus",
        logo: "/model-logos/route-qwen.png",
        modelId: "route/qwen3.5-plus",
        outputPrice: 1.65,
      },
      {
        contextLength: "131K",
        inputPrice: 0.6,
        label: "Qwen3.6 Plus",
        logo: "/model-logos/route-qwen.png",
        modelId: "route/qwen3.6-plus",
        outputPrice: 1.8,
      },
      {
        contextLength: "1000K",
        inputPrice: 0.2,
        label: "Qwen3.5 9B",
        logo: "/model-logos/route-qwen.png",
        modelId: "route/qwen3.5-9b",
        outputPrice: 0.6,
      },
    ],
  },
  {
    id: "deepseek",
    label: "DeepSeek",
    models: [
      {
        contextLength: "163K",
        inputPrice: 0.495,
        label: "DeepSeek R1",
        logo: "/model-logos/route-deepseek.png",
        modelId: "route/deepseek-r1",
        outputPrice: 2.365,
      },
      {
        contextLength: "164K",
        inputPrice: 0.55,
        label: "DeepSeek V3.2 Speciale",
        logo: "/model-logos/route-deepseek.png",
        modelId: "route/deepseek-v3.2-speciale",
        outputPrice: 0.82,
      },
      {
        contextLength: "164K",
        inputPrice: 0.4928,
        label: "DeepSeek V3.2",
        logo: "/model-logos/route-deepseek.png",
        modelId: "route/deepseek-v3.2",
        outputPrice: 0.7392,
      },
    ],
  },
  {
    id: "mimo",
    label: "MiMo",
    models: [
      {
        contextLength: "256K",
        inputPrice: 0.55,
        label: "MiMo V2 Omni",
        logo: "/model-logos/route-xiaomi.png",
        modelId: "route/mimo-v2-omni",
        outputPrice: 1.65,
      },
      {
        contextLength: "256K",
        inputPrice: 0.45,
        label: "MiMo V2 Pro",
        logo: "/model-logos/route-xiaomi.png",
        modelId: "route/mimo-v2-pro",
        outputPrice: 1.35,
      },
    ],
  },
] as const;

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function buildGraph(activeProvider: ProviderId | null) {
  const providerSpacing = 160;
  const providerStartX = 40;
  const horizontalPadding = 24;
  const graphWidth = Math.max(
    920,
    providerStartX * 2 + providerSpacing * (providerTree.length - 1) + NODE_WIDTH,
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

    if (!provider) {
      continue;
    }

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
      path: `M ${rootX + NODE_WIDTH / 2} 70 C ${rootX + NODE_WIDTH / 2} 132, ${providerCenterX} 132, ${providerCenterX} ${PROVIDER_ROW_Y}`,
    });

    if (provider.id !== activeProvider) {
      continue;
    }

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
        },
        level: 2,
        x,
        y,
      });

      graphEdges.push({
        from: provider.id,
        level: 2,
        to: id,
        path: `M ${providerCenterX} 216 C ${providerCenterX} 292, ${x + NODE_WIDTH / 2} 300, ${x + NODE_WIDTH / 2} ${y}`,
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
  if (!providerId) {
    return null;
  }

  return providerTree.find((provider) => provider.id === providerId) ?? null;
}

const getNodeState = (
  level: number,
  step: number,
): NodeState => {
  if (step > level) {
    return "complete";
  }

  if (step === level) {
    return "processing";
  }

  return "pending";
};

export default function ComponentOrderingGraph() {
  const [step, setStep] = useState(0);
  const [activeProvider, setActiveProvider] = useState<ProviderId | null>(null);
  const [useCompactMode, setUseCompactMode] = useState(false);
  const [useTightVerticalSpacing, setUseTightVerticalSpacing] = useState(false);
  const [scale, setScale] = useState(1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const { graphEdges, graphNodes, graphWidth, maxStage } = useMemo(
    () => buildGraph(activeProvider),
    [activeProvider],
  );

  useEffect(() => {
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const updateLayoutMode = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      setUseCompactMode(viewportWidth < 1024);
      setUseTightVerticalSpacing(viewportHeight < 860);
    };

    updateLayoutMode();
    window.addEventListener("resize", updateLayoutMode);

    return () => {
      window.removeEventListener("resize", updateLayoutMode);
    };
  }, []);

  useEffect(() => {
    if (!wrapperRef.current) return;
    
    const observer = new ResizeObserver((entries) => {
      const containerWidth = entries[0].contentRect.width;
      if (containerWidth > 0 && graphWidth > 0) {
        setScale(Math.min(1.15, (containerWidth - 8) / graphWidth));
      }
    });

    observer.observe(wrapperRef.current);
    
    return () => {
      observer.disconnect();
    };
  }, [graphWidth]);

  useEffect(() => {
    if (step >= maxStage) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setStep(step + 1);
    }, step === 0 ? INITIAL_DELAY_MS : PROCESS_DELAY_MS);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [maxStage, step]);

  const nodeStates = useMemo(() => {
    return new Map(
      graphNodes.map((node) => [node.id, getNodeState(node.level ?? 0, step)]),
    );
  }, [graphNodes, step]);
  const activeProviderData = getProviderById(activeProvider);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes tree-dash-flow {
          from { stroke-dashoffset: 0; }
          to { stroke-dashoffset: -24; }
        }
        .animate-tree-dash-flow {
          animation: tree-dash-flow 1.2s linear infinite;
        }
      `}} />
      <section
        className={[
          "component-shell component-enter flex min-h-screen w-full items-start justify-center overflow-x-auto px-8 sm:px-10",
          "overflow-hidden",
          useTightVerticalSpacing ? "py-4 sm:py-3" : "py-10 sm:py-8",
        ].join(" ")}
      >
      <div className={[
        "flex w-full flex-col items-center justify-center",
        useTightVerticalSpacing ? "gap-2" : "gap-4",
      ].join(" ")}>
        <header className="max-w-xl text-center">
          <h1 className="gradient-title text-2xl font-[520] leading-none tracking-tight sm:text-3xl">
            Models available
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
            For more info, check plans.
          </p>
        </header>

        <div className={useCompactMode ? "grid w-full max-w-3xl gap-3" : "hidden"}>
          <div className="mx-auto rounded-[8px] border border-[#79bd96] bg-[#edf8f0] px-4 py-2 text-sm font-medium text-[#3f7e5c] dark:border-[#4d8c68] dark:bg-[#13281d] dark:text-[#8fd0a8]">
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
                    setActiveProvider((current) => {
                      const nextProvider =
                        current === provider.id ? null : provider.id;
                      setStep(nextProvider ? 1 : 0);
                      return nextProvider;
                    });
                  }}
                  className={[
                    "rounded-[8px] border px-3 py-2 text-sm font-medium transition-all duration-300 ease-out",
                    isActive
                      ? "border-[#79bd96] bg-[#edf8f0] text-[#3f7e5c] dark:border-[#4d8c68] dark:bg-[#13281d] dark:text-[#8fd0a8]"
                      : "border-[#ddd6cd] bg-[#fffcf8] text-[#8d877f] dark:border-[#3f3f46] dark:bg-[#18181b] dark:text-[#9f9fa9]",
                  ].join(" ")}
                >
                  {provider.label}
                </button>
              );
            })}
          </div>

          {activeProviderData ? (
            <div className="grid gap-3 pt-2">
              {activeProviderData.models.map((model) => (
                <div
                  key={model.modelId}
                  className="rounded-[10px] border border-[#ddd6cd] bg-[#fffcf8] p-3 text-left dark:border-[#3f3f46] dark:bg-[#18181b]"
                >
                  <div className="flex items-start gap-3">
                    <div className="relative size-12 shrink-0 overflow-hidden rounded-[6px] border border-zinc-200 bg-background dark:border-zinc-800">
                      <Image
                        src={model.logo}
                        alt={model.label}
                        fill
                        sizes="48px"
                        className="object-contain p-2"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {model.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activeProviderData.label}
                      </p>
                      <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                        <p>Input: ${model.inputPrice.toFixed(4)}/1M</p>
                        <p>Output: ${model.outputPrice.toFixed(4)}/1M</p>
                        <p>Context: {model.contextLength}</p>
                        <p className="truncate font-mono">{model.modelId}</p>
                      </div>
                    </div>
                    <CopyButton text={model.modelId} />
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div
          ref={wrapperRef}
          className={
            useCompactMode
              ? "hidden"
              : "relative w-full flex justify-center px-4 min-w-0"
          }
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
                      stroke="#d9d2ca"
                      className="transition-colors dark:stroke-zinc-800/80"
                      strokeLinecap="round"
                      strokeWidth="2"
                    />
                    <path
                      d={edge.path}
                      fill="none"
                      stroke="#00d492"
                      strokeOpacity="0.2"
                      strokeLinecap="round"
                      strokeWidth="2"
                      style={{
                        opacity: isActive ? 1 : 0,
                        transition: "opacity 300ms ease",
                      }}
                    />
                    <path
                      d={edge.path}
                      fill="none"
                      stroke="#00d492"
                      strokeLinecap="round"
                      strokeWidth="2"
                      strokeDasharray="6 6"
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
            {graphNodes.map((node) => {
              const state = nodeStates.get(node.id) ?? "pending";
              const isComplete = state === "complete";
              const isProcessing = state === "processing";
              const isProvider = node.isProvider ?? false;
              const isActiveProvider = activeProvider === node.id;
              const isRootNode = node.id === ROOT_ID;

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
                  <div
                    className={[
                      "absolute rounded-[8px] transition-all duration-700 ease-out",
                      isRootNode
                        ? isComplete
                          ? "bg-[#dff3e6] shadow-[0_0_0_1px_rgba(121,189,150,0.14)] dark:bg-[#163427]"
                          : isProcessing
                            ? "bg-[#efebe5] shadow-[0_0_0_1px_rgba(17,17,17,0.03)] dark:bg-[#232323]"
                            : "bg-[#faf8f4] dark:bg-[#1c1c1c]"
                        : isProvider
                        ? isComplete
                          ? "bg-[#dff3e6] shadow-[0_0_0_1px_rgba(121,189,150,0.14)] dark:bg-[#163427]"
                          : isProcessing
                            ? "bg-[#efebe5] shadow-[0_0_0_1px_rgba(17,17,17,0.03)] dark:bg-[#232323]"
                            : "bg-[#faf8f4] dark:bg-[#1c1c1c]"
                        : isComplete
                          ? "bg-[#dff3e6] shadow-[0_0_0_1px_rgba(121,189,150,0.14)] dark:bg-[#163427]"
                          : isProcessing
                            ? "bg-[#efebe5] shadow-[0_0_0_1px_rgba(17,17,17,0.03)] dark:bg-[#232323]"
                            : "bg-[#faf8f4] dark:bg-[#1c1c1c]",
                    ].join(" ")}
                    style={{
                      inset: `${((-NODE_HALO_INSET * 100) / NODE_WIDTH).toFixed(3)}%`,
                      opacity: isProcessing || isComplete ? 1 : 0,
                    }}
                  />
                  {isProvider ? (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveProvider((current) => {
                          const nextProvider =
                            current === node.id ? null : (node.id as ProviderId);
                          setStep(nextProvider ? 1 : 0);
                          return nextProvider;
                        });
                      }}
                      className={[
                       "absolute inset-0 rounded-[8px] border px-2 text-center text-[0.78rem] font-medium tracking-[-0.02em] transition-all duration-700 ease-out",
                       "flex items-center justify-center shadow-[0_1px_0_rgba(17,17,17,0.02)]",
                       isRootNode
                          ? "border-[#79bd96] bg-[#edf8f0] text-[#3f7e5c] dark:border-[#4d8c68] dark:bg-[#13281d] dark:text-[#8fd0a8]"
                          : isActiveProvider
                            ? "border-[#79bd96] bg-[#edf8f0] text-[#3f7e5c] dark:border-[#4d8c68] dark:bg-[#13281d] dark:text-[#8fd0a8]"
                           : isComplete
                             ? "border-[#79bd96] bg-[#edf8f0] text-[#3f7e5c] dark:border-[#4d8c68] dark:bg-[#13281d] dark:text-[#8fd0a8]"
                            : isProcessing
                              ? "border-[#c9c2b8] bg-[#f2efe9] text-[#292522] dark:border-[#4b5563] dark:bg-[#27272a] dark:text-[#fafafa]"
                              : "border-[#ddd6cd] bg-[#fffcf8] text-[#8d877f] dark:border-[#3f3f46] dark:bg-[#18181b] dark:text-[#9f9fa9]",
                        isProvider ? "cursor-pointer" : "",
                      ].join(" ")}
                      style={{
                        opacity: isProcessing || isComplete ? 1 : 0.5,
                        transform:
                          isProcessing || isComplete
                            ? "translateY(0px) scale(1)"
                            : "translateY(-8px) scale(0.98)",
                      }}
                    >
                      <span className="line-clamp-2 block w-full overflow-hidden text-center text-[0.72rem] leading-tight break-words">
                        {node.label}
                      </span>
                    </button>
                  ) : (
                    <HoverCard closeDelay={75} openDelay={0}>
                      <HoverCardTrigger asChild>
                          <div
                       className={[
                             "absolute inset-0 rounded-[8px] border px-2 text-center text-[0.78rem] font-medium tracking-[-0.02em] transition-all duration-700 ease-out",
                            "flex items-center justify-center shadow-[0_1px_0_rgba(17,17,17,0.02)]",
                            node.copyText ? "pr-8" : "",
                            isRootNode
                              ? "border-[#79bd96] bg-[#edf8f0] text-[#3f7e5c] dark:border-[#4d8c68] dark:bg-[#13281d] dark:text-[#8fd0a8]"
                              : isComplete
                              ? "border-[#79bd96] bg-[#edf8f0] text-[#3f7e5c] dark:border-[#4d8c68] dark:bg-[#13281d] dark:text-[#8fd0a8]"
                              : isProcessing
                                ? "border-[#c9c2b8] bg-[#f2efe9] text-[#292522] dark:border-[#4b5563] dark:bg-[#27272a] dark:text-[#fafafa]"
                                : "border-[#ddd6cd] bg-[#fffcf8] text-[#8d877f] dark:border-[#3f3f46] dark:bg-[#18181b] dark:text-[#9f9fa9]",
                          ].join(" ")}
                          style={{
                            opacity: isProcessing || isComplete ? 1 : 0.5,
                            transform:
                              isProcessing || isComplete
                                ? "translateY(0px) scale(1)"
                                : "translateY(-8px) scale(0.98)",
                          }}
                        >
                          <span className="line-clamp-2 block w-full overflow-hidden text-center text-[0.72rem] leading-tight break-words">
                            {node.label}
                          </span>
                          {node.copyText ? (
                            <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
                              <CopyButton text={node.copyText} />
                            </div>
                          ) : null}
                        </div>
                      </HoverCardTrigger>
                      {node.meta ? (
                        <HoverCardContent
                          align="start"
                          className="w-80 rounded-none border-zinc-200 bg-background p-4 dark:border-zinc-800"
                          side="top"
                        >
                          <div className="flex flex-col items-start justify-start gap-3">
                            <div className="relative size-14 overflow-hidden border border-zinc-200 bg-background dark:border-zinc-800">
                              <Image
                                src={node.meta.logo}
                                alt={node.label}
                                fill
                                sizes="56px"
                                className="object-contain p-2"
                              />
                            </div>
                            <div className="flex flex-col">
                              <h4 className="text-base font-semibold text-foreground">
                                {node.label}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {node.meta.providerLabel}
                              </p>
                            </div>
                            <div className="space-y-1 text-sm">
                              <p>
                                Input: ${node.meta.inputPrice.toFixed(4)}/1M
                              </p>
                              <p>
                                Output: ${node.meta.outputPrice.toFixed(4)}/1M
                              </p>
                              <p>Context: {node.meta.contextLength}</p>
                              <p className="truncate text-muted-foreground">
                                {node.meta.modelId}
                              </p>
                            </div>
                            <div>
                              <CopyButton text={node.meta.modelId} />
                            </div>
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
      </div>
    </section>
    </>
  );
}
