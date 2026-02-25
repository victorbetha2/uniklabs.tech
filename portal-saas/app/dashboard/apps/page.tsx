"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, TrendingUp, ArrowRight, Loader2 } from "lucide-react";
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
    id: "ent",
    name: "ENT",
    icon: Building2,
    tagline: "Suite empresarial para reportes y gestión de datos.",
    tags: ["Reportes", "Dashboard", "Multi-usuario"],
    status: "Disponible",
    available: true,
    plans: [
      {
        id: "basic",
        label: "Basic",
        price: "$29/mes",
        description: "Para equipos pequeños. Reportes y dashboard básico.",
      },
      {
        id: "pro",
        label: "Pro",
        price: "$59/mes",
        description: "Sin límite de usuarios. Reportes avanzados y soporte.",
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
  const [selectedApp, setSelectedApp] = useState<App | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  function openDialog(app: App) {
    setSelectedApp(app);
    setSelectedPlan(app.plans[0]);
  }

  function closeDialog() {
    setSelectedApp(null);
    setSelectedPlan(null);
  }

  async function handleSubscribe() {
    if (!selectedApp || !selectedPlan) return;
    setIsLoading(true);

    try {
      const res = await fetch("/api/subscriptions/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appId: selectedApp.id, plan: selectedPlan.id }),
      });

      const data = (await res.json()) as { approvalUrl?: string; error?: string };

      if (!res.ok || !data.approvalUrl) {
        toast.error(data.error ?? "No se pudo iniciar la suscripción.");
        return;
      }

      router.push(data.approvalUrl);
    } catch {
      toast.error("Error de conexión. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
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
          return (
            <Card
              key={app.id}
              className={`transition-all duration-200 ${
                app.available
                  ? "hover:shadow-md hover:border-primary/30"
                  : "opacity-60"
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 rounded-xl bg-muted">
                    <Icon className="h-6 w-6" />
                  </div>
                  <Badge variant={app.available ? "default" : "secondary"}>
                    {app.status}
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
                  <Button className="w-full" onClick={() => openDialog(app)}>
                    Suscribirse
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={!!selectedApp} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Suscribirse a {selectedApp?.name}</DialogTitle>
            <DialogDescription>
              Elige un plan para comenzar. Serás redirigido a PayPal para
              completar el pago de forma segura.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            {selectedApp?.plans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => setSelectedPlan(plan)}
                className={`w-full text-left rounded-lg border p-4 transition-all ${
                  selectedPlan?.id === plan.id
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold">{plan.label}</span>
                  <span className="text-sm font-bold">{plan.price}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {plan.description}
                </p>
              </button>
            ))}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={closeDialog} disabled={isLoading}>
              Cancelar
            </Button>
            <Button onClick={handleSubscribe} disabled={isLoading || !selectedPlan}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Redirigiendo…
                </>
              ) : (
                "Ir a PayPal"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
