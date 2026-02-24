"use client"

import { CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PricingFeature {
    text: string
    included: boolean
}

interface AppPricingCardProps {
    name: string
    userRange: string
    price: number
    description: string
    isHighlighted: boolean
    features: PricingFeature[]
    ctaLabel: string
    ctaHref: string
}

export function AppPricingCard({
    name,
    userRange,
    price,
    description,
    isHighlighted,
    features,
    ctaLabel,
    ctaHref,
}: AppPricingCardProps) {
    return (
        <div className={cn(
            "relative p-8 rounded-2xl bg-zinc-900 flex flex-col transition-all duration-300",
            isHighlighted
                ? "ring-2 ring-lime-500 scale-[1.03] z-10 shadow-2xl shadow-lime-500/10"
                : "border border-zinc-800 hover:border-lime-500/30"
        )}>
            {isHighlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-lime-500 text-black text-sm font-bold px-4 py-1 rounded-full whitespace-nowrap">
                    Más popular
                </div>
            )}

            <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-2">{name}</h3>
                <p className="text-sm text-gray-400 mb-6">{description}</p>
                <div className="flex items-baseline mb-1">
                    <span className="text-4xl font-bold text-white">${price}</span>
                    <span className="text-gray-400 ml-2">/mes</span>
                </div>
                <p className="text-sm text-lime-400 font-medium">{userRange}</p>
            </div>

            <div className="flex-grow space-y-4 mb-8">
                {features.map((feature, idx) => (
                    <div key={idx} className="flex items-start">
                        {feature.included ? (
                            <CheckCircle className="w-5 h-5 text-lime-500 shrink-0 mr-3" />
                        ) : (
                            <XCircle className="w-5 h-5 text-zinc-600 shrink-0 mr-3" />
                        )}
                        <span className={cn(
                            "text-sm",
                            feature.included ? "text-gray-300" : "text-zinc-600"
                        )}>
                            {feature.text}
                        </span>
                    </div>
                ))}
            </div>

            <Button
                asChild
                className={cn(
                    "w-full font-bold h-12 transition-all duration-300",
                    isHighlighted
                        ? "bg-lime-500 hover:bg-lime-600 text-black"
                        : "bg-transparent border border-zinc-800 text-white hover:border-lime-500/50 hover:bg-zinc-800"
                )}
            >
                <a href={ctaHref}>{ctaLabel}</a>
            </Button>
        </div>
    )
}
