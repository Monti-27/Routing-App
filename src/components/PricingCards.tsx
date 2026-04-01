"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PricingCard } from "@/components/ui/pricing-card";
import { Zap, Cpu, Globe, Shield, ArrowRight } from "lucide-react";

const plans = [
  {
    title: "Hobby",
    price: "$0",
    priceDescription: "forever",
    description: "Perfect for experiments and small projects.",
    icon: <Zap className="h-6 w-6 text-yellow-500" />,
    features: [
      "100K tokens/month",
      "5 requests/minute",
      "Basic model routing",
      "Community support",
      "Standard analytics",
    ],
    buttonText: "Start Free",
    isPopular: false,
  },
  {
    title: "Pro",
    price: "$49",
    priceDescription: "/month",
    description: "For growing applications needing more power.",
    icon: <Cpu className="h-6 w-6 text-blue-500" />,
    features: [
      "10M tokens/month",
      "100 requests/minute",
      "All 50+ models",
      "Advanced routing (cost/latency)",
      "Priority email support",
      "Detailed analytics",
      "Webhooks",
    ],
    buttonText: "Get Started",
    isPopular: true,
  },
  {
    title: "Enterprise",
    price: undefined,
    priceDescription: "",
    description: "For organizations with custom requirements.",
    icon: <Globe className="h-6 w-6 text-purple-500" />,
    features: [
      "Unlimited tokens",
      "All 50+ models",
      "Custom routing logic",
      "24/7 dedicated support",
      "99.9% SLA",
      "Dedicated account manager",
      "On-premise deployment",
      "Custom integrations",
    ],
    buttonText: "Contact Sales",
    isPopular: false,
  },
];

const modelPricing = [
  { name: "GPT-4o", input: "$2.50", output: "$10.00" },
  { name: "Claude 3.5", input: "$3.00", output: "$15.00" },
  { name: "Gemini Pro", input: "$0.25", output: "$1.00" },
  { name: "Llama 3.1", input: "$0.20", output: "$0.40" },
  { name: "DeepSeek V3", input: "$0.14", output: "$0.28" },
  { name: "Qwen 2.5", input: "$0.10", output: "$0.20" },
];

export default function PricingCards() {
  return (
    <div className="w-full px-4 py-20 md:py-32">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-4">
            Pricing
          </p>
          <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start free, scale as you grow. No hidden fees, no surprises.
            Pay only for what you use beyond free tier.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20"
        >
          {plans.map((plan, i) => (
            <motion.div
              key={plan.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.1 }}
            >
              <PricingCard {...plan} />
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-16"
        >
          <div className="rounded-xl border bg-card p-8">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Model Pricing (per 1M tokens)</h2>
            </div>
            <p className="text-muted-foreground mb-8">
              Route your requests to the cheapest model that meets your quality requirements.
              Our intelligent routing automatically selects the best provider.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {modelPricing.map((model) => (
                <div key={model.name} className="rounded-lg bg-background p-4 text-center">
                  <p className="font-semibold mb-2">{model.name}</p>
                  <p className="text-xs text-muted-foreground">
                    In: {model.input}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Out: {model.output}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 rounded-lg bg-secondary/50 border border-border">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">Smart Routing:</span> Our system automatically routes requests to the most cost-effective model that meets your requirements. Save up to 80% compared to using a single provider.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <div className="rounded-xl bg-primary/10 border border-primary/20 p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Need a custom plan?</h2>
            <p className="text-muted-foreground mb-6">
              High volume usage? Enterprise features? On-premise deployment?
              We can build a custom solution for your needs.
            </p>
            <Button size="lg" className="gap-2">
              Talk to Sales <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
