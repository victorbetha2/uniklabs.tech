"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { PayPalProvider } from "@/components/PayPalProvider"
import { PayPalSubscribeButton } from "@/components/PayPalSubscribeButton"
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

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

interface CheckoutFlowProps {
    appName: string
    appSlug: string
    plans: Plan[]
}

function CheckoutFlowInner({ appName, appSlug, plans }: CheckoutFlowProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)

    useEffect(() => {
        const planParam = searchParams.get("plan")
        if (planParam) {
            const plan = plans.find(p => p.id === planParam || p.name.toLowerCase() === planParam.toLowerCase())
            if (plan) {
                setSelectedPlanId(plan.id)
            }
        } else {
            setSelectedPlanId(null)
        }
    }, [searchParams, plans])

    const handleSelectPlan = (plan: Plan) => {
        router.push(`/dashboard/checkout/${appSlug}?plan=${plan.id}`, { scroll: false })
    }

    const unselectPlan = () => {
        router.push(`/dashboard/checkout/${appSlug}`, { scroll: false })
    }

    const selectedPlan = plans.find(p => p.id === selectedPlanId)

    if (selectedPlan) {
        // State 2: Checkout
        return (
            <div className="max-w-2xl mx-auto mt-8 animate-in fade-in duration-500">
                <Button variant="ghost" className="mb-6 -ml-4 text-muted-foreground hover:text-foreground" onClick={unselectPlan}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver a los planes
                </Button>

                <Card className="border-primary/20 shadow-lg">
                    <CardHeader className="text-center pb-8 border-b bg-muted/40 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent" />
                        <CardTitle className="text-2xl pt-4">Resumen de Compra</CardTitle>
                        <CardDescription>
                            Estás a punto de suscribirte a {appName}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-8">
                        <div className="flex justify-between items-center bg-muted/50 p-6 rounded-xl border mb-8">
                            <div>
                                <h3 className="font-semibold text-lg">{selectedPlan.name}</h3>
                                <p className="text-sm text-muted-foreground">{selectedPlan.userRange}</p>
                            </div>
                            <div className="text-right">
                                <span className="text-3xl font-bold">${selectedPlan.price}</span>
                                <span className="text-muted-foreground">/mes</span>
                            </div>
                        </div>

                        <PayPalProvider>
                            {selectedPlan.paypalPlanId ? (
                                <div className="mt-8 max-w-sm mx-auto">
                                    <PayPalSubscribeButton
                                        paypalPlanId={selectedPlan.paypalPlanId}
                                        appId={appSlug}
                                        planName={selectedPlan.name}
                                    />
                                </div>
                            ) : (
                                <div className="mt-8 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-center text-destructive">
                                    <p className="text-sm font-medium">Este plan no está disponible para suscripción online.</p>
                                </div>
                            )}
                        </PayPalProvider>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // State 1: Plan Selection
    return (
        <div className="mt-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-stretch">
                {plans.map(plan => (
                    <Card
                        key={plan.id}
                        className={cn(
                            "flex flex-col relative transition-all duration-300",
                            plan.isHighlighted
                                ? "border-primary shadow-md scale-[1.02]"
                                : "hover:border-primary/50"
                        )}
                    >
                        {plan.isHighlighted && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                                <Badge className="shadow-sm font-bold bg-primary text-primary-foreground px-3 py-1">
                                    Más Popular
                                </Badge>
                            </div>
                        )}
                        <CardHeader className={cn(
                            "pb-8",
                            plan.isHighlighted ? "pt-8" : ""
                        )}>
                            <CardTitle className="text-xl">{plan.name}</CardTitle>
                            <CardDescription className="h-10 line-clamp-2">
                                {plan.description}
                            </CardDescription>
                            <div className="mt-4 flex items-baseline gap-1">
                                <span className="text-4xl font-bold">${plan.price}</span>
                                <span className="text-muted-foreground font-medium">/mes</span>
                            </div>
                            <p className="text-primary text-sm font-medium mt-1">{plan.userRange}</p>
                        </CardHeader>

                        <CardContent className="flex-1">
                            <ul className="space-y-3">
                                {plan.features?.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        {feature.included ? (
                                            <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                        ) : (
                                            <XCircle className="h-5 w-5 text-muted-foreground/30 shrink-0 mt-0.5" />
                                        )}
                                        <span className={cn(
                                            "text-sm leading-tight",
                                            feature.included ? "text-foreground" : "text-muted-foreground"
                                        )}>
                                            {feature.text}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>

                        <CardFooter className="pt-6">
                            <Button
                                className="w-full"
                                variant={plan.isHighlighted ? "default" : "outline"}
                                onClick={() => handleSelectPlan(plan)}
                            >
                                Seleccionar {plan.name}
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    )
}

export function CheckoutFlow(props: CheckoutFlowProps) {
    return (
        <Suspense fallback={<div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>}>
            <CheckoutFlowInner {...props} />
        </Suspense>
    )
}
