"use client";

import { useEffect, useRef, useState } from "react";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  formatFn?: (value: number) => string;
  className?: string;
}

export function AnimatedCounter({
  value,
  duration = 1000,
  formatFn = (v) => v.toLocaleString(),
  className,
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const animationRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    startTimeRef.current = null;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(easeOut * value);

      setDisplayValue(current);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration]);

  return <span className={className}>{formatFn(displayValue)}</span>;
}

interface CountUpProps {
  value: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export function CountUp({ value, duration = 1500, className, prefix = "", suffix = "" }: CountUpProps) {
  return (
    <span className={className}>
      {prefix}
      <AnimatedCounter value={value} duration={duration} />
      {suffix}
    </span>
  );
}
