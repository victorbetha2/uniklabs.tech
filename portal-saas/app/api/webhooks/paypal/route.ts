import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPayPalBaseUrl } from "@/lib/paypal";
import { provisionAdmin } from "@/lib/report-reporte";
import {
  sendCustomerWelcomeEmail,
  sendOwnerCancellationNotification,
} from "@/lib/email";

type PayPalWebhookEvent = {
  event_type: string;
  resource: {
    id?: string;
    billing_agreement_id?: string;
    amount?: { total?: string; currency?: string };
    [key: string]: unknown;
  };
};

async function verifyWebhookSignature(
  body: string,
  headers: Headers
): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_SECRET;

  if (!webhookId || !clientId || !clientSecret) {
    console.warn(
      "[PayPal webhook] Missing PAYPAL_WEBHOOK_ID, PAYPAL_CLIENT_ID, or PAYPAL_SECRET"
    );
    return false;
  }

  const baseUrl = getPayPalBaseUrl();

  const verifyRes = await fetch(
    `${baseUrl}/v1/notifications/verify-webhook-signature`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
      body: JSON.stringify({
        auth_algo: headers.get("paypal-auth-algo"),
        cert_url: headers.get("paypal-cert-url"),
        transmission_id: headers.get("paypal-transmission-id"),
        transmission_sig: headers.get("paypal-transmission-sig"),
        transmission_time: headers.get("paypal-transmission-time"),
        webhook_id: webhookId,
        webhook_event: JSON.parse(body),
      }),
    }
  );

  if (!verifyRes.ok) {
    console.error(
      "[PayPal webhook] Signature verification request failed:",
      await verifyRes.text()
    );
    return false;
  }

  const result = (await verifyRes.json()) as { verification_status: string };
  return result.verification_status === "SUCCESS";
}

