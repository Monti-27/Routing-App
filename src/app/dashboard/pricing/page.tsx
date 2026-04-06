"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import {
  Rocket,
  Zap,
  SparklesIcon,
  Crown,
  Check,
  Copy,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const modelLogos: Record<string, string> = {
  "route/minimax-m2.5": "/model-logos/route-minimax.png",
  "route/minimax-m2.7": "/model-logos/route-minimax.png",
  "route/minimax-m2.5-highspeed": "/model-logos/route-minimax.png",
  "route/minimax-m2.7-highspeed": "/model-logos/route-minimax.png",
  "route/kimi-k2.5": "/model-logos/route-kimi.png",
  "route/kimi-k2.5-highspeed": "/model-logos/route-kimi.png",
  "route/nemotron-3-super-120b": "/model-logos/route-nvidia.svg",
  "route/trinity-large-preview": "/model-logos/route-arcee.png",
  "route/nemotron-3-nano-30b": "/model-logos/route-nvidia.svg",
  "route/gpt-oss-120b": "/model-logos/route-openai.svg",
  "route/hermes-3-llama-3.1-405b": "/model-logos/route-nous.png",
  "route/llama-3.2-3b-instruct": "/model-logos/route-meta.png",
  "route/gemma-3-27b-it": "/model-logos/route-google.png",
  "route/glm-5": "/model-logos/route-zai.svg",
  "route/glm-5-turbo": "/model-logos/route-zai.svg",
  "route/glm-4.5-air": "/model-logos/route-zai.svg",
  "route/glm-4.5-airx": "/model-logos/route-zai.svg",
  "route/glm-4.5-flash": "/model-logos/route-zai.svg",
  "route/glm-4.7-flashx": "/model-logos/route-zai.svg",
  "route/glm-4.6v-flashx": "/model-logos/route-zai.svg",
  "route/glm-4.7": "/model-logos/route-zai.svg",
  "route/glm-4.7-flash": "/model-logos/route-zai.svg",
  "route/glm-5-highspeed": "/model-logos/route-zai.svg",
  "route/deepseek-v3.2": "/model-logos/route-deepseek.png",
  "route/qwen3-coder": "/model-logos/route-qwen.png",
  "route/qwen3-coder-next": "/model-logos/route-qwen.png",
  "route/qwen3-32b": "/model-logos/route-qwen.png",
  "route/qwen3.6-plus-preview": "/model-logos/route-qwen.png",
  "route/qwen3-next-80b": "/model-logos/route-qwen.png",
  "route/grok-4-fast": "/model-logos/route-xai.png",
  "route/grok-4.20-beta": "/model-logos/route-xai.png",
  "route/grok-4.20-multi-agent-beta": "/model-logos/route-xai.png",
  "route/minimax-image-1": "/model-logos/route-minimax.png",
  "route/deepseek-v3.2-speciale": "/model-logos/route-deepseek.png",
  "route/deepseek-r1": "/model-logos/route-deepseek.png",
  "route/mimo-v2-omni": "/model-logos/route-xiaomi.png",
  "route/mimo-v2-pro": "/model-logos/route-xiaomi.png",
  "route/mimo-v2-flash": "/model-logos/route-xiaomi.png",
};

interface ModelPricing {
  model: string;
  display_name: string;
  tier: "free" | "lite" | "pro" | "max";
  input_per_million: number;
  output_per_million: number;
}

