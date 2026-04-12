"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { Check } from "lucide-react";
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
  { model: "route/kimi-k2.5", display_name: "Kimi-K2.5", tier: "free", input_per_million: 0.462, output_per_million: 2.42 },
  { model: "route/glm-5", display_name: "GLM-5", tier: "free", input_per_million: 0.792, output_per_million: 2.53 },

  // Lite tier models (includes free models)
  { model: "route/minimax-m2.5", display_name: "MiniMax-M2.5", tier: "lite", input_per_million: 0.193, output_per_million: 1.238 },
  { model: "route/kimi-k2.5", display_name: "Kimi-K2.5", tier: "lite", input_per_million: 0.462, output_per_million: 2.42 },
  { model: "route/minimax-m2.7-highspeed", display_name: "MiniMax-M2.7-Highspeed", tier: "lite", input_per_million: 0.33, output_per_million: 1.32 },
  { model: "route/kimi-k2.5-highspeed", display_name: "Kimi-K2.5-Highspeed", tier: "lite", input_per_million: 0.6468, output_per_million: 3.388 },
  { model: "route/glm-5", display_name: "GLM-5", tier: "lite", input_per_million: 0.792, output_per_million: 2.53 },
  { model: "route/glm-5.1", display_name: "GLM-5.1", tier: "lite", input_per_million: 1.00, output_per_million: 3.00 },
  { model: "route/glm-5.1-precision", display_name: "GLM-5.1-Precision", tier: "lite", input_per_million: 1.20, output_per_million: 3.50 },
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
    badge: "bg-zinc-700 text-white dark:bg-zinc-700",
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
    badge: "bg-[#1470e3] text-white",
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
    badge: "bg-[#1470e3] text-white",
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
    badge: "bg-[#8350e8] text-white",
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

const pricingCardVariants = {
  initial: { scale: 1, y: 0 },
  hover: {
    scale: 1.02,
    y: -5,
    transition: { type: "spring" as const, stiffness: 300, damping: 20 },
  },
};

function DashboardPricingCard({
  plan,
}: {
  plan: (typeof plans)[number];
}) {
  return (
    <motion.div
      variants={pricingCardVariants}
      initial="initial"
      whileHover="hover"
      className={cn(
        "relative flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-8 text-zinc-950 shadow-sm dark:border-zinc-800 dark:bg-[#181818] dark:text-white",
        plan.popular && "border-[#8350e8]/45 shadow-lg shadow-[#8350e8]/15",
      )}
    >
      {plan.popular ? (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-[linear-gradient(135deg,#1470e3,#8350e8)] px-4 py-1 text-sm font-medium text-white">
          Most Popular
        </div>
      ) : null}

      <div className="flex flex-col space-y-6">
        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-2xl font-bold">{plan.name}</h3>
            <Badge className={plan.badge} variant="secondary">
              {plan.label}
            </Badge>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-bold">{plan.price}</span>
            <span className="ml-1 text-zinc-500 dark:text-gray-400">
              {plan.priceDetail}
            </span>
          </div>
          <p className="mt-3 text-zinc-500 dark:text-gray-400">
            {plan.requestsPerDay} requests/day
          </p>
        </div>

        <ul className="space-y-3">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-center gap-3">
              <Check className="h-5 w-5 shrink-0 text-[#1470e3] dark:text-[#9dc4f4]" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8">
        <Button
          className={cn(
            "w-full",
            plan.popular
              ? "bg-[linear-gradient(135deg,#1470e3,#8350e8)] text-white hover:opacity-95"
              : "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200",
          )}
          onClick={() => window.open(plan.checkoutUrl, "_blank")}
        >
          {plan.id === "free" ? "Get Started" : "Subscribe"}
        </Button>
      </div>
    </motion.div>
  );
}

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
    <div className="min-h-screen bg-[#f7f7f7] text-zinc-950 dark:bg-[#141414] dark:text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Simple, transparent pricing
          </h1>
          <p className="mt-4 text-lg text-zinc-500 dark:text-gray-400">
            Choose the plan that fits your needs. All plans include access to our
            router.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-4">
          {plans.map((plan) => (
            <DashboardPricingCard key={plan.id} plan={plan} />
          ))}
        </div>

        <div className="mt-16">
          <Tabs
            value={selectedTier}
            onValueChange={setSelectedTier}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-4 border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-[#181818]">
              {plans.map((plan) => (
                <TabsTrigger
                  key={plan.id}
                  value={plan.id}
                  className={cn(
                    "data-[state=active]:bg-[linear-gradient(135deg,#1470e3,#8350e8)] data-[state=active]:text-white"
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
                      <tr className="border-b border-zinc-200 text-left text-sm text-zinc-500 dark:border-zinc-800 dark:text-gray-400">
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
                            className="border-b border-zinc-200/80 dark:border-zinc-800/50"
                          >
                            <td className="py-3 font-medium">{model.display_name}</td>
                            <td className="py-3 text-zinc-500 dark:text-gray-400">
                              {formatPrice(model.input_per_million)}
                            </td>
                            <td className="py-3 text-zinc-500 dark:text-gray-400">
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
