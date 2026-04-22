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

function PlaneIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22 16.21v-1.895L14 8.84V3.21c0-.795-.672-1.421-1.5-1.421S11 2.415 11 3.21v5.63L3 14.316v1.895l8-2.369v5.263l-2 1.421v1.421L12.5 21l3.5.947v-1.421l-2-1.421v-5.263l8 2.369z"
        fill="currentColor"
      />
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
        <div className="flex items-start gap-3 mb-3">
          <div className="flex flex-col items-start gap-0.5 shrink-0">
            <DotMatrixText
              text={departureCode}
              dotSize={2.5} gap={1} charGap={2.5}
              activeColor="var(--flight-dot-active, #2d7a2d)"
              inactiveColor="var(--flight-dot-inactive, rgba(45,122,45,0.1))"
            />
            <span className="text-muted-foreground text-[10px] font-medium leading-none mt-1">{departureCity}</span>
            <span className="text-muted-foreground/60 text-[9px] uppercase tracking-wider leading-none">{departureTime}</span>
          </div>

          <div className="flex-1 min-w-0 pt-1">
            <div className="relative h-[20px] flex items-center">
              <svg width="100%" height="20" className="absolute inset-0">
                <motion.line
                  x1="0%" y1={10} x2="100%" y2={10}
                  stroke="var(--flight-dot-active, #2d7a2d)"
                  strokeWidth={1.2}
                  strokeDasharray="6 4"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.3 }}
                  transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
                />
              </svg>

              <motion.div
                className="absolute top-1/2 -translate-y-1/2 pointer-events-none"
                initial={{ left: "0%", opacity: 0 }}
                animate={{
                  left: ["0%", "95%"],
                  opacity: [0, 1, 1, 1, 0],
                }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  repeatDelay: 1,
                  ease: [0.22, 0.68, 0.36, 1],
                  times: [0, 0.05, 0.5, 0.9, 1],
                }}
              >
                <motion.div
                  className="relative"
                  animate={{ y: [0, -1, 0, 0.5, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, repeatDelay: 1, ease: "easeInOut" }}
                >
                  <div
                    className="absolute top-1/2 right-full -translate-y-1/2 h-[1px] w-6 origin-right"
                    style={{
                      background: "linear-gradient(to left, var(--flight-dot-active, #2d7a2d), transparent)",
                      opacity: 0.3,
                    }}
                  />
                  <PlaneIcon
                    className="w-5 h-5 -translate-x-1/2 rotate-90"
                    style={{
                      color: "var(--flight-dot-active, #2d7a2d)",
                      filter: "drop-shadow(0 0 2px var(--flight-dot-active, rgba(45,122,45,0.5)))",
                    }}
                  />
                </motion.div>
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="flex items-center justify-center gap-1.5 mt-1.5"
            >
              <span className="text-foreground text-[11px] font-semibold tabular-nums leading-none">{eta}</span>
              <span className="text-muted-foreground/50 text-[9px] leading-none">{timezone}</span>
            </motion.div>
          </div>

          <div className="flex flex-col items-end gap-0.5 shrink-0">
            <DotMatrixText
              text={arrivalCode}
              dotSize={2.5} gap={1} charGap={2.5}
              activeColor="var(--flight-dot-active, #2d7a2d)"
              inactiveColor="var(--flight-dot-inactive, rgba(45,122,45,0.1))"
              className="justify-end"
            />
            <span className="text-muted-foreground text-[10px] font-medium leading-none mt-1">{arrivalCity}</span>
            <span className="text-muted-foreground/60 text-[9px] uppercase tracking-wider leading-none">{arrivalTime}</span>
          </div>
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
                <PlaneIcon className="w-3 h-3 text-white rotate-90" />
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