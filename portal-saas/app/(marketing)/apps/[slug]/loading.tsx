export default function AppLoading() {
    return (
        <main className="min-h-screen bg-[#0A0A0A]">
            {/* Navbar Skeleton */}
            <div className="h-16 border-b border-zinc-800 bg-black/80 flex items-center px-4">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="h-6 w-32 bg-zinc-800 rounded animate-pulse" />
                    <div className="flex gap-4">
                        <div className="h-8 w-24 bg-zinc-800 rounded animate-pulse" />
                        <div className="h-8 w-24 bg-zinc-800 rounded animate-pulse" />
                    </div>
                </div>
            </div>

            {/* Hero Skeleton */}
            <section className="pt-24 pb-16">
                <div className="container px-4 mx-auto text-center space-y-8">
                    <div className="h-4 w-32 bg-zinc-800 rounded mx-auto animate-pulse" />
                    <div className="h-8 w-40 bg-zinc-800 rounded-full mx-auto animate-pulse" />
                    <div className="h-16 md:h-24 max-w-3xl bg-zinc-800 rounded-xl mx-auto animate-pulse" />
                    <div className="h-6 max-w-2xl bg-zinc-800 rounded mx-auto animate-pulse" />
                    <div className="flex justify-center gap-4">
                        <div className="h-12 w-32 bg-zinc-800 rounded animate-pulse" />
                        <div className="h-12 w-32 bg-zinc-800 rounded animate-pulse" />
                    </div>
                    <div className="h-[400px] max-w-5xl bg-zinc-900 border border-zinc-800 rounded-2xl mx-auto animate-pulse mt-12" />
                </div>
            </section>

            {/* Stats Skeleton */}
            <section className="py-12 border-y border-zinc-800 bg-zinc-900/50">
                <div className="container px-4 mx-auto">
                    <div className="flex justify-center gap-12 md:gap-24">
                        <div className="h-12 w-24 bg-zinc-800 rounded animate-pulse" />
                        <div className="h-12 w-24 bg-zinc-800 rounded animate-pulse" />
                        <div className="h-12 w-24 bg-zinc-800 rounded animate-pulse" />
                    </div>
                </div>
            </section>
        </main>
    )
}