const staticModelPricing: ModelPricing[] = [
  // Free tier models
  { model: "route/minimax-m2.5", display_name: "MiniMax-M2.5", tier: "free", input_per_million: 0.193, output_per_million: 1.238 },
  { model: "route/kimi-k2.5", display_name: "Kimi-K2.5", tier: "free", input_per_million: 0.462, output_per_million: 2.42 },
  { model: "route/nemotron-3-super-120b", display_name: "Nemotron-3-Super-120B", tier: "free", input_per_million: 0.11, output_per_million: 0.55 },
  { model: "route/trinity-large-preview", display_name: "Trinity-Large-Preview", tier: "free", input_per_million: 0.00, output_per_million: 0.00 },
  { model: "route/nemotron-3-nano-30b", display_name: "Nemotron-3-Nano-30B", tier: "free", input_per_million: 0.055, output_per_million: 0.22 },
  { model: "route/gpt-oss-120b", display_name: "GPT-OSS-120B", tier: "free", input_per_million: 0.043, output_per_million: 0.209 },
  { model: "route/hermes-3-llama-3.1-405b", display_name: "Hermes-3-Llama-3.1-405B", tier: "free", input_per_million: 1.10, output_per_million: 1.10 },
  { model: "route/llama-3.2-3b-instruct", display_name: "Llama-3.2-3B-Instruct", tier: "free", input_per_million: 0.056, output_per_million: 0.374 },
  { model: "route/gemma-3-27b-it", display_name: "Gemma-3-27B-IT", tier: "free", input_per_million: 0.088, output_per_million: 0.176 },

  // Lite tier models (includes free models)
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

  // Pro tier models (includes lite and free models)
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
  { model: "route/glm-4.5-air", display_name: "GLM-4.5-Air", tier: "pro", input_per_million: 0.143, output_per_million: 0.935 },
  { model: "route/glm-4.5-airx", display_name: "GLM-4.5-AirX", tier: "pro", input_per_million: 1.32, output_per_million: 4.40 },
  { model: "route/glm-4.5-flash", display_name: "GLM-4.5-Flash", tier: "pro", input_per_million: 1.32, output_per_million: 4.40 },
  { model: "route/glm-4.7-flashx", display_name: "GLM-4.7-FlashX", tier: "pro", input_per_million: 1.32, output_per_million: 4.40 },
  { model: "route/glm-4.6v-flashx", display_name: "GLM-4.6V-FlashX", tier: "pro", input_per_million: 1.32, output_per_million: 4.40 },
  { model: "route/glm-4.7", display_name: "GLM-4.7", tier: "pro", input_per_million: 1.32, output_per_million: 4.40 },
  { model: "route/glm-4.7-flash", display_name: "GLM-4.7-Flash", tier: "pro", input_per_million: 1.32, output_per_million: 4.40 },
  { model: "route/glm-5-highspeed", display_name: "GLM-5-Highspeed (100 tps)", tier: "pro", input_per_million: 1.1088, output_per_million: 3.542 },
  { model: "route/kimi-k2.5-highspeed", display_name: "Kimi-K2.5-Highspeed (100 tps)", tier: "pro", input_per_million: 0.6468, output_per_million: 3.388 },
  { model: "route/deepseek-v3.2", display_name: "DeepSeek-V3.2", tier: "pro", input_per_million: 0.4928, output_per_million: 0.7392 },
  { model: "route/qwen3-coder", display_name: "Qwen3-Coder", tier: "pro", input_per_million: 0.242, output_per_million: 1.10 },
  { model: "route/qwen3-coder-next", display_name: "Qwen3-Coder-Next", tier: "pro", input_per_million: 0.132, output_per_million: 0.825 },
  { model: "route/qwen3-32b", display_name: "Qwen3-32B", tier: "pro", input_per_million: 0.088, output_per_million: 0.264 },
  { model: "route/qwen3.6-plus-preview", display_name: "Qwen3.6-Plus-Preview", tier: "pro", input_per_million: 0.00, output_per_million: 0.00 },
  { model: "route/qwen3-next-80b", display_name: "Qwen3-Next-80B", tier: "pro", input_per_million: 0.099, output_per_million: 1.21 },
  { model: "route/grok-4-fast", display_name: "Grok-4-Fast", tier: "pro", input_per_million: 0.22, output_per_million: 0.55 },
  { model: "route/minimax-image-1", display_name: "MiniMax-Image-1", tier: "pro", input_per_million: 0.00, output_per_million: 0.05 },

  // Max tier models (all models)
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
  { model: "route/glm-4.5-air", display_name: "GLM-4.5-Air", tier: "max", input_per_million: 0.143, output_per_million: 0.935 },
  { model: "route/glm-4.5-airx", display_name: "GLM-4.5-AirX", tier: "max", input_per_million: 1.32, output_per_million: 4.40 },
  { model: "route/glm-4.5-flash", display_name: "GLM-4.5-Flash", tier: "max", input_per_million: 1.32, output_per_million: 4.40 },
  { model: "route/glm-4.7-flashx", display_name: "GLM-4.7-FlashX", tier: "max", input_per_million: 1.32, output_per_million: 4.40 },
  { model: "route/glm-4.6v-flashx", display_name: "GLM-4.6V-FlashX", tier: "max", input_per_million: 1.32, output_per_million: 4.40 },
  { model: "route/glm-4.7", display_name: "GLM-4.7", tier: "max", input_per_million: 1.32, output_per_million: 4.40 },
  { model: "route/glm-4.7-flash", display_name: "GLM-4.7-Flash", tier: "max", input_per_million: 1.32, output_per_million: 4.40 },
  { model: "route/glm-5-highspeed", display_name: "GLM-5-Highspeed (100 tps)", tier: "max", input_per_million: 1.1088, output_per_million: 3.542 },
  { model: "route/kimi-k2.5-highspeed", display_name: "Kimi-K2.5-Highspeed (100 tps)", tier: "max", input_per_million: 0.6468, output_per_million: 3.388 },
  { model: "route/deepseek-v3.2", display_name: "DeepSeek-V3.2", tier: "max", input_per_million: 0.4928, output_per_million: 0.7392 },
  { model: "route/deepseek-v3.2-speciale", display_name: "DeepSeek-V3.2-Speciale", tier: "max", input_per_million: 0.55, output_per_million: 0.82 },
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
    priceDetail: "forever",
    badge: "bg-zinc-600",
    requestsPerHour: 5,
    credits: 5,
    checkoutUrl: "/auth/register",
    features: [
      "5 requests per hour",
      "Basic model access",
      "Standard routing",
      "Community support",
    ],
  },
  {
    id: "lite",
    name: "Lite",
    label: "LITE",
    price: "$10",
    priceDetail: "/month",
    badge: "bg-blue-600",
    requestsPerHour: 40,
    credits: 30,
    checkoutUrl: "https://whop.com/tropic-6587/routing-lite/",
    popular: false,
    features: [
      "40 requests per hour",
      "Extended model access",
      "Priority routing",
      "Email support",
    ],
  },
  {
    id: "premium",
    name: "Pro",
    label: "PRO",
    price: "$20",
    priceDetail: "/month",
    badge: "bg-indigo-600",
    requestsPerHour: 100,
    credits: 60,
    checkoutUrl: "https://whop.com/tropic-6587/routing-pro/",
    popular: true,
    features: [
      "100 requests per hour",
      "All Lite models + more",
      "Fastest routing",
      "Priority support",
    ],
  },
  {
    id: "max",
    name: "Max",
    label: "MAX",
    price: "$50",
    priceDetail: "/month",
    badge: "bg-violet-600",
    requestsPerHour: 250,
    credits: 150,
    checkoutUrl: "https://whop.com/tropic-6587/routing-max/",
    features: [
      "250 requests per hour",
      "All models access",
      "Fastest routing",
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
  const { user, isAuthenticated } = useAuth();

  const getCheckoutUrl = (baseUrl: string) => {
    if (!baseUrl.startsWith("http")) return baseUrl;
    const separator = baseUrl.includes("?") ? "&" : "?";
    return isAuthenticated && user?.email 
      ? `${baseUrl}${separator}email=${encodeURIComponent(user.email)}`
      : baseUrl;
  };

  return (
    <div className="w-full px-4 py-12 md:py-20">
      <div className="max-w-7xl mx-auto space-y-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Pay only for what you use. All plans include access to our OpenAI-compatible API with automatic provider fallback.
          </p>
        </motion.div>

        <div className="flex items-center justify-center gap-4">
          <span className={cn("text-sm", !isAnnual && "text-foreground")}>Monthly</span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className={cn(
              "relative w-14 h-7 rounded-full transition-colors",
              isAnnual ? "bg-indigo-600" : "bg-muted"
            )}
          >
            <span
              className={cn(
                "absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform",
                isAnnual && "translate-x-7"
              )}
            />
          </button>
          <span className={cn("text-sm", isAnnual && "text-foreground")}>
            Annual <span className="text-indigo-600 text-xs">Save 20%</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <Card 
              key={plan.id}
              className={cn(
                "relative overflow-hidden",
                plan.popular && "border-indigo-600 shadow-lg shadow-indigo-600/20"
              )}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs font-medium px-3 py-1 rounded-bl-lg">
                  Popular
                </div>
              )}
              <CardContent className="p-6 space-y-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={cn("w-3 h-3 rounded-full", plan.badge)} />
                    <span className="font-semibold">{plan.name}</span>
                  </div>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground text-sm">{plan.priceDetail}</span>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-indigo-600" />
                    <span>{plan.requestsPerHour} requests/hour</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <SparklesIcon className="w-4 h-4 text-indigo-600" />
                    <span>{plan.credits} credits/month</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <ul className="space-y-2 text-sm">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  className={cn("w-full", plan.popular ? "" : "variantoutline")}
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => window.open(getCheckoutUrl(plan.checkoutUrl), "_blank")}
                >
                  {plan.id === "free" ? "Get Started" : "Buy Now"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Model Pricing by Tier</h2>
            <p className="text-muted-foreground mt-2">Prices per million tokens</p>
          </div>

          <Tabs defaultValue="free" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="free">Free</TabsTrigger>
              <TabsTrigger value="lite">Lite</TabsTrigger>
              <TabsTrigger value="pro">Pro</TabsTrigger>
              <TabsTrigger value="max">Max</TabsTrigger>
            </TabsList>

            {tierGroups.map((group) => (
              <TabsContent key={group.tier} value={group.tier} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{group.name}</h3>
                  <Badge variant="secondary" className={group.badge}>
                    {group.models.length} models
                  </Badge>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {group.models.map((model) => (
                    <Card key={`${model.model}-${model.tier}`} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center bg-muted">
                            {modelLogos[model.model] ? (
                              <img 
                                src={modelLogos[model.model]} 
                                alt={model.display_name}
                                className="w-6 h-6 object-contain"
                              />
                            ) : (
                              <span className="text-xs font-bold">{model.display_name.slice(0, 2)}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{model.display_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {model.input_per_million > 0 
                                ? `$${model.input_per_million.toFixed(3)} / $${model.output_per_million.toFixed(3)}`
                                : "Free"}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
}
