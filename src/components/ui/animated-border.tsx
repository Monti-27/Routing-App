"use client";

import { cn } from "@/lib/utils";
import { motion } from "motion/react";

interface AnimatedBorderProps {
  children: React.ReactNode;
  className?: string;
  color?: "purple" | "amber" | "coral" | "mixed";
  speed?: "slow" | "medium" | "fast";
}

export function AnimatedBorder({ children, className, color = "mixed", speed = "medium" }: AnimatedBorderProps) {
  const colors = {
    purple: "from-brand-purple via-brand-purple/50 to-brand-purple",
    amber: "from-brand-amber via-brand-amber/50 to-brand-amber",
    coral: "from-brand-coral via-brand-coral/50 to-brand-coral",
    mixed: "from-brand-purple via-brand-coral to-brand-amber",
  };

  const speeds = {
    slow: "animate-border-slow",
    medium: "animate-border-medium",
    fast: "animate-border-fast",
  };

  return (
    <div className={cn("relative rounded-xl overflow-hidden", className)}>
      <div
        className={cn(
          "absolute inset-0 rounded-xl bg-gradient-to-r p-[1px]",
          colors[color],
          speeds[speed]
        )}
        style={{
          backgroundSize: "200% 200%",
        }}
      />
      <div className="relative rounded-xl bg-background">{children}</div>
    </div>
  );
}

interface GlowingBorderProps {
  children: React.ReactNode;
  className?: string;
  color?: "purple" | "amber" | "coral";
}

export function GlowingBorder({ children, className, color = "purple" }: GlowingBorderProps) {
  const glowColors = {
    purple: "shadow-[0_0_15px_rgba(69,60,124,0.5),0_0_30px_rgba(69,60,124,0.3)]",
    amber: "shadow-[0_0_15px_rgba(227,165,20,0.5),0_0_30px_rgba(227,165,20,0.3)]",
    coral: "shadow-[0_0_15px_rgba(183,70,119,0.5),0_0_30px_rgba(183,70,119,0.3)]",
  };

  return (
    <motion.div
      whileHover={{
        boxShadow: `0 0 25px rgba(${
          color === "purple" ? "69,60,124" : color === "amber" ? "227,165,20" : "183,70,119"
        },0.6)`,
      }}
      transition={{ duration: 0.3 }}
      className={cn(
        "relative rounded-xl border border-white/10 bg-background p-4",
        glowColors[color],
        className
      )}
    >
      {children}
    </motion.div>
  );
}

interface GradientBorderButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: "purple" | "amber" | "coral";
}

export function GradientBorderButton({ children, onClick, className, variant = "purple" }: GradientBorderButtonProps) {
  const variants = {
    purple: "from-brand-purple via-brand-coral to-brand-purple",
    amber: "from-brand-amber via-brand-coral to-brand-amber",
    coral: "from-brand-coral via-brand-purple to-brand-coral",
  };

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative px-6 py-2 rounded-lg font-medium text-sm overflow-hidden",
        className
      )}
    >
      <span
        className="absolute inset-0 rounded-lg p-[2px] bg-gradient-to-r"
        style={{ backgroundImage: `linear-gradient(90deg, ${variants[variant]})` }}
      />
      <span className="relative z-10 bg-background rounded-[5px] px-4 py-1">{children}</span>
    </motion.button>
  );
}
