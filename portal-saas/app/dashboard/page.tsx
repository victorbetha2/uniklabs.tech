import { currentUser } from "@clerk/nextjs/server";
import {
  Grid,
  CreditCard,
  Calendar,
  DollarSign,
  Building2,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import { getCurrentDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const availableApps = [
  {
    id: "ent",
    name: "ENT",
    icon: Building2,
    description:
      "Suite empresarial para generación de reportes y gestión de datos.",
    tags: ["Reportes", "Dashboard", "Multi-usuario"],
    link: "/apps/ent",
    available: true,
  },
  {
    id: "finaly",
    name: "Finaly",
    icon: TrendingUp,
    description:
      "Gestión inteligente de finanzas personales. Conecta tus cuentas y visualiza gastos.",
    tags: ["Finanzas", "Analytics", "Personal"],
    link: "/apps/finaly",
    available: false,
  },
];

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

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Buen día";
  if (hour < 18) return "Buenas tardes";
  return "Buenas noches";
}

export default async function DashboardPage() {
  const clerkUser = await currentUser();
  const dbUser = await getCurrentDbUser();
  const greeting = getGreeting();
  const displayName = clerkUser?.firstName ?? clerkUser?.emailAddresses?.[0]?.emailAddress ?? "usuario";

  // Fetch real data from DB
  const subscriptions = dbUser
    ? await prisma.subscription.findMany({
      where: { user_id: dbUser.id },
      include: { app: true },
      orderBy: { created_at: "desc" },
    })
    : [];

  const payments = dbUser
    ? await prisma.paymentHistory.findMany({
      where: {
        subscription: { user_id: dbUser.id },
        status: "completed",
      },
    })
    : [];

  const totalSpent = payments.reduce((acc, p) => acc + Number(p.amount), 0);
  const activeSubs = subscriptions.filter((s) => s.status === "active");
  const nextPayment = activeSubs.length > 0
    ? activeSubs[0].current_period_end?.toLocaleDateString("es-ES", { day: 'numeric', month: 'short', year: 'numeric' })
    : "N/A";

  const stats = [
    {
      label: "Apps activas",
      value: activeSubs.length.toString(),
      icon: Grid,
      description: activeSubs.length > 0 ? activeSubs.map(s => s.app.name).join(", ") : "Sin apps activas",
    },
    {
      label: "Suscripciones totales",
      value: subscriptions.length.toString(),
      icon: CreditCard,
      description: "Todas tus suscripciones",
    },
    {
      label: "Próximo pago",
      value: nextPayment ?? "---",
      icon: Calendar,
      description: activeSubs.length > 0 ? "Renovación automática" : "Sin pagos pendientes",
    },
    {
      label: "Total gastado",
      value: `$${totalSpent.toFixed(2)}`,
      icon: DollarSign,
      description: "Histórico total",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {greeting}, {displayName}
        </h2>
        <p className="text-muted-foreground mt-1">
          Aquí tienes un resumen de tu actividad en UnikLabs.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, description }) => (
          <Card key={label}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {label}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Subscriptions table */}
      <Card>
        <CardHeader>
          <CardTitle>Mis Suscripciones</CardTitle>
          <CardDescription>
            Gestiona tus suscripciones activas y su estado.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {subscriptions.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No tienes suscripciones activas.{" "}
              <Link href="/dashboard/apps" className="underline">
                Explorar apps
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>App</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Estado</TableHead>
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
                    <TableCell>
                      {sub.current_period_end?.toLocaleDateString("es-ES") ?? "---"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/dashboard/subscriptions">Gestionar</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Available apps */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Apps disponibles</h3>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          {availableApps.map((app) => {
            const Icon = app.icon;
            return (
              <Card
                key={app.id}
                className={`relative overflow-hidden transition-all duration-200 ${app.available
                    ? "hover:shadow-md hover:border-primary/30 cursor-pointer"
                    : "opacity-60"
                  }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 rounded-xl bg-muted">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{app.name}</h4>
                        {!app.available && (
                          <Badge variant="secondary" className="text-xs">
                            Próximamente
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {app.description}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {app.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground border"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    {app.available && (
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={app.link}>
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
