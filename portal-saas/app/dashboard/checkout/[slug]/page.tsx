import { notFound, redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { CheckoutFlow } from '@/components/dashboard/checkout/CheckoutFlow'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface PageProps {
    params: Promise<{ slug: string }>
}

export default async function CheckoutPage({ params }: PageProps) {
    const { userId } = await auth()

    if (!userId) {
        redirect('/sign-in')
    }

    const { slug } = await params

    const app = await prisma.app.findUnique({
        where: { slug, isActive: true },
        include: {
            plans: { orderBy: { order: 'asc' } },
        },
    })

    if (!app) notFound()

    const formattedPlans = app.plans.map(p => {
        const envKey = `PAYPAL_PLAN_${app.slug.toUpperCase()}_${p.name.toUpperCase()}`;
        const paypalPlanId = p.paypalPlanId || process.env[envKey] || null;

        return {
            id: p.id,
            name: p.name,
            userRange: p.userRange,
            price: Number(p.price),
            description: p.description,
            isHighlighted: p.isHighlighted,
            features: p.features as { text: string; included: boolean }[],
            paypalPlanId
        };
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/apps">
                        <ArrowLeft className="h-5 w-5" />
                        <span className="sr-only">Volver a Apps</span>
                    </Link>
                </Button>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Suscripción a {app.name}</h2>
                    <p className="text-muted-foreground mt-1">
                        Elige un plan para continuar con tu suscripción
                    </p>
                </div>
            </div>

            <CheckoutFlow
                appName={app.name}
                appSlug={app.slug}
                plans={formattedPlans}
            />
        </div>
    )
}
