import { Receipt, DollarSign, Calendar, Download } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Mock data – replace with Prisma PaymentHistory query
const mockPayments = [
  {
    id: "ph_1",
    date: "01 Feb 2025",
    description: "ENT – Plan Team",
    amount: "$29.00",
    status: "paid",
  },
  {
    id: "ph_2",
    date: "01 Ene 2025",
    description: "ENT – Plan Team",
    amount: "$29.00",
    status: "paid",
  },
];

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Billing</h2>
        <p className="text-muted-foreground mt-1">
          Consulta tu historial de pagos y gestiona tu método de pago.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total gastado</p>
                <p className="text-xl font-bold">$58.00</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Próximo pago</p>
                <p className="text-xl font-bold">15 Mar 2025</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Receipt className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Facturas</p>
                <p className="text-xl font-bold">{mockPayments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment history */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de pagos</CardTitle>
          <CardDescription>
            Registro de todos tus cobros procesados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Separator className="mb-4" />
          {mockPayments.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              No hay pagos registrados aún.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Factura</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{payment.date}</TableCell>
                    <TableCell className="font-medium">
                      {payment.description}
                    </TableCell>
                    <TableCell>{payment.amount}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          payment.status === "paid" ? "default" : "secondary"
                        }
                      >
                        {payment.status === "paid" ? "Pagado" : payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" disabled>
                        <Download className="h-4 w-4 mr-1" />
                        PDF
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
