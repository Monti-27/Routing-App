"use client"

import { motion } from "framer-motion"
import { useEffect, useRef } from "react"

interface TimelineContentProps {
  children: React.ReactNode
  as?: keyof React.JSX.IntrinsicElements
  animationNum?: number
  timelineRef?: React.RefObject<HTMLElement | null>
  customVariants?: {
    visible: (i: number) => {
      y: number
      opacity: number
      filter: string
      transition: {
        delay: number
        duration: number
      }
    }
    hidden: {
      filter: string
      y: number
      opacity: number
    }
  }
  className?: string
}

export function TimelineContent({
  children,
  as = "div",
  animationNum = 0,
  customVariants,
  className = "",
  ...props
}: TimelineContentProps) {
  const ref = useRef<HTMLDivElement>(null)

  const defaultVariants = {
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
  }

  const variants = customVariants || defaultVariants

  const Component = motion[as as keyof typeof motion] as typeof motion.div || motion.div

  return (
    <Component
      ref={ref}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={variants}
      custom={animationNum}
      className={className}
      {...props}
    >
      {children}
    </Component>
  )
}