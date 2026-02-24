"use client";

import { Zap, Shield, LayoutDashboard } from "lucide-react";

const features = [
    {
        icon: Zap,
        title: "Acceso instantáneo",
        description: "Un solo login para todas tus apps. Sin fricciones ni configuraciones complejas para que puedas enfocarte en lo que importa.",
    },
    {
        icon: Shield,
        title: "Seguridad enterprise",
        description: "Autenticación robusta con Clerk. Tus datos siempre protegidos con los estándares más altos de la industria.",
    },
    {
        icon: LayoutDashboard,
        title: "Panel centralizado",
        description: "Gestiona suscripciones, usuarios y pagos desde un solo lugar. Control total de tu ecosistema SaaS en una sola pantalla.",
    },
];

export default function WhyUnikLabs() {
    return (
        <section className="py-24 md:py-32 bg-[#0A0A0A]">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight">
                        ¿Por qué elegirnos?
                    </h2>
                    <div className="h-1 w-20 bg-lime-500 mx-auto rounded-full" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {features.map((feature, index) => (
                        <div key={index} className="flex flex-col items-center text-center group">
                            <div className="mb-6 p-5 rounded-2xl bg-zinc-900 border border-zinc-800 text-lime-500 group-hover:border-lime-500/30 group-hover:scale-110 transition-all duration-300">
                                <feature.icon size={36} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                            <p className="text-gray-400 leading-relaxed max-w-sm">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
