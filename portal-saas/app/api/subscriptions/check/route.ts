import { NextRequest } from "next/server";
import { getCurrentDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentDbUser();
    if (!user) {
      return Response.json({ error: "No autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const appId = searchParams.get("appId");
    if (!appId?.trim()) {
      return Response.json(
        { error: "Falta el parámetro appId (slug de la app, ej: finaly)" },
        { status: 400 }
      );
    }

    const app = await prisma.app.findUnique({
      where: { slug: appId.trim() },
      select: { id: true },
    });
    if (!app) {
      return Response.json(
        { hasAccess: false, plan: null, expiresAt: null },
        { status: 200 }
      );
    }

    const now = new Date();
    const subscription = await prisma.subscription.findFirst({
      where: {
        user_id: user.id,
        app_id: app.id,
        status: "active",
        current_period_end: { gt: now },
      },
      orderBy: { current_period_end: "desc" },
      select: { plan: true, current_period_end: true },
    });

    if (!subscription) {
      return Response.json(
        {
          hasAccess: false,
          plan: null,
          expiresAt: null,
        },
        { status: 200 }
      );
    }

    return Response.json({
      hasAccess: true,
      plan: subscription.plan,
      expiresAt: subscription.current_period_end?.toISOString() ?? null,
    });
  } catch (err) {
    console.error("[GET /api/subscriptions/check]", err);
    return Response.json(
      { error: "Error al verificar suscripción" },
      { status: 500 }
    );
  }
}
