"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

const DOT_MATRIX: Record<string, number[][]> = {
  "0": [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,1,1],[1,0,1,0,1],[1,1,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
  "1": [[0,0,1,0,0],[0,1,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,1,1,1,0]],
  "2": [[0,1,1,1,0],[1,0,0,0,1],[0,0,0,0,1],[0,0,0,1,0],[0,0,1,0,0],[0,1,0,0,0],[1,1,1,1,1]],
  "3": [[0,1,1,1,0],[1,0,0,0,1],[0,0,0,0,1],[0,0,1,1,0],[0,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
  "4": [[0,0,0,1,0],[0,0,1,1,0],[0,1,0,1,0],[1,0,0,1,0],[1,1,1,1,1],[0,0,0,1,0],[0,0,0,1,0]],
  "5": [[1,1,1,1,1],[1,0,0,0,0],[1,1,1,1,0],[0,0,0,0,1],[0,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
  "6": [[0,1,1,1,0],[1,0,0,0,0],[1,0,0,0,0],[1,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
  "7": [[1,1,1,1,1],[0,0,0,0,1],[0,0,0,1,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0]],
  "8": [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
  "9": [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,1],[0,0,0,0,1],[0,0,0,0,1],[0,1,1,1,0]],
  ",": [[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,1,0],[1,0,0]],
  "/": [[0,0,0,1],[0,0,1,0],[0,0,1,0],[0,1,0,0],[0,1,0,0],[1,0,0,0],[1,0,0,0]],
  " ": [[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0]],
}

function DotMatrixChar({
  char,
  dotSize = 2.5,
  gap = 1,
  activeColor = "#b4f54e",
  inactiveColor = "rgba(180, 245, 78, 0.08)",
  delay = 0,
}: {
  char: string
  dotSize?: number
  gap?: number
  activeColor?: string
  inactiveColor?: string
  delay?: number
}) {
  const matrix = DOT_MATRIX[char] ?? DOT_MATRIX["0"]!
  const cols = matrix[0]!.length
  const rows = matrix.length
  const width = cols * dotSize + (cols - 1) * gap
  const height = rows * dotSize + (rows - 1) * gap

  return (
    <motion.svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {matrix.map((row, ri) =>
        row.map((cell, ci) => (
          <motion.rect
            key={`${ri}-${ci}`}
            x={ci * (dotSize + gap)}
            y={ri * (dotSize + gap)}
            width={dotSize}
            height={dotSize}
            rx={dotSize / 2}
            ry={dotSize / 2}
            fill={cell ? activeColor : inactiveColor}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + ci * 0.02 + ri * 0.02, duration: 0.12 }}
            style={cell ? { filter: `drop-shadow(0 0 1.5px ${activeColor}66)` } : {}}
          />
        ))
      )}
    </motion.svg>
  )
}

function DotMatrixText({
  text,
  dotSize = 2.5,
  gap = 1,
  charGap = 3,
  activeColor,
  inactiveColor,
  className,
}: {
  text: string
  dotSize?: number
  gap?: number
  charGap?: number
  activeColor?: string
  inactiveColor?: string
  className?: string
}) {
  return (
    <div className={cn("flex items-center", className)} style={{ gap: charGap }}>
      {text.split("").map((char, i) => (
        <DotMatrixChar
          key={i}
          char={char}
          dotSize={dotSize}
          gap={gap}
          activeColor={activeColor}
          inactiveColor={inactiveColor}
          delay={i * 0.04}
        />
      ))}
    </div>
  )
}

function PlaneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
    </svg>
  )
}

interface FlightStatusCardProps {
  departureCode?: string
  arrivalCode?: string
  departureCity?: string
  arrivalCity?: string
  departureTime?: string
  arrivalTime?: string
  eta?: string
  timezone?: string
  nextEvent?: string
  nextEventTime?: string
  progress?: number
  remainingTime?: string
  className?: string
}

function FlightStatusCardAdaptive({
  departureCode = "312",
  arrivalCode = "2500",
  departureCity = "Requests Used",
  arrivalCity = "Daily Limit",
  departureTime = "MAX PLAN",
  arrivalTime = "2,188 left",
  eta = "09H 07M",
  timezone = "Until Daily Reset",
  nextEvent = "REMAINING",
  nextEventTime = "2,188",
  progress = 12,
  remainingTime = "-09H 07M",
  className,
}: FlightStatusCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={cn(
        "relative w-full rounded-xl overflow-hidden",
        "border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-[#18181b]",
        className
      )}
    >
      <div className="px-4 py-3 sm:px-5 sm:py-4">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex flex-col items-start gap-0.5">
              <DotMatrixText
                text={departureCode}
                dotSize={2.5} gap={1} charGap={2.5}
                activeColor="var(--flight-dot-active, #2d7a2d)"
                inactiveColor="var(--flight-dot-inactive, rgba(45,122,45,0.1))"
              />
              <span className="text-muted-foreground text-[10px] font-medium leading-none mt-1">{departureCity}</span>
              <span className="text-muted-foreground/60 text-[9px] uppercase tracking-wider leading-none">{departureTime}</span>
            </div>

            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
              className="shrink-0 self-start mt-1"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-orange-500">
                <path d="M5 12h14m0 0l-4-4m4 4l-4 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.div>

            <div className="flex flex-col items-start gap-0.5">
              <DotMatrixText
                text={arrivalCode}
                dotSize={2.5} gap={1} charGap={2.5}
                activeColor="var(--flight-dot-active, #2d7a2d)"
                inactiveColor="var(--flight-dot-inactive, rgba(45,122,45,0.1))"
              />
              <span className="text-muted-foreground text-[10px] font-medium leading-none mt-1">{arrivalCity}</span>
              <span className="text-muted-foreground/60 text-[9px] uppercase tracking-wider leading-none">{arrivalTime}</span>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-end gap-0.5 shrink-0"
          >
            <span className="text-foreground text-sm font-semibold tabular-nums leading-none">{eta}</span>
            <span className="text-muted-foreground/60 text-[9px] leading-none mt-0.5">{timezone}</span>
            <span className="text-orange-500 text-[9px] font-bold tracking-wider leading-none mt-1">{nextEvent} {nextEventTime}</span>
          </motion.div>
        </div>

        <div className="relative">
          <div className="relative h-6 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800/80">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full flex items-center justify-end pr-1"
              initial={{ width: "0%" }}
              animate={{ width: `${Math.max(progress, 8)}%` }}
              transition={{ duration: 1, ease: "circOut", delay: 0.25 }}
              style={{
                background: "linear-gradient(90deg, #4a9c4a 0%, #5cb85c 60%, #7ed17e 100%)",
                boxShadow: "0 0 8px rgba(92,184,92,0.25)",
              }}
            >
              <motion.div
                className="flex items-center justify-center w-4 h-4 rounded-full bg-white/20"
                animate={{ y: [0, -0.5, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <PlaneIcon className="w-2.5 h-2.5 text-white rotate-45" />
              </motion.div>
            </motion.div>
          </div>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground/50 text-[10px] font-mono font-medium tabular-nums"
          >
            {remainingTime}
          </motion.span>
        </div>
      </div>

    </motion.div>
  )
}

export { FlightStatusCardAdaptive, DotMatrixText, DotMatrixChar }
export type { FlightStatusCardProps }