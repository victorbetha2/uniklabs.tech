"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Grid,
  CreditCard,
  Receipt,
  Settings,
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Overview", exact: true },
  { href: "/dashboard/apps", icon: Grid, label: "Mis Apps", exact: false },
  { href: "/dashboard/subscriptions", icon: CreditCard, label: "Suscripciones", exact: false },
  { href: "/dashboard/billing", icon: Receipt, label: "Billing", exact: false },
  { href: "/dashboard/settings", icon: Settings, label: "Configuración", exact: false },
];

interface SidebarNavProps {
  onLinkClick?: () => void;
}

function SidebarNav({ onLinkClick }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 flex-1 px-3">
      {navItems.map(({ href, icon: Icon, label, exact }) => {
        const isActive = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onLinkClick}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

interface SidebarProps {
  onLinkClick?: () => void;
}

export function Sidebar({ onLinkClick }: SidebarProps) {
  return (
    <div className="flex h-full flex-col py-4">
      {/* Logo */}
      <div className="px-6 pb-4">
        <Link
          href="/dashboard"
          onClick={onLinkClick}
          className="flex items-center gap-2"
        >
          <span className="text-xl font-black tracking-tight">UnikLabs</span>
        </Link>
      </div>

      <Separator className="mb-4" />

      {/* Navigation */}
      <SidebarNav onLinkClick={onLinkClick} />

      <Separator className="mt-4 mb-4" />

      {/* User button */}
      <div className="px-6">
        <UserButton afterSignOutUrl="/" />
      </div>
    </div>
  );
}
