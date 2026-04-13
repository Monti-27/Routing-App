"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const facehashThemes = {
  loading: {
    shell: "from-[#1470e3] via-[#8350e8] to-[#9dc4f4]",
    accent: "bg-white/90",
    mouth: "text-white",
  },
  thinking: {
    shell: "from-[#0f766e] via-[#14b8a6] to-[#99f6e4]",
    accent: "bg-white/90",
    mouth: "text-white",
  },
} as const;

type FacehashProps = {
  name: keyof typeof facehashThemes;
  size?: number;
  className?: string;
  enableBlink?: boolean;
  onRenderMouth?: () => ReactNode;
};

export function Facehash({
  name,
  size = 88,
  className,
  enableBlink = false,
  onRenderMouth,
}: FacehashProps) {
  const [isBlinking, setIsBlinking] = useState(false);
  const theme = facehashThemes[name];

  useEffect(() => {
    if (!enableBlink) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setIsBlinking(true);
      window.setTimeout(() => setIsBlinking(false), 140);
    }, 2400);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [enableBlink]);

  return (
    <div
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center rounded-[28px] bg-gradient-to-br shadow-[0_20px_60px_rgba(20,112,227,0.18)]",
        theme.shell,
        className,
      )}
      style={{ height: size, width: size }}
    >
      <span className="absolute inset-[10%] rounded-[24px] border border-white/20" />
      <span className="absolute inset-[12%] rounded-[22px] bg-black/10" />
      <span className="absolute inset-0 rounded-[inherit] bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.55),transparent_35%)]" />
      <span
        className={cn(
          "absolute left-[25%] top-[30%] w-[14%] rounded-full transition-all duration-150",
          theme.accent,
          isBlinking ? "h-[3%]" : "h-[14%]",
        )}
      />
      <span
        className={cn(
          "absolute right-[25%] top-[30%] w-[14%] rounded-full transition-all duration-150",
          theme.accent,
          isBlinking ? "h-[3%]" : "h-[14%]",
        )}
      />
      <div
        className={cn(
          "absolute bottom-[18%] left-1/2 flex h-[24%] w-[52%] -translate-x-1/2 items-center justify-center rounded-full bg-black/12",
          theme.mouth,
        )}
      >
        {onRenderMouth?.()}
      </div>
    </div>
  );
}
