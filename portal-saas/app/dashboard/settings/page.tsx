import { currentUser } from "@clerk/nextjs/server";
import { User, Bell, Shield, Palette } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const settingSections = [
  {
    icon: User,
    title: "Perfil",
    description:
      "Administra tu nombre, email e información de cuenta. Los cambios se sincronizan desde Clerk.",
    badge: "Vía Clerk",
  },
  {
    icon: Bell,
    title: "Notificaciones",
    description:
      "Configura qué notificaciones quieres recibir por email y dentro de la plataforma.",
    badge: "Próximamente",
  },
  {
    icon: Shield,
    title: "Seguridad",
    description:
      "Contraseña, autenticación en dos pasos y sesiones activas. Disponible en tu perfil de Clerk.",
    badge: "Vía Clerk",
  },
  {
    icon: Palette,
    title: "Apariencia",
    description:
      "Personaliza el tema de la interfaz (claro, oscuro o sistema).",
    badge: "Próximamente",
  },
];

export default async function SettingsPage() {
  const user = await currentUser();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Configuración</h2>
        <p className="text-muted-foreground mt-1">
          Gestiona las preferencias de tu cuenta en UnikLabs.
        </p>
      </div>

      {/* Account info */}
      <Card>
        <CardHeader>
          <CardTitle>Información de cuenta</CardTitle>
          <CardDescription>
            Datos asociados a tu sesión activa.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-muted-foreground">Nombre</span>
            <span className="text-sm font-medium">
              {user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`
                : user?.firstName ?? "—"}
            </span>
          </div>
          <Separator />
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-muted-foreground">Email</span>
            <span className="text-sm font-medium">
              {user?.emailAddresses?.[0]?.emailAddress ?? "—"}
            </span>
          </div>
          <Separator />
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-muted-foreground">ID de usuario</span>
            <span className="text-xs font-mono text-muted-foreground truncate max-w-[200px]">
              {user?.id ?? "—"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Settings sections */}
      <div className="grid gap-3">
        {settingSections.map(({ icon: Icon, title, description, badge }) => (
          <Card key={title} className="opacity-80">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-muted mt-0.5">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-medium text-sm">{title}</p>
                    <Badge variant="secondary" className="text-xs">
                      {badge}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
