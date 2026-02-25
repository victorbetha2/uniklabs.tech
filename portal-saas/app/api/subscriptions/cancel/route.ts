import { NextRequest } from "next/server";
import { getCurrentDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function cancelPayPalSubscription(subscriptionId: string): Promise<void> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_SECRET;
  const sandbox = process.env.PAYPAL_SANDBOX !== "false";
  const baseUrl = sandbox
    ? "https://api-m.sandbox.paypal.com"
    : "https://api-m.paypal.com";

  if (!clientId || !clientSecret) {
    throw new Error("PayPal credentials not configured");
  }

  const tokenRes = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  });
  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    throw new Error(`PayPal token failed: ${err}`);
  }
  const { access_token } = (await tokenRes.json()) as { access_token: string };

  const cancelRes = await fetch(
    `${baseUrl}/v1/billing/subscriptions/${subscriptionId}/cancel`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reason: "User requested cancellation" }),
    }
  );
  if (!cancelRes.ok) {
    const err = await cancelRes.text();
    throw new Error(`PayPal cancel failed: ${err}`);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentDbUser();
    if (!user) {
      return Response.json({ error: "No autenticado" }, { status: 401 });
    }

    let body: { subscriptionId?: string };
    try {
      body = (await req.json()) as { subscriptionId?: string };
    } catch {
      return Response.json(
        { error: "Body JSON inválido" },
        { status: 400 }
      );
    }

    const subscriptionId = body.subscriptionId?.trim();
    if (!subscriptionId) {
      return Response.json(
        { error: "Falta subscriptionId en el body" },
        { status: 400 }
      );
    }

    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      select: {
        id: true,
        user_id: true,
        status: true,
        paypal_subscription_id: true,
      },
    });

    if (!subscription) {
      return Response.json(
        { error: "Suscripción no encontrada" },
        { status: 404 }
      );
    }

    if (subscription.user_id !== user.id) {
      return Response.json(
        { error: "No tienes permiso para cancelar esta suscripción" },
        { status: 403 }
      );
    }

    if (subscription.status === "cancelled") {
      return Response.json(
        { error: "La suscripción ya está cancelada" },
        { status: 400 }
      );
    }

    if (subscription.paypal_subscription_id) {
      try {
        await cancelPayPalSubscription(subscription.paypal_subscription_id);
      } catch (paypalErr) {
        console.error("[POST /api/subscriptions/cancel] PayPal error:", paypalErr);
        return Response.json(
          {
            error:
              paypalErr instanceof Error
                ? paypalErr.message
                : "Error al cancelar en PayPal",
          },
          { status: 502 }
        );
      }
    }

    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: "cancelled",
        cancelled_at: new Date(),
        updated_at: new Date(),
      },
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error("[POST /api/subscriptions/cancel]", err);
    return Response.json(
      { error: "Error al cancelar suscripción" },
      { status: 500 }
    );
  }
}
