import { Building2, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const apps = [
  {
    id: "ent",
    name: "ENT",
    icon: Building2,
    tagline: "Suite empresarial para reportes y gestión de datos.",
    tags: ["Reportes", "Dashboard", "Multi-usuario"],
    status: "Disponible",
    available: true,
    link: "/apps/ent",
  },
  {
    id: "finaly",
    name: "Finaly",
    icon: TrendingUp,
    tagline: "Gestión inteligente de finanzas personales.",
    tags: ["Finanzas", "Analytics", "Personal"],
    status: "Próximamente",
    available: false,
    link: "/apps/finaly",
  },
];

export default function AppsPage() {
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
                  <Button className="w-full" asChild>
                    <Link href={app.link}>
                      Ver planes
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
