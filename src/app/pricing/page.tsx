"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Coins, Zap, Sparkles, Crown, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModelPricing {
  model: string;
  display_name: string;
  tier: string;
  input_per_million: number;
  output_per_million: number;
}

const modelDisplayNames: Record<string, string> = {
  "route/minimax-m2.5": "MiniMax-M2.5",
  "route/minimax-m2.7": "MiniMax-M2.7",
  "route/minimax-m2.5-highspeed": "MiniMax-M2.5 Highspeed",
  "route/minimax-m2.7-highspeed": "MiniMax-M2.7 Highspeed",
  "route/kimi-k2.5": "Kimi-K2.5",
  "route/nemotron-3-super-120b": "Nemotron-3-Super-120B",
  "route/trinity-large-preview": "Trinity-Large-Preview",
  "route/glm-4.5-air": "GLM-4.5-Air",
  "route/glm-4.5-airx": "GLM-4.5-AirX",
  "route/glm-4.5-flash": "GLM-4.5-Flash",
  "route/glm-4.7-flashx": "GLM-4.7-FlashX",
  "route/glm-4.6v-flashx": "GLM-4.6V-FlashX",
  "route/glm-5": "GLM-5",
  "route/glm-5-turbo": "GLM-5-Turbo",
  "route/glm-5.1-precision": "GLM-5.1-Precision",
  "route/nemotron-3-nano-30b": "Nemotron-3-Nano-30B",
  "route/qwen3-coder": "Qwen3-Coder",
  "route/qwen3-coder-next": "Qwen3-Coder-Next",
  "route/qwen3-32b": "Qwen3-32B",
  "route/qwen3.6-plus-preview": "Qwen3.6-Plus-Preview",
  "route/qwen3-next-80b": "Qwen3-Next-80B",
  "route/gpt-oss-120b": "GPT-OSS-120B",
  "route/hermes-3-llama-3.1-405b": "Hermes-3-Llama-3.1-405B",
  "route/llama-3.2-3b-instruct": "Llama-3.2-3B-Instruct",
  "route/gemma-3-27b-it": "Gemma-3-27B-IT",
  "route/deepseek-v3.2": "DeepSeek-V3.2",
  "route/deepseek-v3.2-speciale": "DeepSeek-V3.2-Speciale",
  "route/deepseek-r1": "DeepSeek-R1",
  "route/minimax-image-1": "MiniMax-Image-1",
  "route/mimo-v2-omni": "Mimo-V2-Omni",
  "route/mimo-v2-pro": "Mimo-V2-Pro",
  "route/mimo-v2-flash": "Mimo-V2-Flash",
  "route/grok-4-fast": "Grok-4-Fast",
  "route/grok-4.20-beta": "Grok-4.20-Beta",
  "route/grok-4.20-multi-agent-beta": "Grok-4.20-Multi-Agent-Beta",
};

