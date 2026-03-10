import { NextRequest, NextResponse } from "next/server";
import { getCurrentDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendCustomerWelcomeEmail, sendOwnerPurchaseNotification } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentDbUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    let body: { paypalSubscriptionId?: string; appId?: string; plan?: string };
    try {
      body = (await req.json()) as { paypalSubscriptionId?: string; appId?: string; plan?: string };
    } catch {
      return NextResponse.json({ error: "Body JSON inválido" }, { status: 400 });
    }

    const { paypalSubscriptionId, appId, plan } = body;

    if (!paypalSubscriptionId || !appId || !plan) {
      return NextResponse.json(
        { error: "Faltan paypalSubscriptionId, appId o plan en el body" },
        { status: 400 }
      );
    }

    const app = await prisma.app.findUnique({
      where: { slug: appId },
      select: {
        id: true,
        name: true,
        slug: true,
        accessAdminUrl: true,
        accessUserUrl: true,
        accessInstructionsMd: true,
      },
    });

    if (!app) {
      return NextResponse.json(
        { error: `App '${appId}' no encontrada` },
        { status: 404 }
      );
    }

    // Check if subscription already exists to avoid duplicates
    const existing = await prisma.subscription.findUnique({
      where: { paypal_subscription_id: paypalSubscriptionId }
    });

    if (existing) {
        return NextResponse.json({ success: true, message: "Suscripción ya registrada" });
    }

    // Create the subscription record in the database
    // We set it to 'active' because this endpoint is called after PayPal approval
    // The webhook will later confirm the payment and update details if needed
    const created = await prisma.subscription.create({
      data: {
        user_id: user.id,
        app_id: app.id,
        paypal_subscription_id: paypalSubscriptionId,
        status: "active",
        plan: plan.toLowerCase(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days
      },
    });

    try {
      await sendCustomerWelcomeEmail({
        customerEmail: user.email,
        customerName: user.name,
        plan: plan.toLowerCase(),
        subscriptionId: created.id,
        access: {
          appName: app.name,
          appSlug: app.slug,
          adminUrl: app.accessAdminUrl,
          userUrl: app.accessUserUrl,
          instructionsMd: app.accessInstructionsMd,
        },
      });
      console.info("[POST /api/subscriptions/activate] Welcome email sent", {
        subscriptionId: created.id,
        customerEmail: user.email,
        appSlug: app.slug,
      });
    } catch (emailErr) {
      const message = emailErr instanceof Error ? emailErr.message : String(emailErr);
      console.error("[POST /api/subscriptions/activate] Failed to send welcome email", {
        subscriptionId: created.id,
        customerEmail: user.email,
        appSlug: app.slug,
        message,
      });
    }

    try {
      await sendOwnerPurchaseNotification({
        customerEmail: user.email,
        customerName: user.name,
        appName: app.name,
        appSlug: app.slug,
        plan: plan.toLowerCase(),
        subscriptionId: created.id,
        paypalSubscriptionId,
      });
      console.info("[POST /api/subscriptions/activate] Owner purchase/activation email sent", {
        subscriptionId: created.id,
        customerEmail: user.email,
        appSlug: app.slug,
      });
    } catch (emailErr) {
      const message = emailErr instanceof Error ? emailErr.message : String(emailErr);
      console.error("[POST /api/subscriptions/activate] Failed to send owner notification", {
        subscriptionId: created.id,
        customerEmail: user.email,
        appSlug: app.slug,
        message,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[POST /api/subscriptions/activate]", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Error al activar suscripción",
      },
      { status: 500 }
    );
  }
}
