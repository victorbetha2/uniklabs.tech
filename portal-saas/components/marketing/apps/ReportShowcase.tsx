"use client"

import { useState } from 'react'
import { Monitor, Smartphone } from 'lucide-react'

export function ReportShowcase() {
    const [activeView, setActiveView] = useState<'desktop' | 'mobile'>('desktop')

    return (
        <section className="relative py-24 overflow-hidden">
            {/* Background glow */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-lime-500/10 blur-[120px] rounded-full" />
            </div>

            <div className="container px-4 mx-auto">
                {/* Section header */}
                <div className="text-center mb-12">
                    <p className="text-lime-400 text-sm font-semibold tracking-widest uppercase mb-3">
                        Vista previa de la plataforma
                    </p>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Disponible en todos tus <span className="text-lime-400">dispositivos</span>
                    </h2>
                    <p className="text-gray-400 max-w-xl mx-auto">
                        Accede a tus reportes y gestión operacional desde el escritorio o desde tu móvil, donde quieras.
                    </p>
                </div>

                {/* Toggle tabs */}
                <div className="flex items-center justify-center gap-2 mb-10">
                    <button
                        onClick={() => setActiveView('desktop')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${activeView === 'desktop'
                                ? 'bg-lime-500 text-black shadow-lg shadow-lime-500/30'
                                : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700 hover:text-white'
                            }`}
                    >
                        <Monitor className="w-4 h-4" />
                        Escritorio
                    </button>
                    <button
                        onClick={() => setActiveView('mobile')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${activeView === 'mobile'
                                ? 'bg-lime-500 text-black shadow-lg shadow-lime-500/30'
                                : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700 hover:text-white'
                            }`}
                    >
                        <Smartphone className="w-4 h-4" />
                        Móvil
                    </button>
                </div>

                {/* Desktop view */}
                <div
                    className={`transition-all duration-500 ${activeView === 'desktop' ? 'opacity-100 scale-100' : 'opacity-0 scale-95 absolute pointer-events-none'
                        }`}
                >
                    <div className="relative max-w-5xl mx-auto">
                        {/* Browser chrome mockup */}
                        <div className="bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden">
                            {/* Browser bar */}
                            <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800 bg-zinc-950/80">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                                </div>
                                <div className="flex-1 mx-4 bg-zinc-800 rounded-md px-3 py-1 text-xs text-gray-500 text-center">
                                    app.report.uniklabs.tech
                                </div>
                            </div>
                            {/* Screenshot */}
                            <div className="relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent z-10 pointer-events-none" />
                                <img
                                    src="/images/apps/report/dashboard-desktop.png"
                                    alt="ReporT Dashboard — vista escritorio"
                                    className="w-full h-auto block"
                                    style={{ display: 'block' }}
                                />
                            </div>
                        </div>
                        {/* Reflection / glow under */}
                        <div className="mt-2 mx-10 h-8 bg-gradient-to-b from-lime-500/10 to-transparent blur-xl rounded-full" />
                    </div>
                </div>

                {/* Mobile view */}
                <div
                    className={`transition-all duration-500 ${activeView === 'mobile' ? 'opacity-100 scale-100' : 'opacity-0 scale-95 absolute pointer-events-none'
                        }`}
                >
                    <div className="flex justify-center">
                        <div className="relative w-[300px]">
                            {/* Phone frame */}
                            <div className="bg-zinc-900 border-2 border-zinc-700 rounded-[40px] shadow-2xl overflow-hidden p-2">
                                {/* Notch */}
                                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-6 bg-zinc-900 border border-zinc-700 rounded-full z-20" />
                                {/* Screen */}
                                <div className="rounded-[32px] overflow-hidden relative">
                                    <img
                                        src="/images/apps/report/dashboard-mobile.png"
                                        alt="ReporT Dashboard — vista móvil"
                                        className="w-full h-auto block"
                                        style={{ display: 'block' }}
                                    />
                                </div>
                            </div>
                            {/* Glow under phone */}
                            <div className="mt-2 mx-4 h-8 bg-gradient-to-b from-lime-500/15 to-transparent blur-xl rounded-full" />
                        </div>
                    </div>
                </div>

                {/* Feature bullets below */}
                <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
                    {[
                        { icon: '⚡', title: 'Tiempo real', desc: 'Datos actualizados sin recargar la página' },
                        { icon: '📊', title: 'Reportes detallados', desc: 'Exporta en PDF, Excel y CSV con un clic' },
                        { icon: '🔐', title: 'Acceso seguro', desc: 'Roles y permisos por usuario y empresa' },
                    ].map((f) => (
                        <div
                            key={f.title}
                            className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 text-center hover:border-lime-500/40 transition-colors group"
                        >
                            <div className="text-2xl mb-3">{f.icon}</div>
                            <h3 className="text-white font-semibold text-sm mb-1 group-hover:text-lime-400 transition-colors">
                                {f.title}
                            </h3>
                            <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
