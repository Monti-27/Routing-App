"use client";

import { motion, useReducedMotion } from "framer-motion";

type UsageSummaryCardProps = {
  leftLabel: string;
  rightLabel: string;
  leftValue: number;
  rightValue: number;
  totalLabel?: string;
  leftAccent?: string;
  rightAccent?: string;
  borderColor?: string;
  backgroundColor?: string;
  outerDotsCount?: number;
  innerDotsCount?: number;
  enableAnimations?: boolean;
  formatValue?: (value: number) => string;
};

const defaultFormatValue = (value: number) =>
  new Intl.NumberFormat("en-US", {
    notation: value >= 1000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);

const DOTS_VIEWBOX_SIZE = 448;
const DOTS_CENTER = DOTS_VIEWBOX_SIZE / 2;

export function UsageSummaryCard({
  leftLabel,
  rightLabel,
  leftValue,
  rightValue,
  totalLabel = "Total usage",
  leftAccent = "#0ea5e9",
  rightAccent = "#ef4444",
  borderColor = "border-border/50",
  backgroundColor = "bg-card",
  outerDotsCount = 48,
  innerDotsCount = 36,
  enableAnimations = true,
  formatValue = defaultFormatValue,
}: UsageSummaryCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const shouldAnimate = enableAnimations && !shouldReduceMotion;

  const generateDots = (
    count: number,
    radius: number,
    centerX: number,
    centerY: number,
  ) => {
    const dots = [];

    for (let index = 0; index < count; index += 1) {
      const angle = (index / count) * 2 * Math.PI;
      const x = Math.round((centerX + radius * Math.cos(angle)) * 1000) / 1000;
      const y = Math.round((centerY + radius * Math.sin(angle)) * 1000) / 1000;
      dots.push({ x, y, delay: index * 0.02 });
    }

    return dots;
  };

  const outerDots = generateDots(outerDotsCount, 185, DOTS_CENTER, DOTS_CENTER);
  const innerDots = generateDots(innerDotsCount, 155, DOTS_CENTER, DOTS_CENTER);

  const containerVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 30,
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const dotVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: {
      opacity: 0.6,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const,
      },
    },
  };

  const totalValue = leftValue + rightValue;
  const leftShare = totalValue > 0 ? (leftValue / totalValue) * 100 : 0;
  const rightShare = totalValue > 0 ? (rightValue / totalValue) * 100 : 0;

  return (
    <motion.div
      animate="visible"
      className="w-full"
      initial={shouldAnimate ? "hidden" : "visible"}
      variants={shouldAnimate ? containerVariants : {}}
    >
      <motion.div
        className={`${backgroundColor} ${borderColor} overflow-hidden rounded-xl border shadow-sm`}
      >
          <div className="relative overflow-hidden px-5 pb-4 pt-8">
          <div
            className={`absolute inset-0 ${backgroundColor} rounded-lg backdrop-blur-[2px]`}
          />

          <div className="relative mx-auto h-[24rem] w-[24rem] max-w-full">
            <svg className="h-full w-full" viewBox="0 0 448 448">
              {outerDots.map((dot, index) => (
                <motion.circle
                  animate="visible"
                  cx={dot.x}
                  cy={dot.y}
                  fill="currentColor"
                  initial="hidden"
                  key={`outer-${index}`}
                  r="10"
                  style={{ color: leftAccent }}
                  transition={{ delay: dot.delay }}
                  variants={shouldAnimate ? dotVariants : {}}
                />
              ))}

              {innerDots.map((dot, index) => (
                <motion.circle
                  animate="visible"
                  cx={dot.x}
                  cy={dot.y}
                  fill="currentColor"
                  initial="hidden"
                  key={`inner-${index}`}
                  r="10"
                  style={{ color: rightAccent }}
                  transition={{ delay: dot.delay }}
                  variants={shouldAnimate ? dotVariants : {}}
                />
              ))}
            </svg>

            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="text-center" style={{ zIndex: 20 }}>
                <motion.div
                  animate={shouldAnimate ? { opacity: 1, y: 0, scale: 1 } : {}}
                  className="mb-2 text-xl font-medium text-foreground"
                  initial={shouldAnimate ? { opacity: 0, y: -10, scale: 0.95 } : {}}
                  transition={{
                    delay: 0.3,
                    type: "spring",
                    stiffness: 400,
                    damping: 25,
                    mass: 0.6,
                  }}
                >
                  {totalLabel}
                </motion.div>
                <motion.div
                  animate={
                    shouldAnimate
                      ? { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }
                      : {}
                  }
                  className="text-5xl font-bold text-foreground"
                  initial={
                    shouldAnimate
                      ? { opacity: 0, y: 20, scale: 0.8, filter: "blur(4px)" }
                      : {}
                  }
                  transition={{
                    delay: 0.5,
                    type: "spring",
                    stiffness: 300,
                    damping: 28,
                    mass: 0.8,
                  }}
                >
                  {formatValue(totalValue)}
                </motion.div>
              </div>
            </div>
          </div>

          <div
            className="pointer-events-none absolute -inset-4 rounded-xl"
            style={{
              background:
                "linear-gradient(to bottom, transparent 0%, transparent 35%, rgb(from var(--card) r g b / 0.8) 45%, rgb(from var(--card) r g b / 0.9) 55%, rgb(from var(--card) r g b / 1) 65%)",
              zIndex: 5,
            }}
          />

          <div className="absolute bottom-0 left-0 right-0 px-6 pb-2 pt-4" style={{ zIndex: 10 }}>
            <div className="mb-4 flex items-start justify-between">
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={shouldAnimate ? { opacity: 1, scaleY: 1 } : {}}
                    className="h-4 w-0.5 rounded-full"
                    initial={shouldAnimate ? { opacity: 0, scaleY: 0 } : {}}
                    style={{ backgroundColor: leftAccent }}
                    transition={{ delay: 0.4, type: "spring" }}
                  />
                  <motion.div
                    animate={shouldAnimate ? { opacity: 1, y: 0 } : {}}
                    className="text-sm font-medium text-muted-foreground"
                    initial={shouldAnimate ? { opacity: 0, y: 20 } : {}}
                    transition={{ delay: 0.5 }}
                  >
                    {leftLabel}
                  </motion.div>
                </div>
                <div className="flex flex-col">
                  <motion.div
                    animate={shouldAnimate ? { opacity: 1, y: 0 } : {}}
                    className="text-left text-xl font-bold text-foreground"
                    initial={shouldAnimate ? { opacity: 0, y: -10 } : {}}
                    transition={{ delay: 0.6 }}
                  >
                    {formatValue(leftValue)}
                  </motion.div>
                  <motion.div
                    animate={shouldAnimate ? { opacity: 1, y: 0 } : {}}
                    className="text-left text-xs font-medium"
                    initial={shouldAnimate ? { opacity: 0, y: -10 } : {}}
                    style={{ color: leftAccent }}
                    transition={{ delay: 0.7 }}
                  >
                    {leftShare.toFixed(1)}%
                  </motion.div>
                </div>
              </div>

              <div className="mb-2 flex flex-col items-center gap-2">
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={shouldAnimate ? { opacity: 1, scaleY: 1 } : {}}
                    className="h-4 w-0.5 rounded-full"
                    initial={shouldAnimate ? { opacity: 0, scaleY: 0 } : {}}
                    style={{ backgroundColor: rightAccent }}
                    transition={{ delay: 0.8, type: "spring" }}
                  />
                  <motion.div
                    animate={shouldAnimate ? { opacity: 1, y: 0 } : {}}
                    className="text-sm font-medium text-muted-foreground"
                    initial={shouldAnimate ? { opacity: 0, y: 20 } : {}}
                    transition={{ delay: 0.9 }}
                  >
                    {rightLabel}
                  </motion.div>
                </div>
                <div className="flex flex-col">
                  <motion.div
                    animate={shouldAnimate ? { opacity: 1, y: 0 } : {}}
                    className="text-left text-xl font-bold text-foreground"
                    initial={shouldAnimate ? { opacity: 0, y: -10 } : {}}
                    transition={{ delay: 1 }}
                  >
                    {formatValue(rightValue)}
                  </motion.div>
                  <motion.div
                    animate={shouldAnimate ? { opacity: 1, y: 0 } : {}}
                    className="text-left text-xs font-medium"
                    initial={shouldAnimate ? { opacity: 0, y: -10 } : {}}
                    style={{ color: rightAccent }}
                    transition={{ delay: 1.1 }}
                  >
                    {rightShare.toFixed(1)}%
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
