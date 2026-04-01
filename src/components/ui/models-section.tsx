"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Sparkles } from "@/components/ui/sparkles";
import { TimelineContent } from "@/components/ui/timeline-animation";
import { VerticalCutReveal } from "@/components/ui/vertical-cut-reveal";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { Check, Zap, Sparkles as SparklesIcon, Crown, Rocket, Cpu } from "lucide-react";

const modelLogos: Record<string, { logo: string; name: string; provider: string }> = {
  "route/minimax-m2.5": { logo: "/model-logos/route-minimax.png", name: "MiniMax-M2.5", provider: "MiniMax" },
  "route/minimax-m2.7": { logo: "/model-logos/route-minimax.png", name: "MiniMax-M2.7", provider: "MiniMax" },
  "route/minimax-m2.5-highspeed": { logo: "/model-logos/route-minimax.png", name: "MiniMax-M2.5 Highspeed", provider: "MiniMax" },
  "route/minimax-m2.7-highspeed": { logo: "/model-logos/route-minimax.png", name: "MiniMax-M2.7 Highspeed", provider: "MiniMax" },
  "route/kimi-k2.5": { logo: "/model-logos/route-kimi.png", name: "Kimi-K2.5", provider: "Kimi" },
  "route/nemotron-3-super-120b": { logo: "/model-logos/route-nvidia.svg", name: "Nemotron-3-Super-120B", provider: "NVIDIA" },
  "route/nemotron-3-nano-30b": { logo: "/model-logos/route-nvidia.svg", name: "Nemotron-3-Nano-30B", provider: "NVIDIA" },
  "route/trinity-large-preview": { logo: "/model-logos/route-arcee.png", name: "Trinity-Large-Preview", provider: "Arcee" },
  "route/glm-4.5-air": { logo: "/model-logos/route-zai.svg", name: "GLM-4.5-Air", provider: "ZAI" },
  "route/glm-4.5-airx": { logo: "/model-logos/route-zai.svg", name: "GLM-4.5-AirX", provider: "ZAI" },
  "route/glm-4.5-flash": { logo: "/model-logos/route-zai.svg", name: "GLM-4.5-Flash", provider: "ZAI" },
  "route/glm-4.7-flashx": { logo: "/model-logos/route-zai.svg", name: "GLM-4.7-FlashX", provider: "ZAI" },
  "route/glm-4.6v-flashx": { logo: "/model-logos/route-zai.svg", name: "GLM-4.6V-FlashX", provider: "ZAI" },
  "route/glm-5": { logo: "/model-logos/route-zai.svg", name: "GLM-5", provider: "ZAI" },
  "route/glm-5-turbo": { logo: "/model-logos/route-zai.svg", name: "GLM-5-Turbo", provider: "ZAI" },
  "route/qwen3-coder": { logo: "/model-logos/route-qwen.png", name: "Qwen3-Coder", provider: "Qwen" },
  "route/qwen3-coder-next": { logo: "/model-logos/route-qwen.png", name: "Qwen3-Coder-Next", provider: "Qwen" },
  "route/qwen3-32b": { logo: "/model-logos/route-qwen.png", name: "Qwen3-32B", provider: "Qwen" },
  "route/qwen3.6-plus-preview": { logo: "/model-logos/route-qwen.png", name: "Qwen3.6-Plus-Preview", provider: "Qwen" },
  "route/qwen3-next-80b": { logo: "/model-logos/route-qwen.png", name: "Qwen3-Next-80B", provider: "Qwen" },
  "route/gpt-oss-120b": { logo: "/model-logos/route-openai.svg", name: "GPT-OSS-120B", provider: "OpenAI" },
  "route/hermes-3-llama-3.1-405b": { logo: "/model-logos/route-nous.png", name: "Hermes-3-Llama-3.1-405B", provider: "Nous" },
  "route/llama-3.2-3b-instruct": { logo: "/model-logos/route-meta.png", name: "Llama-3.2-3B-Instruct", provider: "Meta" },
  "route/gemma-3-27b-it": { logo: "/model-logos/route-google.png", name: "Gemma-3-27B-IT", provider: "Google" },
  "route/deepseek-v3.2": { logo: "/model-logos/route-deepseek.png", name: "DeepSeek-V3.2", provider: "DeepSeek" },
  "route/deepseek-v3.2-speciale": { logo: "/model-logos/route-deepseek.png", name: "DeepSeek-V3.2-Speciale", provider: "DeepSeek" },
  "route/deepseek-r1": { logo: "/model-logos/route-deepseek.png", name: "DeepSeek-R1", provider: "DeepSeek" },
  "route/grok-4-fast": { logo: "/model-logos/route-xai.png", name: "Grok-4-Fast", provider: "xAI" },
  "route/grok-4.20-beta": { logo: "/model-logos/route-xai.png", name: "Grok-4.20-Beta", provider: "xAI" },
  "route/grok-4.20-multi-agent-beta": { logo: "/model-logos/route-xai.png", name: "Grok-4.20-Multi-Agent-Beta", provider: "xAI" },
  "route/mimo-v2-omni": { logo: "/model-logos/route-xiaomi.png", name: "Mimo-V2-Omni", provider: "Xiaomi" },
  "route/mimo-v2-pro": { logo: "/model-logos/route-xiaomi.png", name: "Mimo-V2-Pro", provider: "Xiaomi" },
  "route/mimo-v2-flash": { logo: "/model-logos/route-xiaomi.png", name: "Mimo-V2-Flash", provider: "Xiaomi" },
  "route/minimax-image-1": { logo: "/model-logos/route-minimax.png", name: "MiniMax-Image-1", provider: "MiniMax" },
};

