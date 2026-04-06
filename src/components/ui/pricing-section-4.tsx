"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Sparkles } from "@/components/ui/sparkles";
import { TimelineContent } from "@/components/ui/timeline-animation";
import { VerticalCutReveal } from "@/components/ui/vertical-cut-reveal";
import { cn } from "@/lib/utils";
import NumberFlow from "@number-flow/react";
import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Free",
    description: "Perfect for getting started with AI routing",
    price: 0,
    yearlyPrice: 0,
    buttonText: "Start Free",
    buttonVariant: "outline" as const,
    badge: "bg-zinc-600",
    features: [
      "MiniMax-M2.7 & M2.5",
      "MiniMax-M2.5 Highspeed (~70 tps)",
      "Kimi-K2.5",
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
    name: "Lite",
    description: "Best for developers with moderate usage needs",
    price: 10,
    yearlyPrice: 96,
    buttonText: "Get Lite",
    buttonVariant: "outline" as const,
    badge: "bg-blue-600",
    features: [
      "Everything in Free",
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
    name: "Pro",
    description: "Most popular for professional development",
    price: 20,
    yearlyPrice: 192,
    buttonText: "Get Pro",
    buttonVariant: "default" as const,
    popular: true,
    badge: "bg-indigo-600",
    features: [
      "Everything in Lite",
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
    name: "Max",
    description: "Ultimate access for power users and teams",
    price: 50,
    yearlyPrice: 480,
    buttonText: "Get Max",
    buttonVariant: "outline" as const,
    badge: "bg-violet-600",
    features: [
      "Everything in Pro",
      "MiniMax-M2.7 Highspeed (~100 tps)",
      "Mimo-V2-Omni/Pro/Flash",
      "DeepSeek-V3.2-Speciale",
      "DeepSeek-R1",
      "Grok-4.20-Beta & Multi-Agent",
      "GLM-4.7 & GLM-4.7-Flash",
      "GLM-5-Highspeed (100 tps)",
      "Kimi-K2.5-Highspeed (100 tps)",
      "250 requests/hour",
      "Dedicated support",
    ],
  },
];

const PricingSwitch = ({ onSwitch }: { onSwitch: (value: string) => void }) => {
  const [selected, setSelected] = useState("0");

  const handleSwitch = (value: string) => {
    setSelected(value);
    onSwitch(value);
  };

  return (
    <div className="flex justify-center">
      <div className="relative z-10 mx-auto flex w-fit rounded-full bg-neutral-900 border border-gray-700 p-1">
        <button
          onClick={() => handleSwitch("0")}
          className={cn(
            "relative z-10 w-fit h-10 rounded-full sm:px-6 px-3 sm:py-2 py-1 font-medium transition-colors",
            selected === "0" ? "text-white" : "text-gray-200",
          )}
        >
          {selected === "0" && (
            <motion.span
              layoutId={"switch"}
              className="absolute top-0 left-0 h-10 w-full rounded-full border-4 shadow-sm shadow-indigo-600 border-indigo-600 bg-gradient-to-t from-indigo-500 to-indigo-600"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative">Monthly</span>
        </button>

        <button
          onClick={() => handleSwitch("1")}
          className={cn(
            "relative z-10 w-fit h-10 flex-shrink-0 rounded-full sm:px-6 px-3 sm:py-2 py-1 font-medium transition-colors",
            selected === "1" ? "text-white" : "text-gray-200",
          )}
        >
          {selected === "1" && (
            <motion.span
              layoutId={"switch"}
              className="absolute top-0 left-0 h-10 w-full rounded-full border-4 shadow-sm shadow-indigo-600 border-indigo-600 bg-gradient-to-t from-indigo-500 to-indigo-600"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative flex items-center gap-2">Yearly</span>
        </button>
      </div>
    </div>
  );
};

export default function PricingSection4() {
  const [isYearly, setIsYearly] = useState(false);
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

  const togglePricingPeriod = (value: string) =>
    setIsYearly(Number.parseInt(value) === 1);

  return (
    <div
      className="min-h-screen mx-auto relative bg-black overflow-x-hidden"
      ref={pricingRef}
    >
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
            data-border="true"
          ></div>
          <div
            className="absolute left-[-568px] right-[-568px] top-0 h-[2053px] flex-none rounded-full"
            style={{
              border: "200px solid #3131f5",
              filter: "blur(92px)",
              WebkitFilter: "blur(92px)",
            }}
            data-border="true"
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
            Plans that work best for you
          </VerticalCutReveal>
        </h2>

        <TimelineContent
          as="p"
          animationNum={0}
          timelineRef={pricingRef}
          customVariants={revealVariants}
          className="text-gray-400"
        >
          OpenAI-compatible API with automatic provider fallback. Choose the plan that fits your needs.
        </TimelineContent>

        <TimelineContent
          as="div"
          animationNum={1}
          timelineRef={pricingRef}
          customVariants={revealVariants}
        >
          <PricingSwitch onSwitch={togglePricingPeriod} />
        </TimelineContent>
      </article>

      <div
        className="absolute top-0 left-[10%] right-[10%] w-[80%] h-full z-0"
        style={{
          backgroundImage: `
        radial-gradient(circle at center, #4f46e5 0%, transparent 70%)
      `,
          opacity: 0.4,
          mixBlendMode: "multiply",
        }}
      />

      <div className="grid md:grid-cols-2 lg:grid-cols-4 max-w-6xl gap-4 py-6 mx-auto px-4">
        {plans.map((plan, index) => (
          <TimelineContent
            key={plan.name}
            as="div"
            animationNum={2 + index}
            timelineRef={pricingRef}
            customVariants={revealVariants}
          >
            <Card
              className={cn(
                "relative text-white border-neutral-800 h-full",
                plan.popular
                  ? "bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 shadow-[0px_-13px_300px_0px_#4f46e5] z-20 border-indigo-500/50"
                  : "bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 z-10"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-xs font-medium rounded-full">
                  Most Popular
                </div>
              )}
              
              <CardHeader className="text-left">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-2xl font-bold">{plan.name}</h3>
                  <span className={cn("px-2 py-0.5 text-xs font-medium rounded text-white", plan.badge)}>
                    {plan.name.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-baseline">
                  <span className="text-4xl font-semibold">
                    $
                    <NumberFlow
                      format={{
                        currency: "USD",
                      }}
                      value={isYearly ? plan.yearlyPrice : plan.price}
                      className="text-4xl font-semibold"
                    />
                  </span>
                  <span className="text-gray-400 ml-1">
                    /{isYearly ? "year" : "month"}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mb-4">{plan.description}</p>
              </CardHeader>

              <CardContent className="pt-0">
                <button
                  className={cn(
                    "w-full mb-6 p-4 text-lg font-medium rounded-xl transition-all",
                    plan.popular
                      ? "bg-gradient-to-t from-indigo-500 to-indigo-600 shadow-lg shadow-indigo-800 border border-indigo-500 text-white hover:from-indigo-600 hover:to-indigo-700"
                      : "bg-gradient-to-t from-neutral-800 to-neutral-700 shadow-lg shadow-neutral-900 border border-neutral-700 text-white hover:from-neutral-700 hover:to-neutral-600"
                  )}
                >
                  {plan.buttonText}
                </button>

                <div className="space-y-3 pt-4 border-t border-neutral-700">
                  <h4 className="font-medium text-sm mb-3 text-gray-300">
                    Includes:
                  </h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, featureIndex) => (
                      <li
                        key={featureIndex}
                        className="flex items-center gap-2"
                      >
                        <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                        <span className="text-sm text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TimelineContent>
        ))}
      </div>
    </div>
  );
}