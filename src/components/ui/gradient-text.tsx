"use client";

import { cn } from "@/lib/utils";

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  variant?: "brand" | "sunset" | "ocean" | "fire";
}

export function GradientText({ children, className, variant = "brand" }: GradientTextProps) {
  const variants = {
    brand: "bg-gradient-to-r from-brand-purple via-brand-coral to-brand-amber",
    sunset: "bg-gradient-to-r from-brand-coral via-brand-amber to-brand-purple",
    ocean: "bg-gradient-to-r from-brand-purple via-blue-400 to-brand-amber",
    fire: "bg-gradient-to-r from-brand-coral via-orange-500 to-brand-amber",
  };

  return (
    <span
      className={cn(
        "bg-clip-text text-transparent",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

interface ShimmerTextProps {
  children: React.ReactNode;
  className?: string;
}

export function ShimmerText({ children, className }: ShimmerTextProps) {
  return (
    <span className={cn("relative inline-block", className)}>
      <span className="relative z-10">{children}</span>
      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer bg-[length:200%_100%]" />
    </span>
  );
}

interface AnimatedGradientProps {
  children: React.ReactNode;
  className?: string;
  colors?: string[];
}

export function AnimatedGradient({ children, className, colors }: AnimatedGradientProps) {
  const defaultColors = ["#E3A514", "#B74677", "#453C7C", "#E3A514"];

  return (
    <span
      className={cn("bg-clip-text text-transparent", className)}
      style={{
        backgroundImage: `linear-gradient(90deg, ${(colors || defaultColors).join(", ")})`,
        backgroundSize: "200% 100%",
        animation: "gradient-shift 3s ease infinite",
      }}
    >
      {children}
    </span>
  );
}