const modelLogos: Record<string, string> = {
  "route/minimax-m2.5": "/model-logos/route-minimax.png",
  "route/minimax-m2.7": "/model-logos/route-minimax.png",
  "route/minimax-m2.5-highspeed": "/model-logos/route-minimax.png",
  "route/minimax-m2.7-highspeed": "/model-logos/route-minimax.png",
  "route/kimi-k2.5": "/model-logos/route-kimi.png",
  "route/nemotron-3-super-120b": "/model-logos/route-nvidia.svg",
  "route/nemotron-3-nano-30b": "/model-logos/route-nvidia.svg",
  "route/trinity-large-preview": "/model-logos/route-arcee.png",
  "route/glm-4.5-air": "/model-logos/route-zai.svg",
  "route/glm-4.5-airx": "/model-logos/route-zai.svg",
  "route/glm-4.5-flash": "/model-logos/route-zai.svg",
  "route/glm-4.7-flashx": "/model-logos/route-zai.svg",
  "route/glm-4.6v-flashx": "/model-logos/route-zai.svg",
  "route/glm-5": "/model-logos/route-zai.svg",
  "route/glm-5-turbo": "/model-logos/route-zai.svg",
  "route/glm-5.1-precision": "/model-logos/route-zai.svg",
  "route/qwen3-coder": "/model-logos/route-qwen.png",
  "route/qwen3-coder-next": "/model-logos/route-qwen.png",
  "route/qwen3-32b": "/model-logos/route-qwen.png",
  "route/qwen3.6-plus-preview": "/model-logos/route-qwen.png",
  "route/qwen3-next-80b": "/model-logos/route-qwen.png",
  "route/gpt-oss-120b": "/model-logos/route-openai.svg",
  "route/hermes-3-llama-3.1-405b": "/model-logos/route-nous.png",
  "route/llama-3.2-3b-instruct": "/model-logos/route-meta.png",
  "route/gemma-3-27b-it": "/model-logos/route-google.png",
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

const staticModelPricing: ModelPricing[] = [
  // Free tier models
  { model: "route/kimi-k2.5", display_name: "Kimi-K2.5", tier: "free", input_per_million: 0.462, output_per_million: 2.42 },
  { model: "route/glm-5", display_name: "GLM-5", tier: "free", input_per_million: 0.792, output_per_million: 2.53 },
  { model: "route/nemotron-3-super-120b", display_name: "Nemotron-3-Super-120B", tier: "free", input_per_million: 0.11, output_per_million: 0.55 },
  { model: "route/trinity-large-preview", display_name: "Trinity-Large-Preview", tier: "free", input_per_million: 0.00, output_per_million: 0.00 },
  { model: "route/nemotron-3-nano-30b", display_name: "Nemotron-3-Nano-30B", tier: "free", input_per_million: 0.055, output_per_million: 0.22 },
  { model: "route/gpt-oss-120b", display_name: "GPT-OSS-120B", tier: "free", input_per_million: 0.043, output_per_million: 0.209 },
  { model: "route/hermes-3-llama-3.1-405b", display_name: "Hermes-3-Llama-3.1-405B", tier: "free", input_per_million: 1.10, output_per_million: 1.10 },
  { model: "route/llama-3.2-3b-instruct", display_name: "Llama-3.2-3B-Instruct", tier: "free", input_per_million: 0.056, output_per_million: 0.374 },
  { model: "route/gemma-3-27b-it", display_name: "Gemma-3-27B-IT", tier: "free", input_per_million: 0.088, output_per_million: 0.176 },

  // Lite tier models
  { model: "route/minimax-m2.5", display_name: "MiniMax-M2.5", tier: "lite", input_per_million: 0.193, output_per_million: 1.238 },
  { model: "route/kimi-k2.5", display_name: "Kimi-K2.5", tier: "lite", input_per_million: 0.462, output_per_million: 2.42 },
  { model: "route/nemotron-3-super-120b", display_name: "Nemotron-3-Super-120B", tier: "lite", input_per_million: 0.11, output_per_million: 0.55 },
  { model: "route/trinity-large-preview", display_name: "Trinity-Large-Preview", tier: "lite", input_per_million: 0.00, output_per_million: 0.00 },
  { model: "route/nemotron-3-nano-30b", display_name: "Nemotron-3-Nano-30B", tier: "lite", input_per_million: 0.055, output_per_million: 0.22 },
  { model: "route/gpt-oss-120b", display_name: "GPT-OSS-120B", tier: "lite", input_per_million: 0.043, output_per_million: 0.209 },
  { model: "route/hermes-3-llama-3.1-405b", display_name: "Hermes-3-Llama-3.1-405B", tier: "lite", input_per_million: 1.10, output_per_million: 1.10 },
  { model: "route/llama-3.2-3b-instruct", display_name: "Llama-3.2-3B-Instruct", tier: "lite", input_per_million: 0.056, output_per_million: 0.374 },
  { model: "route/gemma-3-27b-it", display_name: "Gemma-3-27B-IT", tier: "lite", input_per_million: 0.088, output_per_million: 0.176 },
  { model: "route/minimax-m2.7", display_name: "MiniMax-M2.7", tier: "lite", input_per_million: 0.33, output_per_million: 1.32 },
  { model: "route/glm-5", display_name: "GLM-5", tier: "lite", input_per_million: 0.792, output_per_million: 2.53 },
  { model: "route/glm-5.1-precision", display_name: "GLM-5.1-Precision", tier: "lite", input_per_million: 1.20, output_per_million: 3.50 },

  // Pro tier models
  { model: "route/minimax-m2.5", display_name: "MiniMax-M2.5", tier: "pro", input_per_million: 0.193, output_per_million: 1.238 },
  { model: "route/minimax-m2.5-highspeed", display_name: "MiniMax-M2.5 Highspeed", tier: "pro", input_per_million: 0.193, output_per_million: 1.238 },
  { model: "route/minimax-m2.7", display_name: "MiniMax-M2.7", tier: "pro", input_per_million: 0.33, output_per_million: 1.32 },
  { model: "route/minimax-m2.7-highspeed", display_name: "MiniMax-M2.7 Highspeed", tier: "pro", input_per_million: 0.33, output_per_million: 1.32 },
  { model: "route/kimi-k2.5", display_name: "Kimi-K2.5", tier: "pro", input_per_million: 0.462, output_per_million: 2.42 },
  { model: "route/nemotron-3-super-120b", display_name: "Nemotron-3-Super-120B", tier: "pro", input_per_million: 0.11, output_per_million: 0.55 },
  { model: "route/trinity-large-preview", display_name: "Trinity-Large-Preview", tier: "pro", input_per_million: 0.00, output_per_million: 0.00 },
  { model: "route/nemotron-3-nano-30b", display_name: "Nemotron-3-Nano-30B", tier: "pro", input_per_million: 0.055, output_per_million: 0.22 },
  { model: "route/gpt-oss-120b", display_name: "GPT-OSS-120B", tier: "pro", input_per_million: 0.043, output_per_million: 0.209 },
  { model: "route/hermes-3-llama-3.1-405b", display_name: "Hermes-3-Llama-3.1-405B", tier: "pro", input_per_million: 1.10, output_per_million: 1.10 },
  { model: "route/llama-3.2-3b-instruct", display_name: "Llama-3.2-3B-Instruct", tier: "pro", input_per_million: 0.056, output_per_million: 0.374 },
  { model: "route/gemma-3-27b-it", display_name: "Gemma-3-27B-IT", tier: "pro", input_per_million: 0.088, output_per_million: 0.176 },
  { model: "route/glm-5", display_name: "GLM-5", tier: "pro", input_per_million: 0.792, output_per_million: 2.53 },
  { model: "route/glm-5-turbo", display_name: "GLM-5-Turbo", tier: "pro", input_per_million: 1.32, output_per_million: 4.40 },
  { model: "route/glm-5.1-precision", display_name: "GLM-5.1-Precision", tier: "pro", input_per_million: 1.20, output_per_million: 3.50 },
  { model: "route/glm-4.5-air", display_name: "GLM-4.5-Air", tier: "pro", input_per_million: 0.143, output_per_million: 0.935 },
  { model: "route/glm-4.5-airx", display_name: "GLM-4.5-AirX", tier: "pro", input_per_million: 1.32, output_per_million: 4.40 },
  { model: "route/glm-4.5-flash", display_name: "GLM-4.5-Flash", tier: "pro", input_per_million: 1.32, output_per_million: 4.40 },
  { model: "route/glm-4.7-flashx", display_name: "GLM-4.7-FlashX", tier: "pro", input_per_million: 1.32, output_per_million: 4.40 },
  { model: "route/glm-4.6v-flashx", display_name: "GLM-4.6V-FlashX", tier: "pro", input_per_million: 1.32, output_per_million: 4.40 },
  { model: "route/deepseek-v3.2", display_name: "DeepSeek-V3.2", tier: "pro", input_per_million: 0.286, output_per_million: 0.418 },
  { model: "route/qwen3-coder", display_name: "Qwen3-Coder", tier: "pro", input_per_million: 0.242, output_per_million: 1.10 },
  { model: "route/qwen3-coder-next", display_name: "Qwen3-Coder-Next", tier: "pro", input_per_million: 0.132, output_per_million: 0.825 },
  { model: "route/qwen3-32b", display_name: "Qwen3-32B", tier: "pro", input_per_million: 0.088, output_per_million: 0.264 },
  { model: "route/qwen3.6-plus-preview", display_name: "Qwen3.6-Plus-Preview", tier: "pro", input_per_million: 0.00, output_per_million: 0.00 },
  { model: "route/qwen3-next-80b", display_name: "Qwen3-Next-80B", tier: "pro", input_per_million: 0.099, output_per_million: 1.21 },
  { model: "route/grok-4-fast", display_name: "Grok-4-Fast", tier: "pro", input_per_million: 0.22, output_per_million: 0.55 },
  { model: "route/minimax-image-1", display_name: "MiniMax-Image-1", tier: "pro", input_per_million: 0.00, output_per_million: 0.05 },

  // Max tier models
  { model: "route/minimax-m2.5", display_name: "MiniMax-M2.5", tier: "max", input_per_million: 0.193, output_per_million: 1.238 },
  { model: "route/minimax-m2.5-highspeed", display_name: "MiniMax-M2.5 Highspeed", tier: "max", input_per_million: 0.193, output_per_million: 1.238 },
  { model: "route/minimax-m2.7", display_name: "MiniMax-M2.7", tier: "max", input_per_million: 0.33, output_per_million: 1.32 },
  { model: "route/minimax-m2.7-highspeed", display_name: "MiniMax-M2.7 Highspeed", tier: "max", input_per_million: 0.33, output_per_million: 1.32 },
  { model: "route/kimi-k2.5", display_name: "Kimi-K2.5", tier: "max", input_per_million: 0.462, output_per_million: 2.42 },
  { model: "route/nemotron-3-super-120b", display_name: "Nemotron-3-Super-120B", tier: "max", input_per_million: 0.11, output_per_million: 0.55 },
  { model: "route/trinity-large-preview", display_name: "Trinity-Large-Preview", tier: "max", input_per_million: 0.00, output_per_million: 0.00 },
  { model: "route/nemotron-3-nano-30b", display_name: "Nemotron-3-Nano-30B", tier: "max", input_per_million: 0.055, output_per_million: 0.22 },
  { model: "route/gpt-oss-120b", display_name: "GPT-OSS-120B", tier: "max", input_per_million: 0.043, output_per_million: 0.209 },
  { model: "route/hermes-3-llama-3.1-405b", display_name: "Hermes-3-Llama-3.1-405B", tier: "max", input_per_million: 1.10, output_per_million: 1.10 },
  { model: "route/llama-3.2-3b-instruct", display_name: "Llama-3.2-3B-Instruct", tier: "max", input_per_million: 0.056, output_per_million: 0.374 },
  { model: "route/gemma-3-27b-it", display_name: "Gemma-3-27B-IT", tier: "max", input_per_million: 0.088, output_per_million: 0.176 },
  { model: "route/glm-5", display_name: "GLM-5", tier: "max", input_per_million: 0.792, output_per_million: 2.53 },
  { model: "route/glm-5-turbo", display_name: "GLM-5-Turbo", tier: "max", input_per_million: 1.32, output_per_million: 4.40 },
  { model: "route/glm-5.1-precision", display_name: "GLM-5.1-Precision", tier: "max", input_per_million: 1.20, output_per_million: 3.50 },
  { model: "route/glm-4.5-air", display_name: "GLM-4.5-Air", tier: "max", input_per_million: 0.143, output_per_million: 0.935 },
  { model: "route/glm-4.5-airx", display_name: "GLM-4.5-AirX", tier: "max", input_per_million: 1.32, output_per_million: 4.40 },
  { model: "route/glm-4.5-flash", display_name: "GLM-4.5-Flash", tier: "max", input_per_million: 1.32, output_per_million: 4.40 },
  { model: "route/glm-4.7-flashx", display_name: "GLM-4.7-FlashX", tier: "max", input_per_million: 1.32, output_per_million: 4.40 },
  { model: "route/glm-4.6v-flashx", display_name: "GLM-4.6V-FlashX", tier: "max", input_per_million: 1.32, output_per_million: 4.40 },
  { model: "route/deepseek-v3.2", display_name: "DeepSeek-V3.2", tier: "max", input_per_million: 0.286, output_per_million: 0.418 },
  { model: "route/deepseek-v3.2-speciale", display_name: "DeepSeek-V3.2-Speciale", tier: "max", input_per_million: 0.44, output_per_million: 1.32 },
  { model: "route/deepseek-r1", display_name: "DeepSeek-R1", tier: "max", input_per_million: 0.495, output_per_million: 2.365 },
  { model: "route/qwen3-coder", display_name: "Qwen3-Coder", tier: "max", input_per_million: 0.242, output_per_million: 1.10 },
  { model: "route/qwen3-coder-next", display_name: "Qwen3-Coder-Next", tier: "max", input_per_million: 0.132, output_per_million: 0.825 },
  { model: "route/qwen3-32b", display_name: "Qwen3-32B", tier: "max", input_per_million: 0.088, output_per_million: 0.264 },
  { model: "route/qwen3.6-plus-preview", display_name: "Qwen3.6-Plus-Preview", tier: "max", input_per_million: 0.00, output_per_million: 0.00 },
  { model: "route/qwen3-next-80b", display_name: "Qwen3-Next-80B", tier: "max", input_per_million: 0.099, output_per_million: 1.21 },
  { model: "route/grok-4-fast", display_name: "Grok-4-Fast", tier: "max", input_per_million: 0.22, output_per_million: 0.55 },
  { model: "route/grok-4.20-beta", display_name: "Grok-4.20-Beta", tier: "max", input_per_million: 2.20, output_per_million: 6.60 },
  { model: "route/grok-4.20-multi-agent-beta", display_name: "Grok-4.20-Multi-Agent-Beta", tier: "max", input_per_million: 2.20, output_per_million: 6.60 },
  { model: "route/minimax-image-1", display_name: "MiniMax-Image-1", tier: "max", input_per_million: 0.00, output_per_million: 0.05 },
  { model: "route/mimo-v2-omni", display_name: "Mimo-V2-Omni", tier: "max", input_per_million: 0.44, output_per_million: 2.20 },
  { model: "route/mimo-v2-pro", display_name: "Mimo-V2-Pro", tier: "max", input_per_million: 1.10, output_per_million: 3.30 },
  { model: "route/mimo-v2-flash", display_name: "Mimo-V2-Flash", tier: "max", input_per_million: 0.099, output_per_million: 0.319 },
];

const plans = [
  {
    id: "free",
    name: "Free",
    label: "FREE",
    price: "$0",
    period: "forever",
    requests: 5,
    credits: 5,
    badge: "bg-zinc-600",
    border: "border-zinc-500/30",
    icon: <Rocket className="h-5 w-5" />,
    features: [
      "Kimi-K2.5",
      "GLM-5",
      "Nemotron-3-Super-120B",
      "GPT-OSS-120B",
      "Hermes-3-Llama-3.1-405B",
      "Llama-3.2-3B-Instruct",
      "Gemma-3-27B-IT",
      "5 requests/hour",
      "Basic support",
    ],
  },
  {
    id: "lite",
    name: "Lite",
    label: "LITE",
    price: "$10",
    period: "/month",
    requests: 40,
    credits: 10,
    badge: "bg-blue-600",
    border: "border-blue-500/30",
    icon: <Zap className="h-5 w-5" />,
    features: [
      "All free models",
      "GLM-5 & GLM-5-Turbo",
      "DeepSeek-V3.2",
      "Qwen3-32B",
      "Qwen3-Next-80B",
      "Qwen3.6-Plus-Preview (free)",
      "40 requests/hour",
      "Email support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    label: "PRO",
    price: "$20",
    period: "/month",
    requests: 100,
    credits: 20,
    badge: "bg-indigo-600",
    border: "border-indigo-500/30",
    popular: true,
    icon: <Sparkles className="h-5 w-5" />,
    features: [
      "All lite models",
      "GLM-4.5-Air & variants",
      "Qwen3-Coder & Coder-Next",
      "MiniMax-Image-1 generation",
      "Grok-4-Fast & Grok-4.20-Beta",
      "Grok-4.20-Multi-Agent-Beta",
      "100 requests/hour",
      "Priority support",
    ],
  },
  {
    id: "max",
    name: "Max",
    label: "MAX",
    price: "$50",
    period: "/month",
    requests: 250,
    credits: 50,
    badge: "bg-violet-600",
    border: "border-violet-500/30",
    icon: <Crown className="h-5 w-5" />,
    features: [
      "All models unlocked",
      "MiniMax-M2.7 Highspeed (~100 tps)",
      "Mimo-V2-Omni/Pro/Flash",
      "DeepSeek-V3.2-Speciale",
      "DeepSeek-R1",
      "Grok-4.20-Beta & Multi-Agent",
      "250 requests/hour",
      "Dedicated support",
    ],
  },
];

const tierGroups = [
  { tier: "free", label: "Free", models: staticModelPricing.filter(m => m.tier === "free"), badge: "bg-zinc-600", name: "Free Models" },
  { tier: "lite", label: "Lite", models: staticModelPricing.filter(m => m.tier === "lite"), badge: "bg-blue-600", name: "Lite Models" },
  { tier: "pro", label: "Pro", models: staticModelPricing.filter(m => m.tier === "pro"), badge: "bg-indigo-600", name: "Pro Models" },
  { tier: "max", label: "Max", models: staticModelPricing.filter(m => m.tier === "max"), badge: "bg-violet-600", name: "Max Models" },
];

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <div className="w-full px-4 py-12 md:py-20">
      <div className="max-w-7xl mx-auto space-y-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 mb-4">
            <Sparkles className="h-4 w-4 text-indigo-500" />
            <span className="text-sm font-medium text-indigo-500">Simple, transparent pricing</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight bg-gradient-to-b from-foreground to-foreground/60 bg-clip-text text-transparent">
            Choose Your Plan
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Pay only for what you use. All plans include access to our OpenAI-compatible API with automatic provider fallback.
          </p>
          
          <div className="flex items-center justify-center gap-4 pt-4">
            <span className={cn("text-sm", !isAnnual ? "text-foreground font-medium" : "text-muted-foreground")}>Monthly</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative w-14 h-7 rounded-full bg-muted transition-colors"
            >
              <div className={cn(
                "absolute top-1 w-5 h-5 rounded-full bg-foreground transition-all",
                isAnnual ? "left-8" : "left-1"
              )} />
            </button>
            <span className={cn("text-sm", isAnnual ? "text-foreground font-medium" : "text-muted-foreground")}>
              Annual <span className="text-emerald-500 font-medium">(-20%)</span>
            </span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid gap-6 lg:grid-cols-4"
        >
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className={cn(
                "relative rounded-2xl border bg-card p-8 text-card-foreground overflow-hidden",
                plan.popular && "border-indigo-500/50 shadow-xl shadow-indigo-500/10",
                plan.border
              )}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-violet-500" />
              )}
              
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-[100px]" />
              
              <div className="relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className={cn("p-2 rounded-lg", plan.badge, "text-white")}>
                    {plan.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    <span className={cn("px-2 py-0.5 text-xs font-medium rounded text-white", plan.badge)}>
                      {plan.label}
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  {isAnnual && plan.id !== "free" && (
                    <p className="text-sm text-emerald-500 mt-1">
                      ${Math.round(parseInt(plan.price.replace("$", "")) * 0.8)}/month billed annually
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-muted/50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold">{plan.requests}</p>
                    <p className="text-xs text-muted-foreground mt-1">requests/hr</p>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold">${plan.credits}</p>
                    <p className="text-xs text-muted-foreground mt-1">credits/mo</p>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <Check className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  className={cn("w-full", plan.popular && "bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600")} 
                  variant={plan.popular ? "default" : "outline"}
                >
                  {plan.id === "free" ? "Start Free" : plan.id === "max" ? "Get Max" : "Get Started"}
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-8"
        >
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold">Model Pricing</h2>
            <p className="text-muted-foreground">Prices per million tokens (input / output)</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {tierGroups.map((group, groupIndex) => (
              <motion.div 
                key={group.tier}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + groupIndex * 0.05 }}
                className="rounded-2xl border bg-card overflow-hidden"
              >
                <div className={cn("p-4 border-b", group.badge, "bg-opacity-10")}>
                  <div className="flex items-center gap-2">
                    <span className={cn("px-3 py-1 text-xs font-medium rounded-full text-white", group.badge)}>
                      {group.label}
                    </span>
                    <span className="text-sm font-medium">{group.models.length} models</span>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  {group.models.map((m) => (
                    <div 
                      key={m.model} 
                      className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      {modelLogos[m.model] ? (
                        <img
                          src={modelLogos[m.model]}
                          alt={m.display_name}
                          className="w-8 h-8 object-contain"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-xs font-bold">
                          {m.display_name.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{m.display_name}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-mono font-medium">${m.input_per_million.toFixed(m.input_per_million < 1 ? 3 : 2)}</span>
                          <span className="text-xs text-muted-foreground">/</span>
                          <span className="text-xs text-muted-foreground font-mono">${m.output_per_million.toFixed(m.output_per_million < 1 ? 3 : 2)}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">in / out</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border bg-gradient-to-br from-card to-muted/20 p-8"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10">
              <Coins className="h-8 w-8 text-indigo-500" />
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="text-xl font-bold flex items-center gap-2">
                Usage-Based Billing
                <Badge variant="secondary" className="text-xs">Recommended</Badge>
              </h3>
              <p className="text-muted-foreground max-w-2xl">
                All models are billed per million tokens processed. Your plan determines which models you can access and your rate limits. Upgrade or downgrade anytime - no commitments.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid gap-4 md:grid-cols-3"
        >
          {[
            { icon: <Zap className="h-5 w-5" />, title: "OpenAI-compatible API", desc: "Drop-in replacement for your existing code" },
            { icon: <Sparkles className="h-5 w-5" />, title: "Automatic provider fallback", desc: "99.9% uptime with intelligent routing" },
            { icon: <Crown className="h-5 w-5" />, title: "Usage analytics", desc: "Track spend with detailed dashboards" },
          ].map((item, i) => (
            <div 
              key={item.title}
              className="rounded-xl border bg-card p-6 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  {item.icon}
                </div>
                <h3 className="font-semibold">{item.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center py-8"
        >
          <p className="text-muted-foreground">
            Need a custom enterprise plan? <Button variant="link" className="text-primary">Contact us</Button> for volume discounts and dedicated support.
          </p>
        </motion.div>
      </div>
    </div>
  );
}