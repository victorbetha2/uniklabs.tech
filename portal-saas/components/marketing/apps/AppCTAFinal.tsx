"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface AppCTAFinalProps {
    appName: string
}

export function AppCTAFinal({ appName }: AppCTAFinalProps) {
    return (
        <section className="py-24 bg-zinc-900 border-t border-zinc-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-lime-500/5 blur-[120px] -z-10" />
            <div className="absolute bottom-0 left-0 w-1/3 h-full bg-lime-500/5 blur-[120px] -z-10" />

            <div className="container px-4 mx-auto text-center relative z-10">
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                    ¿Tu equipo necesita {appName}?
                </h2>
                <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
                    Empieza hoy y transforma cómo trabajas con {appName}.
                </p>
                <Button asChild size="lg" className="bg-lime-500 hover:bg-lime-600 text-black font-bold h-14 px-10 text-lg shadow-xl shadow-lime-500/20 transition-all duration-300 hover:scale-105">
                    <Link href="/sign-up">
                        Comenzar ahora →
                    </Link>
                </Button>
            </div>
        </section>
    )
}
