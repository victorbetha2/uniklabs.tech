"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CreditCard, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Subscription = {
  id: string;
  status: string;
  plan: string;
  started_at: string;
  current_period_end: string | null;
  app: {
    id: string;
    name: string;
  };
};

const statusVariantMap: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  active: "default",
  cancelled: "destructive",
  expired: "destructive",
  pending: "secondary",
};

const statusLabelMap: Record<string, string> = {
  active: "Activa",
  cancelled: "Cancelada",
  expired: "Expirada",
  pending: "Pendiente",
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function SubscriptionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState<string | null>(null);

  useEffect(() => {
    const success = searchParams.get("success");
    const cancelled = searchParams.get("cancelled");

    if (success === "true") {
      toast.success("¡Suscripción activada!", {
        description: "Tu suscripción ha sido procesada. Puede tardar unos minutos en activarse.",
      });
      router.replace("/dashboard/subscriptions");
    } else if (cancelled === "true") {
      toast.error("Suscripción cancelada", {
        description: "Puedes intentarlo de nuevo cuando quieras.",
      });
      router.replace("/dashboard/subscriptions");
    }
  }, [searchParams, router]);

  useEffect(() => {
    async function fetchSubscriptions() {
      try {
        const res = await fetch("/api/subscriptions");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = (await res.json()) as { subscriptions: Subscription[] };
        setSubscriptions(data.subscriptions);
      } catch {
        toast.error("No se pudieron cargar las suscripciones.");
      } finally {
        setIsLoading(false);
      }
    }
    void fetchSubscriptions();
  }, []);

  async function handleCancel(subscriptionId: string) {
    setIsCancelling(subscriptionId);
    try {
      const res = await fetch("/api/subscriptions/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId }),
      });
      const data = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok || !data.success) {
        toast.error(data.error ?? "No se pudo cancelar la suscripción.");
        return;
      }
      toast.success("Suscripción cancelada correctamente.");
      setSubscriptions((prev) =>
        prev.map((s) =>
          s.id === subscriptionId ? { ...s, status: "cancelled" } : s
        )
      );
    } catch {
      toast.error("Error de conexión. Intenta de nuevo.");
    } finally {
      setIsCancelling(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Suscripciones</h2>
        <p className="text-muted-foreground mt-1">
          Gestiona todas tus suscripciones activas y su historial.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Suscripciones activas</CardTitle>
          </div>
          <CardDescription>
            Aquí aparecerán todas tus suscripciones a apps de UnikLabs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="py-12 text-center">
              <CreditCard className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">
                No tienes suscripciones activas.
              </p>
              <Button asChild>
                <Link href="/dashboard/apps">Explorar apps</Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>App</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Inicio</TableHead>
                  <TableHead>Próximo pago</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium">{sub.app.name}</TableCell>
                    <TableCell className="capitalize">{sub.plan}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariantMap[sub.status] ?? "secondary"}>
                        {statusLabelMap[sub.status] ?? sub.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(sub.started_at)}</TableCell>
                    <TableCell>{formatDate(sub.current_period_end)}</TableCell>
                    <TableCell className="text-right">
                      {sub.status === "active" && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isCancelling === sub.id}
                          onClick={() => handleCancel(sub.id)}
                        >
                          {isCancelling === sub.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            "Cancelar"
                          )}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
