"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Building2, TrendingUp, ArrowRight, CheckCircle2, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

type AppAccess = {
  name: string;
  accessAdminUrl?: string | null;
  accessUserUrl?: string | null;
  accessInstructionsMd?: string | null;
};

type InlineChunk = { type: "text"; text: string } | { type: "link"; text: string; href: string };

function parseInlineMarkdown(input: string): InlineChunk[] {
  const chunks: InlineChunk[] = [];
  const regex = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g;
  let cursor = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(input)) !== null) {
    if (match.index > cursor) chunks.push({ type: "text", text: input.slice(cursor, match.index) });
    chunks.push({ type: "link", text: match[1], href: match[2] });
    cursor = match.index + match[0].length;
  }
  if (cursor < input.length) chunks.push({ type: "text", text: input.slice(cursor) });
  return chunks;
}

function renderInlineMarkdown(input: string, keyPrefix: string): ReactNode[] {
  return parseInlineMarkdown(input).map((chunk, index) => {
    if (chunk.type === "text") return <span key={`${keyPrefix}-text-${index}`}>{chunk.text}</span>;
    return (
      <a key={`${keyPrefix}-link-${index}`} href={chunk.href} target="_blank" rel="noopener noreferrer" className="text-primary underline-offset-4 hover:underline">
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
      nodes.push(<ul key={`${prefix}-ul`} className="list-disc ml-6 space-y-1 text-sm">{listBuffer.items.map((item, i) => <li key={`${prefix}-${i}`}>{renderInlineMarkdown(item, `${prefix}-${i}`)}</li>)}</ul>);
    } else {
      nodes.push(<ol key={`${prefix}-ol`} className="list-decimal ml-6 space-y-1 text-sm">{listBuffer.items.map((item, i) => <li key={`${prefix}-${i}`}>{renderInlineMarkdown(item, `${prefix}-${i}`)}</li>)}</ol>);
    }
    listBuffer = null;
  };
  lines.forEach((rawLine, index) => {
    const line = rawLine.trim();
    const prefix = `md-${index}`;
    if (!line) { flushList(prefix); return; }
    if (line.startsWith("### ")) { flushList(prefix); nodes.push(<h4 key={prefix} className="text-sm font-semibold mt-2">{renderInlineMarkdown(line.slice(4), prefix)}</h4>); return; }
    if (line.startsWith("## ")) { flushList(prefix); nodes.push(<h3 key={prefix} className="text-base font-semibold mt-2">{renderInlineMarkdown(line.slice(3), prefix)}</h3>); return; }
    if (line.startsWith("# ")) { flushList(prefix); nodes.push(<h2 key={prefix} className="text-lg font-semibold mt-2">{renderInlineMarkdown(line.slice(2), prefix)}</h2>); return; }
    if (line.startsWith("- ")) {
      if (!listBuffer || listBuffer.type !== "ul") { flushList(prefix); listBuffer = { type: "ul", items: [] }; }
      listBuffer.items.push(line.slice(2)); return;
    }
    const orderedMatch = line.match(/^\d+\.\s+(.+)$/);
    if (orderedMatch) {
      if (!listBuffer || listBuffer.type !== "ol") { flushList(prefix); listBuffer = { type: "ol", items: [] }; }
      listBuffer.items.push(orderedMatch[1]); return;
    }
    flushList(prefix);
    nodes.push(<p key={prefix} className="text-sm leading-relaxed">{renderInlineMarkdown(line, prefix)}</p>);
  });
  flushList("end");
  return <div className="space-y-2">{nodes}</div>;
}

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
  const [appAccessBySlug, setAppAccessBySlug] = useState<Record<string, AppAccess>>({});
  const [selectedAccessApp, setSelectedAccessApp] = useState<AppAccess | null>(null);

  useEffect(() => {
    async function fetchSubscriptions() {
      try {
        const res = await fetch("/api/subscriptions");
        if (!res.ok) return;
        const data = await res.json();
        const subs = data.subscriptions?.filter((s: { status: string }) => s.status === "active" || s.status === "pending") ?? [];
        const ids = new Set<string>(subs.map((s: { app: { slug: string } }) => s.app.slug));
        setSubscribedAppIds(ids);
        const access: Record<string, AppAccess> = {};
        for (const s of subs) {
          const slug = s.app?.slug;
          if (slug && !access[slug]) {
            access[slug] = {
              name: s.app.name,
              accessAdminUrl: s.app.accessAdminUrl,
              accessUserUrl: s.app.accessUserUrl,
              accessInstructionsMd: s.app.accessInstructionsMd,
            };
          }
        }
        setAppAccessBySlug(access);
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
                      <div className="flex flex-col gap-2">
                        <Button className="w-full" variant="secondary" asChild>
                          <Link href="/dashboard/subscriptions">
                            Gestionar suscripción
                            <CheckCircle2 className="ml-2 h-4 w-4 text-primary" />
                          </Link>
                        </Button>
                        {appAccessBySlug[app.id] &&
                          (appAccessBySlug[app.id].accessAdminUrl ||
                            appAccessBySlug[app.id].accessUserUrl ||
                            appAccessBySlug[app.id].accessInstructionsMd) && (
                          <Button
                            className="w-full"
                            variant="outline"
                            onClick={() => setSelectedAccessApp(appAccessBySlug[app.id])}
                          >
                            Ver accesos
                            <ExternalLink className="ml-2 h-4 w-4" />
                          </Button>
                        )}
                      </div>
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

      <Dialog open={!!selectedAccessApp} onOpenChange={(open) => !open && setSelectedAccessApp(null)}>
        <DialogContent className="sm:max-w-[640px]">
          <DialogHeader>
            <DialogTitle>Accesos de {selectedAccessApp?.name}</DialogTitle>
            <DialogDescription>Enlaces e instrucciones para esta app.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {selectedAccessApp?.accessAdminUrl && (
              <a
                href={selectedAccessApp.accessAdminUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-md border p-3 text-sm hover:bg-muted/40"
              >
                <span>Acceso Admin</span>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </a>
            )}
            {selectedAccessApp?.accessUserUrl && (
              <a
                href={selectedAccessApp.accessUserUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-md border p-3 text-sm hover:bg-muted/40"
              >
                <span>Acceso App</span>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </a>
            )}
            {selectedAccessApp?.accessInstructionsMd ? (
              <div className="rounded-md border p-4 bg-muted/20">{renderMarkdown(selectedAccessApp.accessInstructionsMd)}</div>
            ) : (
              <p className="text-sm text-muted-foreground">No hay instrucciones adicionales para esta app.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
