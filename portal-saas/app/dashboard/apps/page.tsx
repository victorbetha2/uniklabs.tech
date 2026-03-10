"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, TrendingUp, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

type Plan = { id: string; label: string; price: string; description: string };
type App = {
  id: string;
  name: string;
  icon: React.ElementType;
  tagline: string;
  tags: string[];
  status: string;
  available: boolean;
  plans: Plan[];
};

const apps: App[] = [
  {
    id: "report",
    name: "ReporT",
    icon: Building2,
    tagline: "Suite empresarial para reportes y gestión de datos.",
    tags: ["Reportes", "Dashboard", "Multi-usuario"],
    status: "Disponible",
    available: true,
    plans: [
      {
        id: "starter",
        label: "Starter",
        price: "$29/mes",
        description: "Perfecto para equipos pequeños que están empezando.",
      },
      {
        id: "team",
        label: "Team",
        price: "$69/mes",
        description: "Para equipos en crecimiento que necesitan más control.",
      },
      {
        id: "business",
        label: "Business",
        price: "$109/mes",
        description: "Potencia total para empresas con operaciones complejas.",
      },
      {
        id: "enterprise",
        label: "Enterprise",
        price: "$249/mes",
        description: "Solución a medida para grandes corporaciones.",
      },
    ],
  },
  {
    id: "finaly",
    name: "Finaly",
    icon: TrendingUp,
    tagline: "Gestión inteligente de finanzas personales.",
    tags: ["Finanzas", "Analytics", "Personal"],
    status: "Próximamente",
    available: false,
    plans: [
      {
        id: "basic",
        label: "Basic",
        price: "$9/mes",
        description: "Seguimiento de gastos y presupuestos.",
      },
      {
        id: "pro",
        label: "Pro",
        price: "$19/mes",
        description: "Analytics avanzados y metas financieras.",
      },
    ],
  },
];

export default function AppsPage() {
  const router = useRouter();
  const [subscribedAppIds, setSubscribedAppIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchSubscriptions() {
      try {
        const res = await fetch("/api/subscriptions");
        if (!res.ok) return;
        const data = await res.json();
        // Extract IDs of apps with active or pending subscriptions
        const ids = new Set<string>(
          data.subscriptions
            .filter((s: any) => s.status === "active" || s.status === "pending")
            .map((s: any) => s.app.slug)
        );
        setSubscribedAppIds(ids);
      } catch (err) {
        console.error("Failed to fetch subscriptions", err);
      }
    }
    fetchSubscriptions();
  }, []);

  async function handleSubscribe(app: App) {
    router.push(`/dashboard/checkout/${app.id}`);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Mis Apps</h2>
        <p className="text-muted-foreground mt-1">
          Explora y suscríbete a las aplicaciones del ecosistema UnikLabs.
        </p>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {apps.map((app) => {
          const Icon = app.icon;
          const isSubscribed = subscribedAppIds.has(app.id);

          return (
            <Card
              key={app.id}
              className={`transition-all duration-200 ${app.available
                ? "hover:shadow-md hover:border-primary/30"
                : "opacity-60"
                }`}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 rounded-xl bg-muted">
                    <Icon className="h-6 w-6" />
                  </div>
                  <Badge variant={isSubscribed ? "outline" : app.available ? "default" : "secondary"}>
                    {isSubscribed ? "Suscrito" : app.status}
                  </Badge>
                </div>
                <h3 className="font-semibold text-lg mb-1">{app.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {app.tagline}
                </p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {app.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground border"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                {app.available && (
                  <>
                    {isSubscribed ? (
                      <Button className="w-full" variant="secondary" asChild>
                        <Link href="/dashboard/subscriptions">
                          Gestionar suscripción
                          <CheckCircle2 className="ml-2 h-4 w-4 text-primary" />
                        </Link>
                      </Button>
                    ) : (
                      <Button className="w-full" onClick={() => handleSubscribe(app)}>
                        Suscribirse
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
