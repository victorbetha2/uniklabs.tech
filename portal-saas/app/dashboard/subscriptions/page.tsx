"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CreditCard, ExternalLink, Loader2 } from "lucide-react";
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

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Subscription = {
  id: string;
  status: string;
  plan: string;
  started_at: string;
  current_period_end: string | null;
  app: {
    id: string;
    slug: string;
    name: string;
    accessAdminUrl?: string | null;
    accessUserUrl?: string | null;
    accessInstructionsMd?: string | null;
  };
};

type InlineChunk = { type: "text"; text: string } | { type: "link"; text: string; href: string };

function parseInlineMarkdown(input: string): InlineChunk[] {
  const chunks: InlineChunk[] = [];
  const regex = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(input)) !== null) {
    if (match.index > cursor) {
      chunks.push({ type: "text", text: input.slice(cursor, match.index) });
    }
    chunks.push({ type: "link", text: match[1], href: match[2] });
    cursor = match.index + match[0].length;
  }

  if (cursor < input.length) {
    chunks.push({ type: "text", text: input.slice(cursor) });
  }

  return chunks;
}

function renderInlineMarkdown(input: string, keyPrefix: string): ReactNode[] {
  return parseInlineMarkdown(input).map((chunk, index) => {
    if (chunk.type === "text") {
      return <span key={`${keyPrefix}-text-${index}`}>{chunk.text}</span>;
    }
    return (
      <a
        key={`${keyPrefix}-link-${index}`}
        href={chunk.href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline-offset-4 hover:underline"
      >
        {chunk.text}
      </a>
    );
  });
}

function renderMarkdown(md?: string | null): ReactNode {
  if (!md?.trim()) return null;

  const lines = md.replaceAll("\r\n", "\n").split("\n");
  const nodes: ReactNode[] = [];
  let listBuffer: { type: "ul" | "ol"; items: string[] } | null = null;

  const flushList = (prefix: string) => {
    if (!listBuffer) return;
    if (listBuffer.type === "ul") {
      nodes.push(
        <ul key={`${prefix}-ul-${nodes.length}`} className="list-disc ml-6 space-y-1 text-sm">
          {listBuffer.items.map((item, index) => (
            <li key={`${prefix}-ul-item-${index}`}>{renderInlineMarkdown(item, `${prefix}-ul-${index}`)}</li>
          ))}
        </ul>
      );
    } else {
      nodes.push(
        <ol key={`${prefix}-ol-${nodes.length}`} className="list-decimal ml-6 space-y-1 text-sm">
          {listBuffer.items.map((item, index) => (
            <li key={`${prefix}-ol-item-${index}`}>{renderInlineMarkdown(item, `${prefix}-ol-${index}`)}</li>
          ))}
        </ol>
      );
    }
    listBuffer = null;
  };

  lines.forEach((rawLine, index) => {
    const line = rawLine.trim();
    const prefix = `md-${index}`;
    if (!line) {
      flushList(prefix);
      return;
    }
    if (line.startsWith("### ")) {
      flushList(prefix);
      nodes.push(
        <h4 key={`${prefix}-h4`} className="text-sm font-semibold mt-2">
          {renderInlineMarkdown(line.slice(4), `${prefix}-inline`)}
        </h4>
      );
      return;
    }
    if (line.startsWith("## ")) {
      flushList(prefix);
      nodes.push(
        <h3 key={`${prefix}-h3`} className="text-base font-semibold mt-2">
          {renderInlineMarkdown(line.slice(3), `${prefix}-inline`)}
        </h3>
      );
      return;
    }
    if (line.startsWith("# ")) {
      flushList(prefix);
      nodes.push(
        <h2 key={`${prefix}-h2`} className="text-lg font-semibold mt-2">
          {renderInlineMarkdown(line.slice(2), `${prefix}-inline`)}
        </h2>
      );
      return;
    }
    if (line.startsWith("- ")) {
      if (!listBuffer || listBuffer.type !== "ul") {
        flushList(prefix);
        listBuffer = { type: "ul", items: [] };
      }
      listBuffer.items.push(line.slice(2));
      return;
    }

    const orderedMatch = line.match(/^\d+\.\s+(.+)$/);
    if (orderedMatch) {
      if (!listBuffer || listBuffer.type !== "ol") {
        flushList(prefix);
        listBuffer = { type: "ol", items: [] };
      }
      listBuffer.items.push(orderedMatch[1]);
      return;
    }

    flushList(prefix);
    nodes.push(
      <p key={`${prefix}-p`} className="text-sm leading-relaxed">
        {renderInlineMarkdown(line, `${prefix}-inline`)}
      </p>
    );
  });

  flushList("md-end");
  return <div className="space-y-2">{nodes}</div>;
}

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
  const [subToCancel, setSubToCancel] = useState<Subscription | null>(null);
  const [selectedAccessSub, setSelectedAccessSub] = useState<Subscription | null>(null);

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

  async function handleCancel() {
    if (!subToCancel) return;
    const subscriptionId = subToCancel.id;
    setIsCancelling(subscriptionId);
    setSubToCancel(null);
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
                  <TableHead>Accesos</TableHead>
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
                    <TableCell>
                      {(sub.status === "active" || sub.status === "pending") &&
                      (sub.app.accessAdminUrl || sub.app.accessUserUrl || sub.app.accessInstructionsMd) ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedAccessSub(sub)}
                        >
                          Ver accesos
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {(sub.status === "active" || sub.status === "pending") && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isCancelling === sub.id}
                          onClick={() => setSubToCancel(sub)}
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

      <Dialog open={!!subToCancel} onOpenChange={(open) => !open && setSubToCancel(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>¿Confirmar cancelación?</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas cancelar tu suscripción a{" "}
              <strong>{subToCancel?.app.name}</strong>? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-0 mt-4">
            <Button variant="outline" onClick={() => setSubToCancel(null)}>
              No, mantener
            </Button>
            <Button variant="destructive" onClick={handleCancel}>
              Sí, cancelar suscripción
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!selectedAccessSub}
        onOpenChange={(open) => !open && setSelectedAccessSub(null)}
      >
        <DialogContent className="sm:max-w-[640px]">
          <DialogHeader>
            <DialogTitle>Accesos de {selectedAccessSub?.app.name}</DialogTitle>
            <DialogDescription>
              Links e instrucciones cargados para esta suscripción.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            {selectedAccessSub?.app.accessAdminUrl && (
              <a
                href={selectedAccessSub.app.accessAdminUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-md border p-3 text-sm hover:bg-muted/40"
              >
                <span>Acceso Admin</span>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </a>
            )}

            {selectedAccessSub?.app.accessUserUrl && (
              <a
                href={selectedAccessSub.app.accessUserUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-md border p-3 text-sm hover:bg-muted/40"
              >
                <span>Acceso App</span>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </a>
            )}

            {selectedAccessSub?.app.accessInstructionsMd ? (
              <div className="rounded-md border p-4 bg-muted/20">
                {renderMarkdown(selectedAccessSub.app.accessInstructionsMd)}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No hay instrucciones adicionales para esta app.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
