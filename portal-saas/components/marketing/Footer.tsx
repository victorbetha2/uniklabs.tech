"use client";

import Link from "next/link";
import Image from "next/image";

export default function Footer() {
    return (
        <footer className="py-12 bg-[#050505] border-t border-zinc-900">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    {/* Logo & Copyright */}
                    <div className="flex flex-col items-center md:items-start gap-4">
                        <Link href="/" className="flex items-center">
                            <Image
                                src="/images/LOGO.png"
                                alt="UnikLabs"
                                width={140}
                                height={40}
                                className="h-8 w-auto"
                                style={{ filter: 'brightness(0) invert(1)' }}
                            />
                        </Link>
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
                        <a href="mailto:victorbetha@gmail.com" className="text-sm text-gray-400 hover:text-white transition-colors">
                            Contacto
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
