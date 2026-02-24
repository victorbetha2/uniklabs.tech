import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Navbar from '@/components/marketing/Navbar'
import Footer from '@/components/marketing/Footer'
import { AppHero } from '@/components/marketing/apps/AppHero'
import { AppFeatures } from '@/components/marketing/apps/AppFeatures'
import { AppPricingSection } from '@/components/marketing/apps/AppPricingSection'
import { AppStats } from '@/components/marketing/apps/AppStats'
import { AppFAQ } from '@/components/marketing/apps/AppFAQ'
import { AppCTAFinal } from '@/components/marketing/apps/AppCTAFinal'

interface PageProps {
    params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
    const apps = await prisma.app.findMany({
        where: { isActive: true },
        select: { slug: true }
    })

    return apps.map((app) => ({
        slug: app.slug,
    }))
}

export default async function AppPage({ params }: PageProps) {
    const { slug } = await params

    const app = await prisma.app.findUnique({
        where: { slug, isActive: true },
        include: {
            features: { orderBy: { order: 'asc' } },
            plans: { orderBy: { order: 'asc' } },
            faqs: { orderBy: { order: 'asc' } },
        },
    })

    if (!app) notFound()

    return (
        <main className="min-h-screen bg-[#0A0A0A]">
            <Navbar />

            <AppHero app={{
                name: app.name,
                badge: app.badge,
                tagline: app.tagline,
                heroAccent: app.heroAccent,
                description: app.description,
                slug: app.slug
            }} />

            <AppStats stats={app.stats as any} />

            <AppFeatures appName={app.name} features={app.features} />

            <AppPricingSection appName={app.name} appSlug={app.slug} plans={app.plans} />

            <AppFAQ appName={app.name} faqs={app.faqs} />

            <AppCTAFinal appName={app.name} />

            <Footer />
        </main>
    )
}
