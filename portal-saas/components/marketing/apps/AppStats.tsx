"use client"

interface Stat {
    value: string
    label: string
}

interface AppStatsProps {
    stats: Stat[]
}

export function AppStats({ stats }: AppStatsProps) {
    if (!stats || stats.length === 0) return null

    return (
        <section className="bg-zinc-900/50 border-y border-zinc-800 py-12">
            <div className="container px-4 mx-auto">
                <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 lg:gap-24">
                    {stats.slice(0, 4).map((stat, idx) => (
                        <div key={idx} className="flex flex-col items-center text-center group">
                            <span className="text-3xl md:text-4xl font-extrabold text-white mb-2 group-hover:text-lime-400 transition-colors">
                                {stat.value}
                            </span>
                            <span className="text-sm font-medium text-gray-500 uppercase tracking-widest">
                                {stat.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
