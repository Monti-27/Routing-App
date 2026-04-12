"use client";

import { useEffect, useMemo, useState } from "react";

import { cn } from "@/lib/utils";

const avatarPalettes = [
  ["#fe5608", "#fe5608", "#fe5608"],
  ["#99bcfa", "#99bcfa", "#99bcfa"],
  ["#ff9ce8", "#ff9ce8", "#ff9ce8"],
  ["#5bf3b6", "#5bf3b6", "#5bf3b6"],
  ["#fbf8a0", "#fbf8a0", "#fbf8a0"],
] as const;

const avatarFaces = [
  {
    name: "du",
    leftEye: "top-[31%] left-[28%] h-[10%] w-[10%] rounded-full",
    rightEye: "top-[31%] right-[28%] h-[10%] w-[10%] rounded-full",
    mouth:
      "bottom-[24%] left-1/2 h-[8%] w-[36%] -translate-x-1/2 rounded-full border-b-[2px] border-current",
  },
  {
    name: "milo",
    leftEye: "top-[30%] left-[26%] h-[4%] w-[12%] rounded-full",
    rightEye: "top-[30%] right-[26%] h-[4%] w-[12%] rounded-full",
    mouth:
      "bottom-[24%] left-1/2 h-[8%] w-[32%] -translate-x-1/2 rounded-full border-b-[2px] border-current",
  },
  {
    name: "zoe",
    leftEye: "top-[30%] left-[27%] h-[10%] w-[10%] rounded-full",
    rightEye: "top-[30%] right-[27%] h-[10%] w-[10%] rounded-full",
    mouth:
      "bottom-[24%] left-1/2 h-[12%] w-[32%] -translate-x-1/2 rounded-b-full border-x-[2px] border-b-[2px] border-current",
  },
  {
    name: "pip",
    leftEye: "top-[31%] left-[26%] h-[4%] w-[12%] -rotate-12 rounded-full",
    rightEye: "top-[31%] right-[26%] h-[4%] w-[12%] rotate-12 rounded-full",
    mouth:
      "bottom-[24%] left-1/2 h-[8%] w-[34%] -translate-x-1/2 rounded-full border-b-[2px] border-current",
  },
  {
    name: "frank",
    leftEye:
      "top-[29%] left-[24%] h-[12%] w-[12%] rounded-full border-[2px] border-white/92 bg-transparent",
    rightEye:
      "top-[29%] right-[24%] h-[12%] w-[12%] rounded-full border-[2px] border-white/92 bg-transparent",
    mouth:
      "bottom-[23%] left-1/2 h-[10%] w-[40%] -translate-x-1/2 rounded-full border-b-[3px] border-current",
  },
  {
    name: "bob",
    leftEye: "top-[32%] left-[25%] h-[5%] w-[14%] rounded-full bg-white/92",
    rightEye: "top-[32%] right-[25%] h-[5%] w-[14%] rounded-full bg-white/92",
    mouth:
      "bottom-[22%] left-1/2 h-[14%] w-[26%] -translate-x-1/2 rounded-b-[999px] border-x-[3px] border-b-[3px] border-current",
  },
] as const;

const BURST_DOTS = [
  { x: "-52%", y: "-28%" },
  { x: "0%", y: "-66%" },
  { x: "52%", y: "-28%" },
  { x: "68%", y: "12%" },
  { x: "38%", y: "58%" },
  { x: "-38%", y: "58%" },
  { x: "-68%", y: "12%" },
] as const;

const BURST_CLICK_COUNT = 3;
const avatarScaleByClickCount = [1, 1.35, 1.8] as const;

const getPaletteIndex = (seed: string) => {
  let hash = 0;

  for (const char of seed) {
    hash = (hash << 5) - hash + char.charCodeAt(0);
    hash |= 0;
  }

  return Math.abs(hash) % avatarPalettes.length;
};

type UserAvatarProps = {
  email?: string | null;
  name?: string | null;
  size?: number;
  className?: string;
  interactive?: boolean;
};

export function UserAvatar({
  email,
  name,
  size = 40,
  className,
  interactive = false,
}: UserAvatarProps) {
  const baseSeed = name?.trim() || email?.trim() || "routing-user";
  const basePaletteIndex = getPaletteIndex(baseSeed);
  const [clickCount, setClickCount] = useState(0);
  const [burstCount, setBurstCount] = useState(0);
  const [isBursting, setIsBursting] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setIsBlinking(true);

      window.setTimeout(() => {
        setIsBlinking(false);
      }, 140);
    }, 2600);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (!isBursting) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsBursting(false);
      setClickCount(0);
      setBurstCount((current) => current + 1);
    }, 520);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isBursting]);

  const paletteIndex = (basePaletteIndex + burstCount) % avatarPalettes.length;
  const faceIndex = (basePaletteIndex + burstCount) % avatarFaces.length;
  const colors = avatarPalettes[paletteIndex];
  const face = avatarFaces[faceIndex];
  const scale =
    avatarScaleByClickCount[clickCount] ?? avatarScaleByClickCount[0];

  const burstDotColors = useMemo(
    () => BURST_DOTS.map((_, index) => colors[index % colors.length]),
    [colors],
  );

  const handleClick = () => {
    if (!interactive || isBursting) {
      return;
    }

    if (clickCount >= BURST_CLICK_COUNT - 1) {
      setIsBursting(true);
      return;
    }

    setClickCount((current) => current + 1);
  };

  const avatarInner = (
    <>
      <span className="absolute inset-0 rounded-[inherit] overflow-hidden">
        <span className="absolute inset-[14%] rounded-[inherit] border border-white/20" />
        <span
          className={cn(
            "absolute bg-white/92 transition-all duration-150",
            face.leftEye,
            isBlinking ? "h-[3%]" : "",
          )}
        />
        <span
          className={cn(
            "absolute bg-white/92 transition-all duration-150",
            face.rightEye,
            isBlinking ? "h-[3%]" : "",
          )}
        />
        <span className={cn("absolute text-white/92", face.mouth)} />
      </span>
      {isBursting
        ? BURST_DOTS.map((dot, index) => (
            <span
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 h-[22%] w-[22%] rounded-full opacity-100"
              key={`${dot.x}-${dot.y}`}
              style={{
                backgroundColor: burstDotColors[index],
                boxShadow: `0 0 18px ${burstDotColors[index]}`,
                transform: `translate(calc(-50% + ${dot.x}), calc(-50% + ${dot.y})) scale(1)`,
                transition:
                  "transform 440ms cubic-bezier(0.22, 1, 0.36, 1), opacity 440ms ease",
              }}
            />
          ))
        : null}
    </>
  );

  const sharedClassName = cn(
    "relative inline-flex shrink-0 items-center justify-center rounded-lg font-medium text-white transition-transform duration-300 ease-out select-none",
    interactive ? "cursor-pointer overflow-visible" : "overflow-hidden",
    className,
  );

  const sharedStyle = {
    background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]}, ${colors[2]})`,
    height: size,
    width: size,
    boxShadow: interactive
      ? `0 10px 28px ${colors[1]}33, 0 0 0 1px ${colors[2]}22`
      : undefined,
    transform: `scale(${isBursting ? 2.35 : scale})`,
    opacity: isBursting ? 0 : 1,
  };

  if (interactive) {
    return (
      <button
        aria-label="Play with avatar"
        className={sharedClassName}
        onClick={handleClick}
        style={sharedStyle}
        type="button"
      >
        {avatarInner}
      </button>
    );
  }

  return (
    <span aria-hidden="true" className={sharedClassName} style={sharedStyle}>
      {avatarInner}
    </span>
  );
}
