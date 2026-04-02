"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard, GlowCard } from "@/components/ui/glass-card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Bot,
  Zap,
  Globe,
  Coins,
  ChevronRight,
  Copy,
  Check,
  ArrowUpDown,
  Sparkles,
} from "lucide-react";

interface Model {
  id: string;
  name: string;
  description: string;
  provider: string;
  context_length: string;
  input_price: number;
  output_price: number;
  tiers: ("free" | "lite" | "pro" | "max")[];
  gradient: "purple" | "amber" | "coral";
  logo?: string;
}

const providerLogos: Record<string, string> = {
  "minimax": "/model-logos/route-minimax.png",
  "opencode": "/model-logos/route-minimax.png",
  "zai": "/model-logos/route-zai.svg",
  "openrouter": "/model-logos/route-nvidia.svg",
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
  "xai": "/model-logos/route-xai.png",
};

const allModels: Model[] = [
  {
    id: "route/minimax-m2.7",
    name: "MiniMax M2.7",
    description: "High-performance reasoning model with 200K context",
    provider: "minimax",
    context_length: "200K",
    input_price: 0.33,
    output_price: 1.32,
    tiers: ["lite", "pro", "max"],
    gradient: "purple",
    logo: "/model-logos/route-minimax.png",
  },
  {
    id: "route/minimax-m2.7-highspeed",
    name: "MiniMax M2.7 Highspeed",
    description: "Same as M2.7 with faster output ~100 tokens/sec, ideal for high-throughput applications",
    provider: "minimax",
    context_length: "200K",
    input_price: 0.33,
    output_price: 1.32,
    tiers: ["pro", "max"],
    gradient: "coral",
    logo: "/model-logos/route-minimax.png",
  },
  {
    id: "route/minimax-m2.5",
    name: "MiniMax M2.5",
    description: "Balanced performance and speed",
    provider: "minimax",
    context_length: "200K",
    input_price: 0.193,
    output_price: 1.238,
    tiers: ["free", "lite", "pro", "max"],
    gradient: "amber",
    logo: "/model-logos/route-minimax.png",
  },
  {
    id: "route/minimax-m2.5-highspeed",
    name: "MiniMax M2.5 Highspeed",
    description: "Same as M2.5 with faster output ~70 tokens/sec, ideal for real-time applications",
    provider: "minimax",
    context_length: "200K",
    input_price: 0.193,
    output_price: 1.238,
    tiers: ["pro"],
    gradient: "purple",
    logo: "/model-logos/route-minimax.png",
  },
  {
    id: "route/kimi-k2.5",
    name: "Kimi K2.5",
    description: "Long context understanding with excellent reasoning",
    provider: "opencode",
    context_length: "256K",
    input_price: 0.462,
    output_price: 2.42,
    tiers: ["free", "lite", "pro", "max"],
    gradient: "coral",
    logo: "/model-logos/route-kimi.png",
  },
  {
    id: "route/grok-4-fast",
    name: "Grok-4 Fast",
    description: "Fast xAI model with strong reasoning capabilities",
    provider: "xai",
    context_length: "2000K",
    input_price: 0.22,
    output_price: 0.55,
    tiers: ["pro", "max"],
    gradient: "purple",
    logo: "/model-logos/route-xai.png",
  },
  {
    id: "route/grok-4.20-beta",
    name: "Grok-4.20 Beta",
    description: "Latest Grok-4 beta with improved reasoning",
    provider: "xai",
    context_length: "2000K",
    input_price: 2.20,
    output_price: 6.60,
    tiers: ["max"],
    gradient: "amber",
    logo: "/model-logos/route-xai.png",
  },
  {
    id: "route/grok-4.20-multi-agent-beta",
    name: "Grok-4.20 Multi-Agent Beta",
    description: "Multi-agent capable Grok-4 beta",
    provider: "xai",
    context_length: "2000K",
    input_price: 2.20,
    output_price: 6.60,
    tiers: ["max"],
    gradient: "coral",
    logo: "/model-logos/route-xai.png",
  },
  {
    id: "route/nemotron-3-super-120b",
    name: "Nemotron-3 Super 120B",
    description: "Powerful 120B parameter model for complex tasks",
    provider: "openrouter",
    context_length: "262K",
    input_price: 0.11,
    output_price: 0.55,
    tiers: ["free", "lite", "pro", "max"],
    gradient: "purple",
    logo: "/model-logos/route-nvidia.svg",
  },
  {
    id: "route/trinity-large-preview",
    name: "Trinity Large Preview",
    description: "Next-gen large model preview",
    provider: "openrouter",
    context_length: "131K",
    input_price: 0.00,
    output_price: 0.00,
    tiers: ["free", "lite", "pro", "max"],
    gradient: "amber",
    logo: "/model-logos/route-arcee.png",
  },
  {
    id: "route/glm-4.5-air",
    name: "GLM-4.5 Air",
    description: "Efficient GLM model with air configuration",
    provider: "zai",
    context_length: "128K",
    input_price: 0.143,
    output_price: 0.935,
    tiers: ["pro", "max"],
    gradient: "coral",
    logo: "/model-logos/route-zai.svg",
  },
  {
    id: "route/nemotron-3-nano-30b",
    name: "Nemotron-3 Nano 30B",
    description: "Compact 30B model for efficient inference",
    provider: "openrouter",
    context_length: "256K",
    input_price: 0.055,
    output_price: 0.22,
    tiers: ["free", "lite", "pro", "max"],
    gradient: "amber",
    logo: "/model-logos/route-nvidia.svg",
  },
  {
    id: "route/qwen3-coder",
    name: "Qwen3 Coder",
    description: "Specialized code generation model",
    provider: "openrouter",
    context_length: "262K",
    input_price: 0.242,
    output_price: 1.10,
    tiers: ["pro", "max"],
    gradient: "purple",
    logo: "/model-logos/route-qwen.png",
  },
  {
    id: "route/gpt-oss-120b",
    name: "GPT-OSS 120B",
    description: "Open source 120B GPT model",
    provider: "openrouter",
    context_length: "131K",
    input_price: 0.043,
    output_price: 0.209,
    tiers: ["free", "lite", "pro", "max"],
    gradient: "amber",
    logo: "/model-logos/route-openai.svg",
  },
  {
    id: "route/hermes-3-llama-3.1-405b",
    name: "Hermes-3 Llama 3.1 405B",
    description: "Large 405B model based on Llama architecture",
    provider: "openrouter",
    context_length: "131K",
    input_price: 1.10,
    output_price: 1.10,
    tiers: ["free", "lite", "pro", "max"],
    gradient: "coral",
    logo: "/model-logos/route-nous.png",
  },
  {
id: "route/llama-3.2-3b-instruct",
    name: "Llama 3.2 3B Instruct",
    description: "Meta's efficient 3B instruction-tuned model",
    provider: "meta",
    context_length: "200K",
    input_price: 0.056,
    output_price: 0.374,
    tiers: ["free", "lite", "pro", "max"],
    gradient: "purple",
    logo: "/model-logos/route-meta.png",
  },
  {
    id: "route/gemma-3-27b-it",
    name: "Gemma-3 27B Instruct",
    description: "Google's instruct-tuned Gemma model",
    provider: "openrouter",
    context_length: "131K",
    input_price: 0.088,
    output_price: 0.176,
    tiers: ["free", "lite", "pro", "max"],
    gradient: "amber",
    logo: "/model-logos/route-google.png",
  },
  {
    id: "route/qwen3.6-plus-preview",
    name: "Qwen3.6 Plus Preview",
    description: "Enhanced Qwen preview with plus capabilities",
    provider: "openrouter",
    context_length: "1000K",
    input_price: 0.00,
    output_price: 0.00,
    tiers: ["pro", "max"],
    gradient: "purple",
    logo: "/model-logos/route-qwen.png",
  },
  {
    id: "route/qwen3-next-80b",
    name: "Qwen3 Next 80B",
    description: "Next generation Qwen 80B model",
    provider: "openrouter",
    context_length: "262K",
    input_price: 0.099,
    output_price: 1.21,
    tiers: ["pro", "max"],
    gradient: "coral",
    logo: "/model-logos/route-qwen.png",
  },
  {
    id: "route/glm-5",
    name: "GLM-5",
    description: "Latest generation GLM with enhanced reasoning",
    provider: "zai",
    context_length: "80K",
    input_price: 0.792,
    output_price: 2.53,
    tiers: ["lite", "pro", "max"],
    gradient: "purple",
    logo: "/model-logos/route-zai.svg",
  },
  {
    id: "route/glm-5-turbo",
    name: "GLM-5 Turbo",
    description: "Faster inference with slightly reduced capabilities",
    provider: "zai",
    context_length: "200K",
    input_price: 1.32,
    output_price: 4.40,
    tiers: ["pro", "max"],
    gradient: "amber",
    logo: "/model-logos/route-zai.svg",
  },
  {
    id: "route/glm-4.5-airx",
    name: "GLM-4.5 AirX",
    description: "Efficient GLM model with air configuration",
    provider: "zai",
    context_length: "128K",
    input_price: 1.32,
    output_price: 4.40,
    tiers: ["pro", "max"],
    gradient: "coral",
    logo: "/model-logos/route-zai.svg",
  },
  {
    id: "route/glm-4.5-flash",
    name: "GLM-4.5 Flash",
    description: "Fast and efficient GLM model",
    provider: "zai",
    context_length: "128K",
    input_price: 1.32,
    output_price: 4.40,
    tiers: ["pro", "max"],
    gradient: "purple",
    logo: "/model-logos/route-zai.svg",
  },
  {
    id: "route/glm-4.7-flashx",
    name: "GLM-4.7 FlashX",
    description: "Enhanced flash model with improved capabilities",
    provider: "zai",
    context_length: "200K",
    input_price: 1.32,
    output_price: 4.40,
    tiers: ["pro", "max"],
    gradient: "amber",
    logo: "/model-logos/route-zai.svg",
  },
  {
    id: "route/glm-4.6v-flashx",
    name: "GLM-4.6V FlashX",
    description: "Multimodal flash model with vision capabilities",
    provider: "zai",
    context_length: "128K",
    input_price: 1.32,
    output_price: 4.40,
    tiers: ["pro", "max"],
    gradient: "coral",
    logo: "/model-logos/route-zai.svg",
  },
  {
    id: "route/deepseek-v3.2",
    name: "DeepSeek V3.2",
    description: "Advanced reasoning model",
    provider: "deepseek (chutes → openrouter)",
    context_length: "163K",
    input_price: 0.286,
    output_price: 0.418,
    tiers: ["pro", "max"],
    gradient: "coral",
    logo: "/model-logos/route-deepseek.png",
  },
  {
    id: "route/qwen3-coder-next",
    name: "Qwen3 Coder Next",
    description: "Next-gen code generation and completion",
    provider: "chutes",
    context_length: "262K",
    input_price: 0.132,
    output_price: 0.825,
    tiers: ["pro", "max"],
    gradient: "purple",
    logo: "/model-logos/route-qwen.png",
  },
  {
    id: "route/qwen3-32b",
    name: "Qwen3 32B",
    description: "Balanced 32B parameter model for versatile tasks",
    provider: "chutes",
    context_length: "40K",
    input_price: 0.088,
    output_price: 0.264,
    tiers: ["pro", "max"],
    gradient: "amber",
    logo: "/model-logos/route-qwen.png",
  },
  {
    id: "route/deepseek-v3.2-speciale",
    name: "DeepSeek V3.2 Speciale",
    description: "Special edition DeepSeek model with enhanced capabilities",
    provider: "deepseek (openrouter)",
    context_length: "163K",
    input_price: 0.44,
    output_price: 1.32,
    tiers: ["max"],
    gradient: "purple",
    logo: "/model-logos/route-deepseek.png",
  },
  {
    id: "route/deepseek-r1",
    name: "DeepSeek R1",
    description: "Advanced reasoning with chain-of-thought",
    provider: "deepseek (chutes → openrouter)",
    context_length: "163K",
    input_price: 0.495,
    output_price: 2.365,
    tiers: ["max"],
    gradient: "amber",
    logo: "/model-logos/route-deepseek.png",
  },
  {
    id: "route/mimo-v2-omni",
    name: "Xiaomi MiMo V2 Omni",
    description: "Flagship Xiaomi multimodal model with full capabilities",
    provider: "xiaomi (openrouter)",
    context_length: "262K",
    input_price: 0.44,
    output_price: 2.20,
    tiers: ["max"],
    gradient: "purple",
    logo: "/model-logos/route-xiaomi.png",
  },
  {
    id: "route/mimo-v2-pro",
    name: "Xiaomi MiMo V2 Pro",
    description: "Professional tier Xiaomi multimodal model",
    provider: "xiaomi (openrouter)",
    context_length: "1048K",
    input_price: 1.10,
    output_price: 3.30,
    tiers: ["max"],
    gradient: "amber",
    logo: "/model-logos/route-xiaomi.png",
  },
  {
    id: "route/mimo-v2-flash",
    name: "Xiaomi MiMo V2 Flash",
    description: "Fast and efficient Xiaomi multimodal model",
    provider: "xiaomi (openrouter)",
    context_length: "262K",
    input_price: 0.099,
    output_price: 0.319,
    tiers: ["max"],
    gradient: "coral",
    logo: "/model-logos/route-xiaomi.png",
  },
  {
    id: "route/minimax-image-1",
    name: "MiniMax Image Generation",
    description: "High-quality AI image generation powered by MiniMax",
    provider: "minimax",
    context_length: "N/A",
    input_price: 0.00,
    output_price: 0.05,
    tiers: ["pro", "max"],
    gradient: "purple",
    logo: "/model-logos/route-minimax.png",
  },
];

