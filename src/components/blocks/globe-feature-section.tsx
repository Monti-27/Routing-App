"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import createGlobe from "cobe"
import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface Marker {
  location: [number, number]
  size: number
  color?: [number, number, number]
  id?: string
}

interface COBEOptions {
  width: number
  height: number
  phi: number
  theta: number
  mapSamples: number
  mapBrightness: number
  mapBaseBrightness?: number
  baseColor: [number, number, number]
  markerColor: [number, number, number]
  glowColor: [number, number, number]
  markers?: Marker[]
  diffuse: number
  devicePixelRatio: number
  dark: number
  opacity?: number
  offset?: [number, number]
  scale?: number
}

interface Globe {
  update: (state: Record<string, unknown>) => void
  destroy: () => void
}

export default function GlobeSection() {
  return (
    <section className="relative w-full mx-auto overflow-hidden rounded-3xl bg-secondary/30 border border-border shadow-md px-6 py-16 md:px-16 md:py-24 mt-48">
      <div className="flex flex-col-reverse items-center justify-between gap-10 md:flex-row">
        <div className="z-10 max-w-xl text-left">
          <h1 className="text-3xl font-normal text-foreground">
            Build with <span className="text-primary">routing.run</span>{" "}
            <span className="text-muted-foreground">Empower your team with intelligent routing, unified APIs, and competitive pricing across 50+ AI models.</span>
          </h1>
          <Button className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
            Get Started <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="relative h-[300px] w-full max-w-md">
          <Globe className="w-full h-full" />
        </div>
      </div>
    </section>
  );
}

const GLOBE_CONFIG: COBEOptions = {
  width: 800,
  height: 800,
  phi: 0,
  theta: 0.3,
  mapSamples: 16000,
  mapBrightness: 1.2,
  baseColor: [0.15, 0.15, 0.2],
  markerColor: [0.4, 0.4, 1],
  glowColor: [0.3, 0.3, 0.5],
  markers: [
    { location: [14.5995, 120.9842], size: 0.03 },
    { location: [19.076, 72.8777], size: 0.1 },
    { location: [23.8103, 90.4125], size: 0.05 },
    { location: [30.0444, 31.2357], size: 0.07 },
    { location: [39.9042, 116.4074], size: 0.08 },
    { location: [-23.5505, -46.6333], size: 0.1 },
    { location: [19.4326, -99.1332], size: 0.1 },
    { location: [40.7128, -74.006], size: 0.1 },
    { location: [34.6937, 135.5022], size: 0.05 },
    { location: [41.0082, 28.9784], size: 0.06 },
  ],
  diffuse: 0.4,
  devicePixelRatio: 2,
  dark: 0,
}

function Globe({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const globeRef = useRef<Globe | null>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient || !canvasRef.current) return
    
    let animationId: number
    let phi = 0
    
    const render = () => {
      phi += 0.005
      if (globeRef.current) {
        globeRef.current.update({ phi })
      }
      animationId = requestAnimationFrame(render)
    }
    
    const initGlobe = () => {
      if (!canvasRef.current) return
      
      globeRef.current = createGlobe(canvasRef.current, GLOBE_CONFIG)
      canvasRef.current.style.opacity = "1"
      animationId = requestAnimationFrame(render)
    }
    
    const timeoutId = setTimeout(initGlobe, 200)
    
    return () => {
      clearTimeout(timeoutId)
      cancelAnimationFrame(animationId)
      if (globeRef.current) {
        globeRef.current.destroy()
        globeRef.current = null
      }
    }
  }, [isClient])

  if (!isClient) {
    return <div className={cn("w-full h-full bg-muted/30 rounded-xl", className)} />
  }

  return (
    <div className={cn("relative w-full h-full", className)}>
      <canvas
        ref={canvasRef}
        className="w-full h-full opacity-0 transition-opacity duration-1000 rounded-xl"
      />
    </div>
  )
}
