import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Scale, Gavel, Globe, CheckCircle } from 'lucide-react';

export const metadata = {
    title: "Términos de Uso | UnikLabs",
    description: "Consulta los términos y condiciones de uso de la plataforma UnikLabs.",
};

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-lime-500/30">
            {/* Background patterns */}
            <div className="fixed inset-0 z-0 opacity-10 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-lime-500 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-lime-900 rounded-full blur-[100px]" />
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
                        Términos de <span className="text-lime-400">Uso</span>
                    </h1>
                    <p className="text-zinc-400 text-lg md:text-xl leading-relaxed">
                        Al utilizar los servicios de UnikLabs, aceptas cumplir con los siguientes términos y condiciones. Por favor, léelos cuidadosamente.
                    </p>
                    <div className="h-1 w-20 bg-lime-500 mt-8 rounded-full" />
                </div>

                {/* Content Sections */}
                <div className="space-y-16">
                    {/* Section 1 */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-4 text-lime-400">
                            <Globe className="h-8 w-8" />
                            <h2 className="text-2xl font-bold">1. Aceptación del Servicio</h2>
                        </div>
                        <p className="text-zinc-300 leading-relaxed">
                            El acceso y uso de las aplicaciones y servicios de UnikLabs está condicionado a la aceptación y cumplimiento de estos términos. Estos términos se aplican a todos los visitantes, usuarios y otras personas que accedan al servicio.
                        </p>
                    </section>

                    {/* Section 2 */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-4 text-lime-400">
                            <CheckCircle className="h-8 w-8" />
                            <h2 className="text-2xl font-bold">2. Cuentas de Usuario</h2>
                        </div>
                        <div className="space-y-4 text-zinc-300 leading-relaxed">
                            <p>
                                Al crear una cuenta con nosotros, debes proporcionar información precisa y completa. El incumplimiento de esto constituye una violación de los términos, lo que puede resultar en la terminación inmediata de tu cuenta en nuestro servicio.
                            </p>
                            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40">
                                <p className="text-sm italic">
                                    Eres responsable de salvaguardar la contraseña que utilizas para acceder al servicio y de cualquier actividad o acción bajo tu contraseña.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Section 3 */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-4 text-lime-400">
                            <Scale className="h-8 w-8" />
                            <h2 className="text-2xl font-bold">3. Propiedad Intelectual</h2>
                        </div>
                        <p className="text-zinc-300 leading-relaxed">
                            El servicio y su contenido original, características y funcionalidad son y seguirán siendo propiedad exclusiva de UnikLabs y sus licenciantes. Nuestras marcas comerciales y nuestra imagen comercial no pueden utilizarse en relación con ningún producto o servicio sin el consentimiento previo por escrito de UnikLabs.
                        </p>
                    </section>

                    {/* Section 4 */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-4 text-lime-400">
                            <Gavel className="h-8 w-8" />
                            <h2 className="text-2xl font-bold">4. Limitación de Responsabilidad</h2>
                        </div>
                        <p className="text-zinc-300 leading-relaxed">
                            En ningún caso UnikLabs, ni sus directores, empleados o socios, serán responsables de cualquier daño indirecto, incidental, especial, consecuente o punitivo, incluidos, entre otros, la pérdida de beneficios, datos u otras pérdidas intangibles, resultantes de tu acceso o uso del servicio.
                        </p>
                    </section>

                    {/* Section 5 */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-4 text-lime-400">
                            <h2 className="text-2xl font-bold">5. Modificaciones</h2>
                        </div>
                        <p className="text-zinc-300 leading-relaxed">
                            Nos reservamos el derecho, a nuestra entera discreción, de modificar o reemplazar estos términos en cualquier momento. Si una revisión es material, intentaremos proporcionar un aviso de al menos 30 días antes de que los nuevos términos entren en vigor.
                        </p>
                    </section>
                </div>

                {/* Contact CTA */}
                <div className="mt-20 p-10 rounded-[2.5rem] bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 text-center">
                    <h3 className="text-2xl font-bold mb-4">¿Tienes dudas legales?</h3>
                    <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                        Estamos aquí para aclarar cualquier punto sobre el uso de nuestra plataforma.
                    </p>
                    <a
                        href="mailto:victorbetha@gmail.com"
                        className="inline-flex items-center justify-center px-8 py-4 bg-lime-500 text-black font-black rounded-2xl hover:bg-lime-400 transition-all shadow-[0_0_20px_rgba(132,204,22,0.2)]"
                    >
                        Contactar Soporte Legal
                    </a>
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
