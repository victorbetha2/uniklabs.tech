import { CreditCard } from "lucide-react";
import Link from "next/link";
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

// Mock data – replace with Prisma query
const mockSubscriptions = [
  {
    id: "1",
    app: "ENT",
    plan: "Team",
    status: "active",
    startedAt: "01 Feb 2025",
    nextPayment: "15 Mar 2025",
    amount: "$29.00",
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

export default function SubscriptionsPage() {
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
          {mockSubscriptions.length === 0 ? (
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
                  <TableHead>Monto</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockSubscriptions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium">{sub.app}</TableCell>
                    <TableCell>{sub.plan}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          statusVariantMap[sub.status] ?? "secondary"
                        }
                      >
                        {statusLabelMap[sub.status] ?? sub.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{sub.startedAt}</TableCell>
                    <TableCell>{sub.nextPayment}</TableCell>
                    <TableCell>{sub.amount}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm">
                        Gestionar
                      </Button>
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
