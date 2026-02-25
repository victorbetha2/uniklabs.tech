"use client";

import { usePathname } from "next/navigation";
import { Bell, Menu } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

const pathTitles: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/apps": "Mis Apps",
  "/dashboard/subscriptions": "Suscripciones",
  "/dashboard/billing": "Billing",
  "/dashboard/settings": "Configuración",
};

interface DashboardHeaderProps {
  onMenuClick?: () => void;
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const pathname = usePathname();
  const title = pathTitles[pathname] ?? "Dashboard";

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-6">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onMenuClick}
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Page title */}
      <h1 className="flex-1 text-xl font-semibold">{title}</h1>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" aria-label="Notificaciones">
          <Bell className="h-5 w-5" />
        </Button>
        <UserButton afterSignOutUrl="/" />
      </div>
    </header>
  );
}
