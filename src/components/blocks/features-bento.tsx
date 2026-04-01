"use client"
import { Activity, Cpu, Globe, MessageCircle, Route, Shield, TrendingDown, Zap } from 'lucide-react'
import DottedMap from 'dotted-map'
import { Area, AreaChart, CartesianGrid } from 'recharts'
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

const features = [
  {
    icon: Route,
    title: 'Intelligent Routing',
    description: 'Automatically route requests to the best provider based on cost, latency, and availability.',
    span: 'md:col-span-1'
  },
  {
    icon: Cpu,
    title: '50+ Models',
    description: 'Access models from OpenAI, Anthropic, Google, Meta, Mistral, DeepSeek, and more.',
    span: 'md:col-span-1'
  },
  {
    icon: TrendingDown,
    title: 'Best Prices',
    description: 'We negotiate volume discounts and pass the savings to you. Save up to 80% on API costs.',
    span: 'md:col-span-1'
  },
  {
    icon: Shield,
    title: 'High Availability',
    description: 'Built-in fallbacks ensure your applications never go down, even when providers do.',
    span: 'md:col-span-1'
  },
  {
    icon: Globe,
    title: 'Unified API',
    description: 'One simple API to rule them all. No more managing multiple provider credentials.',
    span: 'md:col-span-1'
  },
  {
    icon: Zap,
    title: 'Real-time Analytics',
    description: 'Track usage, costs, and performance across all providers with detailed analytics.',
    span: 'md:col-span-1'
  },
]

export function Features() {
    return (
        <section className="px-4 py-16 md:py-32">
            <div className="mx-auto max-w-5xl">
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl font-display font-bold tracking-tight mb-4">
                        Everything you need to build with AI
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Powerful features to help you build, scale, and optimize your AI applications.
                    </p>
                </div>
            </div>
            <div className="mx-auto grid max-w-5xl border md:grid-cols-2">
                <div>
                    <div className="p-6 sm:p-12">
                        <span className="text-muted-foreground flex items-center gap-2">
                            <Route className="size-4" />
                            Intelligent Routing
                        </span>

                        <p className="mt-8 text-2xl font-semibold">Automatically route requests to the best provider.</p>
                    </div>

                    <div aria-hidden className="relative">
                        <div className="absolute inset-0 z-10 m-auto size-fit">
                            <div className="rounded-[--radius] bg-background z-[1] dark:bg-muted relative flex size-fit w-fit items-center gap-2 border px-3 py-1 text-xs font-medium shadow-md shadow-black/5">
                                <span className="text-lg">⚡</span> Routing to lowest latency provider
                            </div>
                            <div className="rounded-[--radius] bg-background absolute inset-2 -bottom-2 mx-auto border px-3 py-4 text-xs font-medium shadow-md shadow-black/5 dark:bg-zinc-900"></div>
                        </div>

                        <div className="relative overflow-hidden">
                            <div className="[background-image:radial-gradient(var(--tw-gradient-stops))] z-1 to-background absolute inset-0 from-transparent to-75%"></div>
                            <Map />
                        </div>
                    </div>
                </div>
                <div className="overflow-hidden border-t bg-secondary/20 p-6 sm:p-12 md:border-0 md:border-l dark:bg-transparent">
                    <div className="relative z-10">
                        <span className="text-muted-foreground flex items-center gap-2">
                            <MessageCircle className="size-4" />
                            Unified API
                        </span>

                        <p className="my-8 text-2xl font-semibold">One simple API to rule them all.</p>
                    </div>
                    <div aria-hidden className="flex flex-col gap-8">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="flex justify-center items-center size-5 rounded-full border">
                                    <span className="size-3 rounded-full bg-primary"/>
                                </span>
                                <span className="text-muted-foreground text-xs">OpenAI</span>
                            </div>
                            <div className="rounded-[--radius] bg-background mt-1.5 w-3/5 border p-3 text-xs">/v1/chat/completions</div>
                        </div>

                        <div>
                            <div className="rounded-[--radius] mb-1 ml-auto w-3/5 bg-blue-600 p-3 text-xs text-white">Response from any provider unified</div>
                            <span className="text-muted-foreground block text-right text-xs">Now</span>
                        </div>
                    </div>
                </div>
                <div className="col-span-full border-y p-12">
                    <p className="text-center text-4xl font-semibold lg:text-7xl">50+ Models</p>
                </div>
                <div className="relative col-span-full">
                    <div className="absolute z-10 max-w-lg px-6 pr-12 pt-6 md:px-12 md:pt-12">
                        <span className="text-muted-foreground flex items-center gap-2">
                            <Activity className="size-4" />
                            Real-time Analytics
                        </span>

                        <p className="my-8 text-2xl font-semibold">
                            Track usage, costs, and performance. <span className="text-muted-foreground">Instantly identify optimization opportunities.</span>
                        </p>
                    </div>
                    <MonitoringChart />
                </div>
            </div>
        </section>
    )
}

const map = new DottedMap({ height: 55, grid: 'diagonal' })

const points = map.getPoints()

const svgOptions = {
    backgroundColor: 'var(--color-background)',
    color: 'currentColor',
    radius: 0.15,
}

const Map = () => {
    const viewBox = `0 0 120 60`
    return (
        <svg viewBox={viewBox} style={{ background: svgOptions.backgroundColor }}>
            {points.map((point, index) => (
                <circle key={index} cx={point.x} cy={point.y} r={svgOptions.radius} fill={svgOptions.color} />
            ))}
        </svg>
    )
}

const chartConfig = {
    desktop: {
        label: 'Requests',
        color: '#6366f1',
    },
    mobile: {
        label: 'Cost Savings',
        color: '#22c55e',
    },
} satisfies ChartConfig

const chartData = [
    { month: 'May', desktop: 56, mobile: 224 },
    { month: 'June', desktop: 56, mobile: 224 },
    { month: 'January', desktop: 126, mobile: 252 },
    { month: 'February', desktop: 205, mobile: 410 },
    { month: 'March', desktop: 200, mobile: 126 },
    { month: 'April', desktop: 400, mobile: 800 },
]

const MonitoringChart = () => {
    return (
        <ChartContainer className="h-120 aspect-auto md:h-96" config={chartConfig}>
            <AreaChart
                accessibilityLayer
                data={chartData}
                margin={{
                    left: 0,
                    right: 0,
                }}>
                <defs>
                    <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-desktop)" stopOpacity={0.8} />
                        <stop offset="55%" stopColor="var(--color-desktop)" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-mobile)" stopOpacity={0.8} />
                        <stop offset="55%" stopColor="var(--color-mobile)" stopOpacity={0.1} />
                    </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <ChartTooltip active cursor={false} content={<ChartTooltipContent className="dark:bg-muted" />} />
                <Area strokeWidth={2} dataKey="mobile" type="stepBefore" fill="url(#fillMobile)" fillOpacity={0.1} stroke="var(--color-mobile)" stackId="a" />
                <Area strokeWidth={2} dataKey="desktop" type="stepBefore" fill="url(#fillDesktop)" fillOpacity={0.1} stroke="var(--color-desktop)" stackId="a" />
            </AreaChart>
        </ChartContainer>
    )
}