const plans = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    icon: <Rocket className="h-5 w-5" />,
    badge: "bg-zinc-600",
    requestsPerHour: 5,
    credits: 5,
    models: [
      "route/minimax-m2.5",
      "route/minimax-m2.5-highspeed",
      "route/kimi-k2.5",
      "route/minimax-m2.7",
      "route/nemotron-3-super-120b",
      "route/trinity-large-preview",
      "route/nemotron-3-nano-30b",
      "route/gpt-oss-120b",
      "route/hermes-3-llama-3.1-405b",
      "route/llama-3.2-3b-instruct",
      "route/gemma-3-27b-it",
    ],
  },
  {
    id: "lite",
    name: "Lite",
    price: "$10",
    icon: <Zap className="h-5 w-5" />,
    badge: "bg-blue-600",
    requestsPerHour: 40,
    credits: 30,
    models: [
      "route/minimax-m2.5",
      "route/minimax-m2.5-highspeed",
      "route/kimi-k2.5",
      "route/minimax-m2.7",
      "route/nemotron-3-super-120b",
      "route/trinity-large-preview",
      "route/nemotron-3-nano-30b",
      "route/gpt-oss-120b",
      "route/hermes-3-llama-3.1-405b",
      "route/llama-3.2-3b-instruct",
      "route/gemma-3-27b-it",
      "route/glm-5",
      "route/glm-5-turbo",
      "route/deepseek-v3.2",
      "route/qwen3-32b",
      "route/qwen3.6-plus-preview",
      "route/qwen3-next-80b",
      "route/minimax-image-1",
    ],
  },
  {
    id: "premium",
    name: "Pro",
    price: "$20",
    icon: <SparklesIcon className="h-5 w-5" />,
    badge: "bg-indigo-600",
    requestsPerHour: 100,
    credits: 60,
    popular: true,
    models: [
      "route/minimax-m2.5",
      "route/minimax-m2.5-highspeed",
      "route/kimi-k2.5",
      "route/minimax-m2.7",
      "route/grok-4-fast",
      "route/nemotron-3-super-120b",
      "route/trinity-large-preview",
      "route/glm-4.5-air",
      "route/nemotron-3-nano-30b",
      "route/qwen3-coder",
      "route/gpt-oss-120b",
      "route/hermes-3-llama-3.1-405b",
      "route/llama-3.2-3b-instruct",
      "route/gemma-3-27b-it",
      "route/glm-5",
      "route/glm-5-turbo",
      "route/glm-4.5-airx",
      "route/glm-4.5-flash",
      "route/glm-4.7-flashx",
      "route/glm-4.6v-flashx",
      "route/deepseek-v3.2",
      "route/qwen3-coder-next",
      "route/qwen3-32b",
      "route/qwen3.6-plus-preview",
      "route/qwen3-next-80b",
      "route/grok-4.20-beta",
      "route/grok-4.20-multi-agent-beta",
      "route/minimax-image-1",
    ],
  },
  {
    id: "max",
    name: "Max",
    price: "$50",
    icon: <Crown className="h-5 w-5" />,
    badge: "bg-violet-600",
    requestsPerHour: 250,
    credits: 150,
    allModels: true,
    models: [],
  },
];

