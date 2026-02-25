import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

const APPS_API_KEY = process.env.APPS_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const apiKey = req.headers.get("x-api-key")?.trim();
    if (!APPS_API_KEY || apiKey !== APPS_API_KEY) {
      return Response.json({ error: "API key inválida o no configurada" }, { status: 401 });
    }

    let body: { userId?: string; appId?: string };
    try {
      body = (await req.json()) as { userId?: string; appId?: string };
    } catch {
      return Response.json({ error: "Body JSON inválido" }, { status: 400 });
    }

    const userId = body.userId?.trim();
    const appId = body.appId?.trim();
    if (!userId || !appId) {
      return Response.json(
        { error: "Faltan userId o appId en el body" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerk_id: userId },
      select: { id: true },
    });
    if (!user) {
      return Response.json({
        hasAccess: false,
        plan: null,
        expiresAt: null,
      });
    }

    const app = await prisma.app.findUnique({
      where: { slug: appId },
      select: { id: true },
    });
    if (!app) {
      return Response.json({
        hasAccess: false,
        plan: null,
        expiresAt: null,
      });
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
      return Response.json({
        hasAccess: false,
        plan: null,
        expiresAt: null,
      });
    }

    return Response.json({
      hasAccess: true,
      plan: subscription.plan,
      expiresAt: subscription.current_period_end?.toISOString() ?? null,
    });
  } catch (err) {
    console.error("[POST /api/apps/verify-access]", err);
    return Response.json(
      { error: "Error al verificar acceso" },
      { status: 500 }
    );
  }
}
