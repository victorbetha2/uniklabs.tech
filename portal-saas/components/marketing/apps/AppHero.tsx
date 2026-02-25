"use client"

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'

interface AppHeroProps {
    app: {
        name: string
        badge: string
        tagline: string
        heroAccent: string
        description: string
        slug: string
    }
}

export function AppHero({ app }: AppHeroProps) {
    const parts = app.tagline.split(app.heroAccent)

    return (
        <section className="relative pt-24 pb-16 overflow-hidden">
            <div className="container px-4 mx-auto relative z-10">
                <div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-16">
                    <nav className="flex items-center space-x-2 text-sm text-gray-400 mb-8" aria-label="Breadcrumb">
                        <Link href="/" className="hover:text-white transition-colors">UnikLabs</Link>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-lime-400">{app.name}</span>
                    </nav>

                    <Badge variant="outline" className="bg-lime-500/10 border-lime-500/30 text-lime-400 px-4 py-1.5 mb-8 rounded-full">
                        {app.badge}
                    </Badge>

                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                        {parts[0]}
                        <span className="text-lime-400">{app.heroAccent}</span>
                        {parts[1]}
                    </h1>

                    <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                        {app.description}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                        <Button asChild size="lg" className="bg-lime-500 hover:bg-lime-600 text-black font-semibold h-12 px-8">
                            <a href={`#pricing-${app.slug}`}>Ver planes</a>
                        </Button>
                        {app.slug !== 'ent' && (
                            <Button asChild variant="outline" size="lg" className="border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-white h-12 px-8">
                                <Link href="/sign-up">Ver demo</Link>
                            </Button>
                        )}
                    </div>
                </div>

                {/* App Screenshot */}
                <div className="relative max-w-5xl mx-auto">
                    <div className="absolute inset-x-0 -top-40 h-[500px] bg-lime-500/10 blur-[120px] rounded-full -z-10" />
                    <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 p-2 rounded-2xl shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10" />
                        <img
                            src={`/images/apps/${app.slug}/dashboard-desktop.png`}
                            alt={`${app.name} Dashboard`}
                            className="w-full h-auto rounded-xl border border-zinc-800/50 shadow-inner"
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}
