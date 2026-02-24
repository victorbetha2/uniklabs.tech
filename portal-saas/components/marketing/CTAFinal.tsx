"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CTAFinal() {
    return (
        <section className="py-24 md:py-32 bg-zinc-900 border-t border-zinc-800 relative overflow-hidden">
            {/* Decorative gradient */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-lime-500/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="container relative z-10 mx-auto px-4 text-center">
                <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
                    ¿Listo para empezar?
                </h2>
                <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10">
                    Explora nuestras apps y encuentra el plan ideal para automatizar y potenciar tu empresa hoy mismo.
                </p>
                <Button asChild size="lg" className="h-16 px-10 text-xl bg-lime-500 text-black font-extrabold hover:bg-lime-400 rounded-2xl transition-all shadow-[0_0_30px_rgba(132,204,22,0.3)] hover:shadow-[0_0_50px_rgba(132,204,22,0.5)]">
                    <Link href="#apps">
                        Ver nuestras apps
                    </Link>
                </Button>
            </div>
        </section>
    );
}
