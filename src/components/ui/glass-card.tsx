"use client";

import { cn } from "@/lib/utils";
import { motion } from "motion/react";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: "purple" | "amber" | "coral" | "mixed";
}

export function GlassCard({ children, className, hover = true, gradient = "mixed" }: GlassCardProps) {
  const gradientMap = {
    purple: "from-brand-purple/20 to-brand-purple/5",
    amber: "from-brand-amber/20 to-brand-amber/5",
    coral: "from-brand-coral/20 to-brand-coral/5",
    mixed: "from-brand-purple/10 via-brand-amber/5 to-brand-coral/10",
  };

  return (
    <motion.div
      whileHover={hover ? { y: -2, scale: 1.01 } : undefined}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden",
        "shadow-[0_8px_32px_rgba(0,0,0,0.12)]",
        "before:absolute before:inset-0 before:bg-gradient-to-br before:rounded-xl before:pointer-events-none",
        `before:bg-gradient-to-br ${gradientMap[gradient]}`,
        className
      )}
    >
      <div className="relative z-10">{children}</div>
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
    </motion.div>
  );
}

interface GlowCardProps {
  children: React.ReactNode;
  className?: string;
  color?: "purple" | "amber" | "coral";
  intensity?: "low" | "medium" | "high";
}

export function GlowCard({ children, className, color = "purple", intensity = "medium" }: GlowCardProps) {
  const colorMap = {
    purple: "brand-purple",
    amber: "brand-amber",
    coral: "brand-coral",
  };

  const intensityMap = {
    low: "blur-xl opacity-20",
    medium: "blur-2xl opacity-30",
    high: "blur-3xl opacity-40",
  };

  return (
    <div className={cn("relative rounded-xl overflow-hidden", className)}>
      <div
        className={cn(
          "absolute -inset-px rounded-xl bg-gradient-to-br from-white/10 to-transparent",
          "opacity-0 transition-opacity duration-300 hover:opacity-100"
        )}
      />
      <div
        className={cn(
          "absolute -top-20 -left-20 w-40 h-40 rounded-full",
          `bg-${colorMap[color]}`,
          intensityMap[intensity],
          "mix-blend-multiply filter blur-3xl"
        )}
      />
      <div
        className={cn(
          "absolute -bottom-20 -right-20 w-40 h-40 rounded-full",
          `bg-${colorMap[color]}`,
          intensityMap[intensity],
          "mix-blend-multiply filter blur-3xl"
        )}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}