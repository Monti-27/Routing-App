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
  "route/glm-5": "/model-logos/route-zai.svg",
  "route/glm-5.1": "/model-logos/route-zai.svg",
  "route/glm-4.7": "/model-logos/route-zai.svg",
  "route/glm-4.7-flash": "/model-logos/route-zai.svg",
  "route/glm-5-highspeed": "/model-logos/route-zai.svg",
  "route/deepseek-v3.2": "/model-logos/route-deepseek.png",
  "route/deepseek-v3.2-speciale": "/model-logos/route-deepseek.png",
  "route/deepseek-r1": "/model-logos/route-deepseek.png",
  "route/qwen3.5-9b": "/model-logos/route-qwen.png",
  "route/qwen3.5-397b-a17b": "/model-logos/route-qwen.png",
  "route/qwen3.6-plus-preview": "/model-logos/route-qwen.png",
};

interface ModelPricing {
  model: string;
  display_name: string;
  tier: "free" | "lite" | "premium" | "max";
  input_per_million: number;
  output_per_million: number;
}

const staticModelPricing: ModelPricing[] = [
  // Free tier models
  { model: "route/minimax-m2.5", display_name: "MiniMax-M2.5", tier: "free", input_per_million: 0.193, output_per_million: 1.238 },
  { model: "route/kimi-k2.5", display_name: "Kimi-K2.5", tier: "free", input_per_million: 0.462, output_per_million: 2.42 },

  // Lite tier models (includes free models)
  { model: "route/minimax-m2.5", display_name: "MiniMax-M2.5", tier: "lite", input_per_million: 0.193, output_per_million: 1.238 },
  { model: "route/kimi-k2.5", display_name: "Kimi-K2.5", tier: "lite", input_per_million: 0.462, output_per_million: 2.42 },
  { model: "route/minimax-m2.7", display_name: "MiniMax-M2.7", tier: "lite", input_per_million: 0.33, output_per_million: 1.32 },
  { model: "route/glm-5", display_name: "GLM-5", tier: "lite", input_per_million: 0.792, output_per_million: 2.53 },
  { model: "route/glm-5.1", display_name: "GLM-5.1", tier: "lite", input_per_million: 1.00, output_per_million: 3.00 },
  { model: "route/glm-4.7", display_name: "GLM-4.7", tier: "lite", input_per_million: 1.32, output_per_million: 4.40 },
  { model: "route/glm-4.7-flash", display_name: "GLM-4.7-Flash", tier: "lite", input_per_million: 1.32, output_per_million: 4.40 },
  { model: "route/qwen3.5-9b", display_name: "Qwen3.5-9B", tier: "lite", input_per_million: 0.20, output_per_million: 0.60 },
  { model: "route/qwen3.5-397b-a17b", display_name: "Qwen3.5-397B-A17B", tier: "lite", input_per_million: 1.10, output_per_million: 3.30 },
  { model: "route/deepseek-v3.2", display_name: "DeepSeek-V3.2", tier: "lite", input_per_million: 0.4928, output_per_million: 0.7392 },
  { model: "route/qwen3.6-plus-preview", display_name: "Qwen3.6-Plus-Preview", tier: "lite", input_per_million: 0.00, output_per_million: 0.00 },

  // Premium tier models (includes lite and free models)
  { model: "route/minimax-m2.5", display_name: "MiniMax-M2.5", tier: "premium", input_per_million: 0.193, output_per_million: 1.238 },
  { model: "route/minimax-m2.5-highspeed", display_name: "MiniMax-M2.5 Highspeed", tier: "premium", input_per_million: 0.193, output_per_million: 1.238 },
  { model: "route/minimax-m2.7", display_name: "MiniMax-M2.7", tier: "premium", input_per_million: 0.33, output_per_million: 1.32 },
  { model: "route/minimax-m2.7-highspeed", display_name: "MiniMax-M2.7 Highspeed", tier: "premium", input_per_million: 0.33, output_per_million: 1.32 },
  { model: "route/kimi-k2.5", display_name: "Kimi-K2.5", tier: "premium", input_per_million: 0.462, output_per_million: 2.42 },
  { model: "route/kimi-k2.5-highspeed", display_name: "Kimi-K2.5-Highspeed", tier: "premium", input_per_million: 0.6468, output_per_million: 3.388 },
  { model: "route/glm-5", display_name: "GLM-5", tier: "premium", input_per_million: 0.792, output_per_million: 2.53 },
  { model: "route/glm-5.1", display_name: "GLM-5.1", tier: "premium", input_per_million: 1.00, output_per_million: 3.00 },
  { model: "route/glm-4.7", display_name: "GLM-4.7", tier: "premium", input_per_million: 1.32, output_per_million: 4.40 },
  { model: "route/glm-4.7-flash", display_name: "GLM-4.7-Flash", tier: "premium", input_per_million: 1.32, output_per_million: 4.40 },
  { model: "route/qwen3.5-9b", display_name: "Qwen3.5-9B", tier: "premium", input_per_million: 0.20, output_per_million: 0.60 },
  { model: "route/qwen3.5-397b-a17b", display_name: "Qwen3.5-397B-A17B", tier: "premium", input_per_million: 1.10, output_per_million: 3.30 },
  { model: "route/deepseek-v3.2", display_name: "DeepSeek-V3.2", tier: "premium", input_per_million: 0.4928, output_per_million: 0.7392 },
  { model: "route/qwen3.6-plus-preview", display_name: "Qwen3.6-Plus-Preview", tier: "premium", input_per_million: 0.00, output_per_million: 0.00 },

  // Max tier models (all models)
  { model: "route/minimax-m2.7-highspeed", display_name: "MiniMax-M2.7-Highspeed", tier: "max", input_per_million: 0.33, output_per_million: 1.32 },
  { model: "route/glm-5.1", display_name: "GLM-5.1", tier: "max", input_per_million: 1.00, output_per_million: 3.00 },
  { model: "route/glm-4.7", display_name: "GLM-4.7", tier: "max", input_per_million: 1.32, output_per_million: 4.40 },
  { model: "route/glm-4.7-flash", display_name: "GLM-4.7-Flash", tier: "max", input_per_million: 1.32, output_per_million: 4.40 },
  { model: "route/qwen3.5-9b", display_name: "Qwen3.5-9B", tier: "max", input_per_million: 0.20, output_per_million: 0.60 },
  { model: "route/qwen3.5-397b-a17b", display_name: "Qwen3.5-397B-A17B", tier: "max", input_per_million: 1.10, output_per_million: 3.30 },
  { model: "route/glm-5-highspeed", display_name: "GLM-5-Highspeed", tier: "max", input_per_million: 1.1088, output_per_million: 3.542 },
  { model: "route/kimi-k2.5-highspeed", display_name: "Kimi-K2.5-Highspeed", tier: "max", input_per_million: 0.6468, output_per_million: 3.388 },
  { model: "route/deepseek-v3.2-speciale", display_name: "DeepSeek-V3.2-Speciale", tier: "max", input_per_million: 0.55, output_per_million: 0.82 },
  { model: "route/deepseek-r1", display_name: "DeepSeek-R1", tier: "max", input_per_million: 0.495, output_per_million: 2.365 },
];

