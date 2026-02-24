"use client"

import { AppPricingCard } from './AppPricingCard'

interface Plan {
    id: string
    name: string
    userRange: string
    price: any // Decimal from Prisma
    description: string
    isHighlighted: boolean
    features: any // Json from Prisma [{text: string, included: boolean}]
}

interface AppPricingSectionProps {
    appName: string
    appSlug: string
    plans: Plan[]
}

export function AppPricingSection({ appName, appSlug, plans }: AppPricingSectionProps) {
    return (
        <section id={`pricing-${appSlug}`} className="py-24 bg-zinc-900/30">
            <div className="container px-4 mx-auto">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                        Planes {appName}
                    </h2>
                    <p className="text-xl text-gray-400">
                        Elige según el tamaño de tu equipo. Sin costos ocultos.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                    {plans.map((plan) => (
                        <AppPricingCard
                            key={plan.id}
                            name={plan.name}
                            userRange={plan.userRange}
                            price={Number(plan.price)}
                            description={plan.description}
                            isHighlighted={plan.isHighlighted}
                            features={plan.features as { text: string; included: boolean }[]}
                            ctaLabel={`Empezar con ${plan.name}`}
                            ctaHref={`/sign-up?plan=${appSlug}-${plan.name.toLowerCase()}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    )
}
