"use client"
import { LogoCloud } from '@/components/ui/logo-cloud'

export default function LogoCloudWrapper() {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tight mb-2">
            Models we <span className="text-primary">support</span>
          </h2>
          <p className="text-muted-foreground">
            Access 50+ models from the best AI providers
          </p>
        </div>
        <LogoCloud />
      </div>
    </section>
  )
}