const plans = [
  {
    id: "free",
    name: "Free",
    label: "FREE",
    price: "$0",
    priceDetail: "forever",
    badge: "bg-zinc-600",
    requestsPerDay: 50,
    checkoutUrl: "/auth/register",
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
    label: "LITE",
    price: "$10",
    priceDetail: "/month",
    badge: "bg-blue-600",
    requestsPerDay: 400,
    checkoutUrl: "https://whop.com/tropic-6587/routing-lite/",
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
    label: "PREMIUM",
    price: "$20",
    priceDetail: "/month",
    badge: "bg-indigo-600",
    requestsPerDay: 1000,
    checkoutUrl: "https://whop.com/tropic-6587/routing-premium/",
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
    label: "MAX",
    price: "$50",
    priceDetail: "/month",
    badge: "bg-violet-600",
    requestsPerDay: 2500,
    checkoutUrl: "https://whop.com/tropic-6587/routing-max/",
    features: [
      "2,500 requests per day",
      "All models access",
      "Fastest routing",
      "Dedicated support",
    ],
  },
];

export default function PricingPage() {
  const [copied, setCopied] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<string>("free");
  const { user } = useAuth();

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const filteredModels = staticModelPricing.filter(
    (m) => m.tier === selectedTier
  );

  const formatPrice = (perMillion: number) => {
    if (perMillion === 0) return "Free";
    return `$${perMillion.toFixed(3)}/M`;
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Simple, transparent pricing
          </h1>
          <p className="mt-4 text-lg text-gray-400">
            Choose the plan that fits your needs. All plans include access to our
            router.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-4">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={cn(
                "relative border-neutral-800 bg-neutral-900/50",
                plan.popular &&
                  "border-indigo-500 shadow-lg shadow-indigo-500/20"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-1 text-xs font-medium">
                    Most Popular
                  </Badge>
                </div>
              )}
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                  <Badge className={plan.badge} variant="secondary">
                    {plan.label}
                  </Badge>
                </div>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="ml-1 text-gray-400">{plan.priceDetail}</span>
                </div>
                <p className="mt-2 text-sm text-gray-400">
                  {plan.requestsPerDay} requests/day
                </p>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className={cn(
                    "mt-6 w-full",
                    plan.popular
                      ? "bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600"
                      : "bg-neutral-800 hover:bg-neutral-700"
                  )}
                  onClick={() =>
                    window.open(plan.checkoutUrl, "_blank")
                  }
                >
                  {plan.id === "free" ? "Get Started" : "Subscribe"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16">
          <Tabs
            value={selectedTier}
            onValueChange={setSelectedTier}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-4 bg-neutral-800">
              {plans.map((plan) => (
                <TabsTrigger
                  key={plan.id}
                  value={plan.id}
                  className={cn(
                    "data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-violet-500"
                  )}
                >
                  {plan.name}
                </TabsTrigger>
              ))}
            </TabsList>
            {plans.map((plan) => (
              <TabsContent key={plan.id} value={plan.id} className="mt-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-neutral-800 text-left text-sm text-gray-400">
                        <th className="pb-3 font-medium">Model</th>
                        <th className="pb-3 font-medium">Input</th>
                        <th className="pb-3 font-medium">Output</th>
                      </tr>
                    </thead>
                    <tbody>
                      {staticModelPricing
                        .filter((m) => m.tier === plan.id)
                        .map((model) => (
                          <tr
                            key={`${model.tier}-${model.model}`}
                            className="border-b border-neutral-800/50"
                          >
                            <td className="py-3 font-medium">{model.display_name}</td>
                            <td className="py-3 text-gray-400">
                              {formatPrice(model.input_per_million)}
                            </td>
                            <td className="py-3 text-gray-400">
                              {formatPrice(model.output_per_million)}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
}
