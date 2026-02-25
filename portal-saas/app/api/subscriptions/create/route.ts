import { NextRequest, NextResponse } from "next/server";
import { getCurrentDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createPayPalSubscription } from "@/lib/paypal";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentDbUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    let body: { appId?: string; plan?: string };
    try {
      body = (await req.json()) as { appId?: string; plan?: string };
    } catch {
      return NextResponse.json({ error: "Body JSON inválido" }, { status: 400 });
    }

    const appId = body.appId?.trim().toLowerCase();
    const plan = body.plan?.trim().toLowerCase();

    if (!appId || !plan) {
      return NextResponse.json(
        { error: "Faltan appId o plan en el body" },
        { status: 400 }
      );
    }

    const app = await prisma.app.findUnique({
      where: { slug: appId },
      select: { id: true, name: true },
    });

    if (!app) {
      return NextResponse.json(
        { error: `App '${appId}' no encontrada` },
        { status: 404 }
      );
    }

    const planEnvKey = `PAYPAL_PLAN_${appId.toUpperCase()}_${plan.toUpperCase()}`;
    const paypalPlanId = process.env[planEnvKey];

    if (!paypalPlanId) {
      return NextResponse.json(
        { error: `Plan '${plan}' no disponible para '${appId}' (falta ${planEnvKey})` },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const returnUrl = `${appUrl}/dashboard/subscriptions?success=true`;
    const cancelUrl = `${appUrl}/dashboard/subscriptions?cancelled=true`;

    const { id: paypalSubscriptionId, approvalUrl } =
      await createPayPalSubscription(paypalPlanId, returnUrl, cancelUrl);

    await prisma.subscription.create({
      data: {
        user_id: user.id,
        app_id: app.id,
        paypal_subscription_id: paypalSubscriptionId,
        status: "pending",
        plan,
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    return NextResponse.json({ approvalUrl });
  } catch (err) {
    console.error("[POST /api/subscriptions/create]", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Error al crear suscripción",
      },
      { status: 500 }
    );
  }
}
