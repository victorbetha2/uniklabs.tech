import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Lock, Eye, FileText } from 'lucide-react';

export const metadata = {
    title: "Política de Privacidad | UnikLabs",
    description: "Aprende cómo protegemos tu información y garantizamos tu privacidad en UnikLabs.",
};

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-lime-500/30">
            {/* Background patterns */}
            <div className="fixed inset-0 z-0 opacity-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-lime-500 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-lime-900 rounded-full blur-[100px]" />
            </div>

            <main className="relative z-10 container mx-auto px-6 py-20 max-w-4xl">
                {/* Navigation */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-zinc-500 hover:text-lime-400 transition-colors mb-12 group"
                >
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    Volver al inicio
                </Link>

                {/* Header */}
                <div className="mb-16">
                    <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
                        Política de <span className="text-lime-400">Privacidad</span>
                    </h1>
                    <p className="text-zinc-400 text-lg md:text-xl leading-relaxed">
                        En UnikLabs, la protección de tus datos no es solo una obligación legal, es una prioridad fundamental.
                        Esta política detalla cómo recopilamos, usamos y resguardamos tu información personal.
                    </p>
                    <div className="h-1 w-20 bg-lime-500 mt-8 rounded-full" />
                </div>

                {/* Content Sections */}
                <div className="space-y-16">
                    {/* Section 1 */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-4 text-lime-400">
                            <ShieldCheck className="h-8 w-8" />
                            <h2 className="text-2xl font-bold">Compromiso de Seguridad</h2>
                        </div>
                        <div className="space-y-4 text-zinc-300 leading-relaxed">
                            <p>
                                Implementamos las tecnologías de cifrado más avanzadas de la industria para garantizar que cada bit de información que compartes con nosotros esté seguro. Nuestro ecosistema digital está diseñado bajo el principio de "Privacidad por Diseño".
                            </p>
                        </div>
                    </section>

                    {/* Section 2 */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-4 text-lime-400">
                            <Lock className="h-8 w-8" />
                            <h2 className="text-2xl font-bold">Recopilación de Datos</h2>
                        </div>
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 hover:border-lime-500/30 transition-colors">
                                <h3 className="text-lg font-semibold mb-3 text-white">Información que nos proporcionas</h3>
                                <p className="text-sm text-zinc-400">
                                    Nombres, correos electrónicos y detalles de la empresa proporcionados durante el registro para personalizar tu experiencia.
                                </p>
                            </div>
                            <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 hover:border-lime-500/30 transition-colors">
                                <h3 className="text-lg font-semibold mb-3 text-white">Uso de Cookies</h3>
                                <p className="text-sm text-zinc-400">
                                    Utilizamos cookies esenciales para el funcionamiento de la plataforma y herramientas analíticas para mejorar nuestros servicios.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Section 3 */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-4 text-lime-400">
                            <Eye className="h-8 w-8" />
                            <h2 className="text-2xl font-bold">Uso de la Información</h2>
                        </div>
                        <ul className="space-y-4 text-zinc-300 list-disc pl-6 marker:text-lime-500">
                            <li>Mejorar y optimizar nuestras aplicaciones SaaS.</li>
                            <li>Proporcionar soporte técnico personalizado y eficiente.</li>
                            <li>Informar sobre actualizaciones críticas del sistema y nuevas funcionalidades.</li>
                            <li>Garantizar el cumplimiento de nuestros términos de servicio.</li>
                        </ul>
                    </section>

                    {/* Section 4 */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-4 text-lime-400">
                            <FileText className="h-8 w-8" />
                            <h2 className="text-2xl font-bold">Tus Derechos</h2>
                        </div>
                        <p className="text-zinc-300 leading-relaxed">
                            Tienes derecho a acceder, rectificar o eliminar tus datos personales en cualquier momento. Si deseas ejercer estos derechos o tienes preguntas sobre cómo manejamos tu información, puedes contactarnos directamente.
                        </p>
                        <div className="p-8 rounded-3xl bg-lime-500/5 border border-lime-500/20 text-center">
                            <p className="text-zinc-400 mb-4 font-medium uppercase tracking-widest text-xs">Contacto Legal</p>
                            <a
                                href="mailto:victorbetha@gmail.com"
                                className="text-2xl font-bold text-lime-400 hover:text-lime-300 transition-colors"
                            >
                                victorbetha@gmail.com
                            </a>
                        </div>
                    </section>
                </div>

                {/* Footer info */}
                <div className="mt-24 pt-12 border-t border-zinc-900 text-center">
                    <p className="text-zinc-500 text-sm">
                        Última actualización: Febrero 2026
                    </p>
                </div>
            </main>
        </div>
    );
}
