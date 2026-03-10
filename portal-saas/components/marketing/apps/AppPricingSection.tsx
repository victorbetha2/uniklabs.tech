"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { CheckCircle, XCircle, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface Plan {
    id: string
    name: string
    userRange: string
    price: number
    description: string
    isHighlighted: boolean
    features: { text: string; included: boolean }[]
    paypalPlanId?: string | null
}

interface AppPricingSectionProps {
    appName: string
    appSlug: string
    plans: Plan[]
}

export function AppPricingSection({ appName, appSlug, plans }: AppPricingSectionProps) {
    const { isSignedIn, isLoaded } = useAuth()
    const router = useRouter()
    const [alreadySubscribed, setAlreadySubscribed] = useState(false)

    // Si el usuario está autenticado, verificamos si ya tiene una suscripción activa para esta app
    useEffect(() => {
        if (!isLoaded || !isSignedIn) return

        async function checkSubscription() {
            try {
                const res = await fetch("/api/subscriptions")
                if (!res.ok) return
                const data = await res.json()
                const hasActive = data.subscriptions?.some(
                    (s: any) =>
                        s.app?.slug === appSlug &&
                        (s.status === "active" || s.status === "pending")
                )
                setAlreadySubscribed(hasActive)
            } catch (err) {
                console.error("Error al verificar suscripción:", err)
            }
        }

        checkSubscription()
    }, [isLoaded, isSignedIn, appSlug])

    const handleSelectPlan = (plan: Plan) => {
        if (!isLoaded) return

        // Bloquear si ya está suscrito
        if (alreadySubscribed) return

        const checkoutUrl = `/dashboard/checkout/${appSlug}?plan=${plan.id}`

        if (!isSignedIn) {
            const redirectUrl = encodeURIComponent(checkoutUrl)
            router.push(`/sign-up?redirect_url=${redirectUrl}`)
            return
        }

        router.push(checkoutUrl)
    }

    return (
        <section id="pricing" className="py-24 bg-zinc-900/30 min-h-screen flex flex-col items-center">
            <div className="container px-4 mx-auto w-full">
                {/* Header */}
                <div className="text-center py-16 px-4">
                    <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight text-white">
                        Planes {appName}
                    </h2>
                    <div className="h-1.5 w-24 bg-lime-500 mx-auto rounded-full mb-6" />
                    <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
                        Elige según el tamaño de tu equipo. Sin costos ocultos.
                    </p>
                </div>

                {/* Banner: ya suscrito */}
                {alreadySubscribed && (
                    <div className="max-w-2xl mx-auto mb-10 flex items-center gap-4 rounded-2xl border border-lime-500/40 bg-lime-500/10 px-6 py-5">
                        <ShieldCheck className="w-8 h-8 text-lime-400 shrink-0" />
                        <div>
                            <p className="text-white font-bold text-lg">Ya tienes una suscripción activa</p>
                            <p className="text-zinc-400 text-sm mt-0.5">
                                Ya cuentas con una membresía de <span className="text-lime-400 font-semibold">{appName}</span>. Para modificar o cancelar tu plan,{" "}
                                <Link href="/dashboard/subscriptions" className="text-lime-400 underline hover:text-lime-300 font-semibold">
                                    gestiona tu suscripción aquí
                                </Link>.
                            </p>
                        </div>
                    </div>
                )}

                <div className={cn(
                    "grid gap-8 max-w-6xl mx-auto",
                    plans.length === 1 ? "md:grid-cols-1 max-w-md" :
                        plans.length === 2 ? "md:grid-cols-2 max-w-3xl" :
                            "md:grid-cols-3 lg:grid-cols-4"
                )}>
                    {plans.map(plan => (
                        <div
                            key={plan.id}
                            className={cn(
                                "relative rounded-3xl p-8 flex flex-col transition-all duration-500",
                                plan.isHighlighted
                                    ? "bg-zinc-900 border-2 border-lime-500 scale-[1.02] shadow-2xl shadow-lime-500/10 z-10"
                                    : "bg-zinc-900/50 border border-zinc-800 hover:border-lime-500/30",
                                alreadySubscribed && "opacity-50 pointer-events-none"
                            )}
                        >
                            {plan.isHighlighted && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-lime-500 text-black text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider">
                                    Más Popular
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className="text-2xl font-bold mb-2 text-white">{plan.name}</h3>
                                <p className="text-zinc-500 text-sm mb-6 line-clamp-2">{plan.description}</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-5xl font-black text-white">${plan.price}</span>
                                    <span className="text-zinc-500 font-medium">/mes</span>
                                </div>
                                <p className="text-lime-400 text-sm font-bold mt-2">{plan.userRange}</p>
                            </div>

                            <div className="space-y-4 mb-10 flex-1">
                                {plan.features?.map((feature, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        {feature.included ? (
                                            <CheckCircle className="w-5 h-5 text-lime-500 shrink-0 mt-0.5" />
                                        ) : (
                                            <XCircle className="w-5 h-5 text-zinc-700 shrink-0 mt-0.5" />
                                        )}
                                        <span className={cn("text-sm", feature.included ? "text-zinc-300" : "text-zinc-600")}>
                                            {feature.text}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => handleSelectPlan(plan)}
                                disabled={alreadySubscribed}
                                className={cn(
                                    "mt-auto w-full font-bold h-12 rounded-lg transition-all duration-300",
                                    plan.isHighlighted
                                        ? "bg-lime-500 hover:bg-lime-600 text-black"
                                        : "bg-transparent border border-zinc-800 text-white hover:border-lime-500/50 hover:bg-zinc-800",
                                    alreadySubscribed && "cursor-not-allowed"
                                )}
                            >
                                {alreadySubscribed ? "Plan no disponible" : `Elegir ${plan.name}`}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