export async function POST(req: NextRequest) {
  const body = await req.text();

  const isValid = await verifyWebhookSignature(body, req.headers);
  if (!isValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: PayPalWebhookEvent;
  try {
    event = JSON.parse(body) as PayPalWebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    switch (event.event_type) {
      case "BILLING.SUBSCRIPTION.ACTIVATED": {
        const subscriptionId = event.resource?.id;
        if (subscriptionId) {
          const subscription = await prisma.subscription.findFirst({
            where: { paypal_subscription_id: subscriptionId },
            include: { user: true, app: true },
          });
          if (subscription) {
            const wasPending = subscription.status !== "active";
            await prisma.subscription.update({
              where: { id: subscription.id },
              data: { status: "active" },
            });

            if (wasPending) {
              try {
                await sendCustomerWelcomeEmail({
                customerEmail: subscription.user.email,
                customerName: subscription.user.name,
                plan: subscription.plan,
                subscriptionId: subscription.id,
                access: {
                  appName: subscription.app.name,
                  appSlug: subscription.app.slug,
                  adminUrl: subscription.app.accessAdminUrl,
                  userUrl: subscription.app.accessUserUrl,
                  instructionsMd: subscription.app.accessInstructionsMd,
                },
              });
              console.info("[PayPal webhook] Welcome email sent", {
                subscriptionId: subscription.id,
                customerEmail: subscription.user.email,
                appSlug: subscription.app.slug,
              });
            } catch (emailErr) {
              const message = emailErr instanceof Error ? emailErr.message : String(emailErr);
              console.error("[PayPal webhook] Failed to send welcome email", {
                subscriptionId: subscription.id,
                customerEmail: subscription.user.email,
                appSlug: subscription.app.slug,
                message,
              });
            }
            }

            if (subscription.app.slug === "report") {
              const name = subscription.user.name?.trim() ?? "";
              const spaceIndex = name.indexOf(" ");
              const nombre = spaceIndex >= 0 ? name.slice(0, spaceIndex) : name || "Usuario";
              const apellido = spaceIndex >= 0 ? name.slice(spaceIndex + 1).trim() : "";
              void provisionAdmin({
                email: subscription.user.email,
                nombre,
                apellido,
                membresiaId: subscription.id,
              }).catch((err) => {
                const message = err instanceof Error ? err.message : String(err);
                console.error("[PayPal webhook] ReporT provision failed (non-blocking)", {
                  membresiaId: subscription.id,
                  email: subscription.user.email,
                  message,
                });
              });
            }
          } else {
            await prisma.subscription.updateMany({
              where: { paypal_subscription_id: subscriptionId },
              data: { status: "active" },
            });
          }
        }
        break;
      }

      case "BILLING.SUBSCRIPTION.CANCELLED": {
        const subscriptionId = event.resource?.id;
        if (subscriptionId) {
          const subscription = await prisma.subscription.findFirst({
            where: { paypal_subscription_id: subscriptionId },
            include: { user: true, app: true },
          });
          if (subscription) {
            await prisma.subscription.update({
              where: { id: subscription.id },
              data: { status: "cancelled", cancelled_at: new Date() },
            });
            try {
              await sendOwnerCancellationNotification({
                customerEmail: subscription.user.email,
                customerName: subscription.user.name,
                appName: subscription.app.name,
                appSlug: subscription.app.slug,
                plan: subscription.plan,
                subscriptionId: subscription.id,
                paypalSubscriptionId: subscription.paypal_subscription_id,
                reason: "cancelled",
              });
              console.info("[PayPal webhook] Owner cancellation email sent", {
                subscriptionId: subscription.id,
                customerEmail: subscription.user.email,
                appSlug: subscription.app.slug,
                reason: "cancelled",
              });
            } catch (emailErr) {
              const message = emailErr instanceof Error ? emailErr.message : String(emailErr);
              console.error("[PayPal webhook] Failed to send owner cancellation email", {
                subscriptionId: subscription.id,
                customerEmail: subscription.user.email,
                appSlug: subscription.app.slug,
                reason: "cancelled",
                message,
              });
            }
          } else {
            await prisma.subscription.updateMany({
              where: { paypal_subscription_id: subscriptionId },
              data: { status: "cancelled", cancelled_at: new Date() },
            });
          }
        }
        break;
      }

      case "BILLING.SUBSCRIPTION.EXPIRED": {
        const subscriptionId = event.resource?.id;
        if (subscriptionId) {
          const subscription = await prisma.subscription.findFirst({
            where: { paypal_subscription_id: subscriptionId },
            include: { user: true, app: true },
          });
          if (subscription) {
            await prisma.subscription.update({
              where: { id: subscription.id },
              data: { status: "expired" },
            });
            try {
              await sendOwnerCancellationNotification({
                customerEmail: subscription.user.email,
                customerName: subscription.user.name,
                appName: subscription.app.name,
                appSlug: subscription.app.slug,
                plan: subscription.plan,
                subscriptionId: subscription.id,
                paypalSubscriptionId: subscription.paypal_subscription_id,
                reason: "expired",
              });
              console.info("[PayPal webhook] Owner cancellation email sent", {
                subscriptionId: subscription.id,
                customerEmail: subscription.user.email,
                appSlug: subscription.app.slug,
                reason: "expired",
              });
            } catch (emailErr) {
              const message = emailErr instanceof Error ? emailErr.message : String(emailErr);
              console.error("[PayPal webhook] Failed to send owner cancellation email", {
                subscriptionId: subscription.id,
                customerEmail: subscription.user.email,
                appSlug: subscription.app.slug,
                reason: "expired",
                message,
              });
            }
          } else {
            await prisma.subscription.updateMany({
              where: { paypal_subscription_id: subscriptionId },
              data: { status: "expired" },
            });
          }
        }
        break;
      }

      case "PAYMENT.SALE.COMPLETED": {
        const billingAgreementId = event.resource?.billing_agreement_id;
        if (billingAgreementId) {
          const subscription = await prisma.subscription.findFirst({
            where: { paypal_subscription_id: billingAgreementId },
            select: { id: true },
          });
          if (subscription) {
            await prisma.paymentHistory.create({
              data: {
                subscription_id: subscription.id,
                amount: parseFloat(event.resource?.amount?.total ?? "0"),
                currency: event.resource?.amount?.currency ?? "USD",
                status: "completed",
                paypal_transaction_id: event.resource?.id,
                paid_at: new Date(),
              },
            });
          }
        }
        break;
      }

      default:
        // Unhandled event type — return 200 so PayPal stops retrying
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[POST /api/webhooks/paypal]", err);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
