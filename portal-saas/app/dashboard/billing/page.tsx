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

      <Card className="border-dashed">
        <CardContent className="py-24 flex flex-col items-center justify-center text-center">
          <div className="p-4 rounded-full bg-muted mb-4">
            <Receipt className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Historial de facturación próximamente</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Estamos sincronizando los datos de facturación con PayPal.
            Tus facturas aparecerán aquí una vez que el sistema se active por completo.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
