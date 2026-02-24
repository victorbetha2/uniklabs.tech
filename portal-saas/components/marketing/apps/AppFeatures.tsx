"use client"

import { DynamicIcon } from './DynamicIcon'

interface Feature {
    id: string
    iconName: string
    title: string
    description: string
}

interface AppFeaturesProps {
    appName: string
    features: Feature[]
}

export function AppFeatures({ appName, features }: AppFeaturesProps) {
    return (
        <section className="py-24 bg-black">
            <div className="container px-4 mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        ¿Qué puedes hacer con {appName}?
                    </h2>
                    <div className="h-1 w-20 bg-lime-500 mx-auto rounded-full" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {features.map((feature) => (
                        <div
                            key={feature.id}
                            className="group p-8 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-lime-500/30 hover:scale-[1.02] transition-all duration-300"
                        >
                            <div className="w-12 h-12 bg-lime-500/10 rounded-xl flex items-center justify-center mb-6 border border-lime-500/20 group-hover:bg-lime-500/20 transition-colors">
                                <DynamicIcon name={feature.iconName} className="w-6 h-6 text-lime-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-lime-400 transition-colors">
                                {feature.title}
                            </h3>
                            <p className="text-gray-400 leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
