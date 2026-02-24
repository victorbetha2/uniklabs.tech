"use client";

import { Building2, TrendingUp, Plus, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const apps = [
    {
        id: "ent",
        icon: Building2,
        name: "ENT",
        status: "Disponible",
        description: "Suite empresarial para generación de reportes y gestión de datos. Diseñada para equipos que necesitan visibilidad total de su operación.",
        tags: ["Reportes", "Dashboard", "Multi-usuario"],
        link: "/apps/ent",
        available: true,
    },
    {
        id: "finaly",
        icon: TrendingUp,
        name: "Finaly",
        status: "Disponible",
        description: "Gestión inteligente de finanzas personales. Conecta tus cuentas, visualiza gastos y toma control de tu dinero.",
        tags: ["Finanzas", "Analytics", "Personal"],
        link: "/apps/finaly",
        available: true,
    },
    {
        id: "custom",
        icon: Plus,
        name: "Más apps en desarrollo",
        status: "Próximamente",
        description: "Estamos construyendo nuevas herramientas para el ecosistema UnikLabs.",
        tags: [],
        link: "#",
        available: false,
    },
];

export default function AppsShowcase() {
    return (
        <section id="apps" className="py-24 md:py-32 bg-black">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="text-left mb-16">
                    <h2 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">
                        Nuestras Aplicaciones
                    </h2>
                    <p className="text-gray-400 text-lg">
                        Herramientas diseñadas para hacer crecer tu negocio.
                    </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {apps.map((app) => (
                        <div
                            key={app.id}
                            className={cn(
                                "group relative rounded-3xl border border-zinc-800 bg-zinc-900 overflow-hidden transition-all duration-300",
                                app.available
                                    ? "hover:border-lime-500/30 hover:scale-[1.02] cursor-pointer"
                                    : "opacity-60 cursor-default"
                            )}
                        >
                            {/* Glow Effect */}
                            {app.available && (
                                <div className="absolute inset-0 z-0 bg-gradient-to-br from-lime-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}

                            <div className="relative z-10 p-8 flex flex-col h-full">
                                {/* Icon & Badge */}
                                <div className="flex items-center justify-between mb-8">
                                    <div className={cn(
                                        "p-3 rounded-2xl bg-zinc-800/50",
                                        app.available ? "text-lime-500" : "text-gray-600"
                                    )}>
                                        <app.icon size={32} />
                                    </div>
                                    <span className={cn(
                                        "text-xs font-bold px-3 py-1 rounded-full border tracking-wide uppercase",
                                        app.available
                                            ? "bg-lime-500/10 text-lime-400 border-lime-500/30"
                                            : "bg-zinc-800 text-gray-500 border-zinc-700"
                                    )}>
                                        {app.status}
                                    </span>
                                </div>

                                {/* Content */}
                                <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">
                                    {app.name}
                                </h3>
                                <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-grow">
                                    {app.description}
                                </p>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-2 mb-8">
                                    {app.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="text-[10px] font-medium px-2.5 py-1 rounded-lg bg-zinc-800 text-gray-400 border border-zinc-700/50"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                {/* Link */}
                                {app.available && (
                                    <Link
                                        href={app.link}
                                        className="inline-flex items-center gap-2 text-sm font-bold text-lime-400 hover:text-lime-300 transition-colors group/link"
                                    >
                                        Ver planes
                                        <ArrowRight className="h-4 w-4 transform group-hover/link:translate-x-1 transition-transform" />
                                    </Link>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