const tierColors = {
  free: "bg-brand-amber/20 text-brand-amber",
  lite: "bg-brand-blue/20 text-brand-blue",
  pro: "bg-brand-coral/20 text-brand-coral",
  max: "bg-brand-purple/20 text-brand-purple",
};

const tierBgColors = {
  free: "bg-brand-amber",
  lite: "bg-brand-blue",
  pro: "bg-brand-coral",
  max: "bg-brand-purple",
};

const gradientClasses = {
  purple: "from-brand-purple/20 to-brand-purple/5 border-brand-purple/30",
  amber: "from-brand-amber/20 to-brand-amber/5 border-brand-amber/30",
  coral: "from-brand-coral/20 to-brand-coral/5 border-brand-coral/30",
};

const iconBgClasses = {
  purple: "bg-brand-purple/20 text-brand-purple",
  amber: "bg-brand-amber/20 text-brand-amber",
  coral: "bg-brand-coral/20 text-brand-coral",
  blue: "bg-brand-blue/20 text-brand-blue",
};

const tierRequestsPerHour = {
  free: 10,
  lite: 40,
  pro: 60,
  max: 150,
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
      variant="ghost"
      size="sm"
      className="h-6 px-2 text-xs"
      onClick={handleCopy}
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

function ModelAvatar({ name, gradient, logo }: { name: string; gradient: "purple" | "amber" | "coral"; logo?: string }) {
  if (logo) {
    return (
      <div className="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center bg-white/10">
        <img src={logo} alt={name} className="w-8 h-8 object-contain" />
      </div>
    );
  }
  return (
    <div
      className={`w-12 h-12 rounded-lg ${iconBgClasses[gradient]} flex items-center justify-center font-bold text-sm`}
    >
      {getModelInitials(name)}
    </div>
  );
}

function ModelCard({ model }: { model: Model }) {
  const isMaxOnly = model.tiers.length === 1 && model.tiers[0] === "max";

  return (
    <GlassCard hover gradient={model.gradient}>
      <div className="p-5 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <ModelAvatar name={model.name} gradient={model.gradient} logo={model.logo} />
            <div className="space-y-1 min-w-0">
              <h3 className="font-semibold text-base truncate">{model.name}</h3>
              <p className="text-xs text-muted-foreground line-clamp-2">{model.description}</p>
            </div>
          </div>
          <div className="flex flex-col gap-1 shrink-0">
            {model.tiers.map((tier) => (
              <Badge
                key={tier}
                variant="secondary"
                className={tierColors[tier]}
              >
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
            <span className="font-medium truncate max-w-[100px]">{model.provider}</span>
          </div>
        </div>

        <div className="bg-white/5 rounded-lg p-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs">
              <div>
                <span className="text-muted-foreground">In: </span>
                <span className="font-medium">${model.input_price.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Out: </span>
                <span className="font-medium">${model.output_price.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-muted-foreground">/1M</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <code className="text-[10px] font-mono text-muted-foreground bg-muted/50 px-1.5 py-1 rounded truncate max-w-[160px]">
            {model.id}
          </code>
          <CopyButton text={model.id} />
        </div>
      </div>
    </GlassCard>
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
  tier: "free" | "lite" | "pro" | "max";
  models: Model[];
  viewMode: "grid" | "list";
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg ${iconBgClasses[tier === "free" ? "amber" : tier === "lite" ? "blue" : tier === "pro" ? "coral" : "purple"]} flex items-center justify-center`}>
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Badge variant="secondary" className={`${tierColors[tier]} ml-auto`}>
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
        <Card className="border-white/10">
          <CardContent className="p-0">
            <div className="divide-y divide-white/5">
              {models.map((model) => (
                <div
                  key={model.id}
                  className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <ModelAvatar name={model.name} gradient={model.gradient} logo={model.logo} />
                    <div>
                      <p className="font-medium text-sm">{model.name}</p>
                      <p className="text-xs text-muted-foreground">{model.provider}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xs font-medium">{model.context_length}</p>
                      <p className="text-[10px] text-muted-foreground">context</p>
                    </div>
                    <div className="text-right min-w-[60px]">
                      <p className="text-xs font-medium">${model.input_price.toFixed(2)}</p>
                      <p className="text-[10px] text-muted-foreground">input</p>
                    </div>
                    <div className="text-right min-w-[60px]">
                      <p className="text-xs font-medium">${model.output_price.toFixed(2)}</p>
                      <p className="text-[10px] text-muted-foreground">output</p>
                    </div>
                    <code className="text-[9px] font-mono text-muted-foreground bg-muted/50 px-1.5 py-1 rounded hidden lg:inline-block">
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

export default function ModelsPage() {
  const [activeTab, setActiveTab] = useState<"all" | "free" | "lite" | "pro" | "max">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const freeModels = allModels.filter((m) => m.tiers.includes("free"));
  const liteModels = allModels.filter((m) => m.tiers.includes("lite"));
  const proModels = allModels.filter((m) => m.tiers.includes("pro"));
  const maxModels = allModels.filter((m) => m.tiers.includes("max"));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Models
          </h2>
          <p className="text-muted-foreground">
            All models use <code className="text-xs bg-muted px-1 rounded">route/</code> prefix in API calls
          </p>
        </div>
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "grid" | "list")}>
          <TabsList>
            <TabsTrigger value="grid">Grid</TabsTrigger>
            <TabsTrigger value="list">List</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-500">Free Tier</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tierRequestsPerHour.free}</div>
            <p className="text-xs text-muted-foreground">requests/hour</p>
            <p className="text-xs text-muted-foreground mt-2">{freeModels.length} models</p>
          </CardContent>
        </Card>
        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-500">Lite Tier</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tierRequestsPerHour.lite}</div>
            <p className="text-xs text-muted-foreground">requests/hour</p>
            <p className="text-xs text-muted-foreground mt-2">{liteModels.length} models</p>
          </CardContent>
        </Card>
        <Card className="border-coral-500/20 bg-coral-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-coral-500">Pro Tier</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tierRequestsPerHour.pro}</div>
            <p className="text-xs text-muted-foreground">requests/hour</p>
            <p className="text-xs text-muted-foreground mt-2">{proModels.length} exclusive models</p>
          </CardContent>
        </Card>
        <Card className="border-purple-500/20 bg-purple-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-500">Max Tier</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tierRequestsPerHour.max}</div>
            <p className="text-xs text-muted-foreground">requests/hour</p>
            <p className="text-xs text-muted-foreground mt-2">{maxModels.length} premium models</p>
          </CardContent>
        </Card>
        <Card className="border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">All Models</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allModels.length}</div>
            <p className="text-xs text-muted-foreground">total models</p>
            <p className="text-xs text-muted-foreground mt-2">route/ prefix</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList className="grid grid-cols-5 w-fit">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="free">Free</TabsTrigger>
          <TabsTrigger value="lite">Lite</TabsTrigger>
          <TabsTrigger value="pro">Pro</TabsTrigger>
          <TabsTrigger value="max">Max</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-8">
        {(activeTab === "all" || activeTab === "free") && (
          <ModelSection
            title="Free Models"
            description="Available to all users with rate limits"
            tier="free"
            models={freeModels}
            viewMode={viewMode}
          />
        )}

        {(activeTab === "all" || activeTab === "lite") && (
          <ModelSection
            title="Lite Models"
            description="Additional models for Lite plan users"
            tier="lite"
            models={liteModels}
            viewMode={viewMode}
          />
        )}

        {(activeTab === "all" || activeTab === "pro") && (
          <ModelSection
            title="Pro Models"
            description="Additional models for Pro plan users"
            tier="pro"
            models={proModels}
            viewMode={viewMode}
          />
        )}

        {(activeTab === "all" || activeTab === "max") && (
          <ModelSection
            title="Max Models (🤫 Routing.run Exclusives)"
            description="Extra Premium Models for Max plan - shhh don't tell anyone"
            tier="max"
            models={maxModels}
            viewMode={viewMode}
          />
        )}
      </div>

      <GlowCard color="purple" intensity="low" className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-brand-purple/20">
            <Coins className="h-6 w-6 text-brand-purple" />
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Plan-Based Access</h3>
            <p className="text-muted-foreground">
              Your plan determines which models you can access. Free tier gets 10 requests/hour, Pro gets 60/hour, and Max gets 150/hour. Xiaomi models and MiniMax Highspeed models are exclusive to Max plan. Upgrade anytime to unlock more models and higher limits.
            </p>
          </div>
        </div>
      </GlowCard>
    </div>
  );
}