export default function ModelsPage() {
  const [selectedPlan, setSelectedPlan] = useState("premium");
  const pricingRef = useRef<HTMLDivElement>(null);

  const revealVariants = {
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        delay: i * 0.4,
        duration: 0.5,
      },
    }),
    hidden: {
      filter: "blur(10px)",
      y: -20,
      opacity: 0,
    },
  };

  const selectedPlanData = plans.find(p => p.id === selectedPlan) || plans[3];

  return (
    <div className="min-h-screen mx-auto relative bg-black overflow-x-hidden" ref={pricingRef}>
      <TimelineContent
        animationNum={4}
        timelineRef={pricingRef}
        customVariants={revealVariants}
        className="absolute top-0 h-96 w-screen overflow-hidden [mask-image:radial-gradient(50%_50%,white,transparent)]"
      >
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#ffffff2c_1px,transparent_1px),linear-gradient(to_bottom,#3a3a3a01_1px,transparent_1px)] bg-[size:70px_80px]"></div>
        <Sparkles
          density={1800}
          direction="bottom"
          speed={1}
          color="#FFFFFF"
          className="absolute inset-x-0 bottom-0 h-full w-full [mask-image:radial-gradient(50%_50%,white,transparent_85%)]"
        />
      </TimelineContent>
      <TimelineContent
        animationNum={5}
        timelineRef={pricingRef}
        customVariants={revealVariants}
        className="absolute left-0 top-[-114px] w-full h-[113.625vh] flex flex-col items-start justify-start content-start flex-none flex-nowrap gap-2.5 overflow-hidden p-0 z-0"
      >
        <div className="framer-1i5axl2">
          <div
            className="absolute left-[-568px] right-[-568px] top-0 h-[2053px] flex-none rounded-full"
            style={{
              border: "200px solid #3131f5",
              filter: "blur(92px)",
              WebkitFilter: "blur(92px)",
            }}
          ></div>
          <div
            className="absolute left-[-568px] right-[-568px] top-0 h-[2053px] flex-none rounded-full"
            style={{
              border: "200px solid #3131f5",
              filter: "blur(92px)",
              WebkitFilter: "blur(92px)",
            }}
          ></div>
        </div>
      </TimelineContent>

      <article className="text-center mb-6 pt-20 max-w-3xl mx-auto space-y-2 relative z-50">
        <h2 className="text-4xl font-medium text-white">
          <VerticalCutReveal
            splitBy="words"
            staggerDuration={0.15}
            staggerFrom="first"
            reverse={true}
            containerClassName="justify-center"
            transition={{
              type: "spring",
              stiffness: 250,
              damping: 40,
              delay: 0,
            }}
          >
            All Available Models
          </VerticalCutReveal>
        </h2>

        <TimelineContent
          as="p"
          animationNum={0}
          timelineRef={pricingRef}
          customVariants={revealVariants}
          className="text-gray-400"
        >
          Choose the plan that unlocks the models you need. All plans include our OpenAI-compatible API.
        </TimelineContent>
      </article>

      <div
        className="absolute top-0 left-[10%] right-[10%] w-[80%] h-full z-0"
        style={{
          backgroundImage: `radial-gradient(circle at center, #4f46e5 0%, transparent 70%)`,
          opacity: 0.4,
          mixBlendMode: "multiply",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 py-12 relative z-10">
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {plans.map((plan) => (
            <button
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all",
                selectedPlan === plan.id
                  ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/30"
                  : "bg-neutral-800 text-gray-300 hover:bg-neutral-700 border border-neutral-700"
              )}
            >
              <span className={cn(selectedPlan === plan.id && "text-white")}>{plan.icon}</span>
              {plan.name}
            </button>
          ))}
        </div>

        {plans.map((plan) => (
          <div key={plan.id} className={cn(selectedPlan === plan.id ? "block" : "hidden")}>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
              <div className="bg-neutral-800/50 rounded-xl p-4 text-center border border-neutral-700">
                <p className="text-2xl font-bold text-white">{plan.price}</p>
                <p className="text-xs text-gray-400">per month</p>
              </div>
              <div className="bg-neutral-800/50 rounded-xl p-4 text-center border border-neutral-700">
                <p className="text-2xl font-bold text-white">{plan.requestsPerHour}</p>
                <p className="text-xs text-gray-400">requests/hour</p>
              </div>
              <div className="bg-neutral-800/50 rounded-xl p-4 text-center border border-neutral-700">
                <p className="text-2xl font-bold text-white">${plan.credits}</p>
                <p className="text-xs text-gray-400">credits/month</p>
              </div>
              <div className="bg-neutral-800/50 rounded-xl p-4 text-center border border-neutral-700">
                <p className="text-2xl font-bold text-white">{(plan as any).burst || plan.requestsPerHour / 2}</p>
                <p className="text-xs text-gray-400">burst</p>
              </div>
              <div className="bg-neutral-800/50 rounded-xl p-4 text-center border border-neutral-700">
                <p className="text-2xl font-bold text-white">
                  {plan.allModels ? "ALL" : plan.models.length}
                </p>
                <p className="text-xs text-gray-400">models</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plan.allModels ? (
                <>
                  {Object.entries(modelLogos).map(([key, model]) => (
                    <div
                      key={key}
                      className="flex items-center gap-4 p-4 rounded-xl bg-neutral-800/30 border border-neutral-700/50 hover:border-indigo-500/30 transition-all hover:bg-neutral-800/50"
                    >
                      <img
                        src={model.logo}
                        alt={model.name}
                        className="w-12 h-12 object-contain rounded-lg bg-white/5 p-1"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold truncate">{model.name}</p>
                        <p className="text-xs text-gray-500">{model.provider}</p>
                      </div>
                      <Check className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                    </div>
                  ))}
                </>
              ) : (
                <>
                  {plan.models.map((modelKey) => {
                    const model = modelLogos[modelKey];
                    if (!model) return null;
                    return (
                      <div
                        key={modelKey}
                        className="flex items-center gap-4 p-4 rounded-xl bg-neutral-800/30 border border-neutral-700/50 hover:border-indigo-500/30 transition-all hover:bg-neutral-800/50"
                      >
                        <img
                          src={model.logo}
                          alt={model.name}
                          className="w-12 h-12 object-contain rounded-lg bg-white/5 p-1"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold truncate">{model.name}</p>
                          <p className="text-xs text-gray-500">{model.provider}</p>
                        </div>
                        <Check className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl border border-neutral-800 bg-gradient-to-br from-neutral-900 to-neutral-900/50 p-8 text-center"
        >
          <Cpu className="h-12 w-12 text-indigo-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">OpenAI-Compatible API</h3>
          <p className="text-gray-400 mb-6">
            All models work with the OpenAI API format. Simply change the base URL to start using any of these models.
          </p>
          <div className="bg-neutral-800 rounded-xl p-4 text-left">
            <code className="text-sm text-emerald-400 font-mono">
              curl https://api.routing.run/v1/chat/completions \<br />
              &nbsp;&nbsp;-H "Authorization: Bearer $API_KEY" \<br />
              &nbsp;&nbsp;-H "Content-Type: application/json" \<br />
              &nbsp;&nbsp;-d '&#123;"model": "route/minimax-m2.7", "messages": [&#123;"role": "user", "content": "Hello!"&#125;]&#125;'
            </code>
          </div>
        </motion.div>
      </div>
    </div>
  );
}