"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-black/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 group">
            <Image
              src="/images/LOGO.png"
              alt="UnikLabs"
              width={140}
              height={40}
              className="h-8 w-auto group-hover:opacity-90 transition-opacity"
              style={{ filter: 'brightness(0) invert(1)' }}
            />
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-sm font-medium text-gray-400 hover:text-lime-400 transition-colors">
            Inicio
          </Link>
          <Link href="/#apps" className="text-sm font-medium text-gray-400 hover:text-lime-400 transition-colors">
            Nuestras Apps
          </Link>
          <Link href="/#faq" className="text-sm font-medium text-gray-400 hover:text-lime-400 transition-colors">
            FAQ
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <SignedOut>
            <Button variant="outline" className="hidden sm:inline-flex border-zinc-700 text-white hover:bg-zinc-800 hover:text-lime-400">
              <Link href="/sign-in">Iniciar sesión</Link>
            </Button>
            <Button className="bg-lime-500 text-black font-bold hover:bg-lime-400 transition-all shadow-[0_0_15px_rgba(132,204,22,0.3)]">
              <Link href="/sign-up">Empezar ahora</Link>
            </Button>
          </SignedOut>
          <SignedIn>
            <Button variant="outline" className="hidden sm:inline-flex border-zinc-700 text-white hover:bg-zinc-800 hover:text-lime-400 text-sm h-9 px-4">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </nav>
  );
}
