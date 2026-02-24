"use client";

import Link from "next/link";
import { Zap } from "lucide-react";

export default function Footer() {
    return (
        <footer className="py-12 bg-[#050505] border-t border-zinc-900">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    {/* Logo & Copyright */}
                    <div className="flex flex-col items-center md:items-start gap-4">
                        <div className="flex items-center gap-2">
                            <Zap className="h-6 w-6 text-lime-500 fill-lime-500/20" />
                            <span className="text-xl font-bold text-white tracking-tight">
                                UnikLabs
                            </span>
                        </div>
                        <p className="text-gray-500 text-sm">
                            © {new Date().getFullYear()} UnikLabs. Todos los derechos reservados.
                        </p>
                    </div>

                    {/* Links */}
                    <div className="flex items-center gap-8">
                        <Link href="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">
                            Privacidad
                        </Link>
                        <Link href="/terms" className="text-sm text-gray-400 hover:text-white transition-colors">
                            Términos de Uso
                        </Link>
                        <Link href="/contact" className="text-sm text-gray-400 hover:text-white transition-colors">
                            Contacto
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
