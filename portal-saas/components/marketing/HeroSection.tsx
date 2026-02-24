"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function HeroSection() {
    return (
        <section className="relative overflow-hidden py-24 md:py-32">
            {/* Background Decor */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-lime-500/10 via-transparent to-transparent" />
                <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
                    <defs>
                        <pattern id="dotPattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                            <circle cx="2" cy="2" r="1" fill="#84CC16" opacity="0.5" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#dotPattern)" />
                </svg>
            </div>

            <div className="container relative z-10 mx-auto px-4 text-center">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 rounded-full border border-lime-500/30 bg-lime-500/10 px-4 py-1.5 text-sm font-medium text-lime-400 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <span>🚀</span>
                    <span>Portal SaaS Unificado</span>
                </div>

                {/* Heading */}
                <h1 className="mx-auto max-w-4xl text-5xl font-black leading-tight tracking-tight text-white md:text-7xl mb-6 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
                    Software que <span className="text-lime-400">potencia</span> tu empresa
                </h1>

                {/* Description */}
                <p className="mx-auto max-w-2xl text-lg text-gray-400 md:text-xl mb-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                    UnikLabs desarrolla aplicaciones SaaS enfocadas en productividad empresarial.
                    Un solo portal para gestionar todo tu ecosistema digital.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500">
                    <Button asChild className="h-14 px-8 text-lg bg-lime-500 text-black font-bold hover:bg-lime-400 rounded-xl transition-all shadow-[0_0_20px_rgba(132,204,22,0.2)] hover:shadow-[0_0_30px_rgba(132,204,22,0.4)]">
                        <Link href="#apps" className="flex items-center gap-2">
                            Explorar Apps <ArrowRight className="h-5 w-5" />
                        </Link>
                    </Button>
                    <Button variant="outline" asChild className="h-14 px-8 text-lg border-zinc-700 text-white hover:border-zinc-500 bg-transparent rounded-xl transition-colors">
                        <Link href="#faq">Conocer más</Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}
