import "server-only";

import { Resend } from "resend";

const DEFAULT_OWNER_EMAIL = "victorbetha@gmail.com";
const DEFAULT_APP_NAME = "UnikLabs";

type AppAccessInfo = {
  appName: string;
  appSlug: string;
  adminUrl?: string | null;
  userUrl?: string | null;
  instructionsMd?: string | null;
};

type PurchaseNotificationParams = {
  customerEmail: string;
  customerName?: string | null;
  appName: string;
  appSlug: string;
  plan: string;
  subscriptionId: string;
  paypalSubscriptionId?: string | null;
};

type CancellationNotificationParams = {
  customerEmail: string;
  customerName?: string | null;
  appName: string;
  appSlug: string;
  plan: string;
  subscriptionId: string;
  paypalSubscriptionId?: string | null;
  reason: "cancelled" | "expired";
};

type WelcomeEmailParams = {
  customerEmail: string;
  customerName?: string | null;
  plan: string;
  subscriptionId: string;
  access: AppAccessInfo;
};

function escapeHtml(input: string): string {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function inlineMarkdownToHtml(input: string): string {
  const escaped = escapeHtml(input);
  return escaped.replace(
    /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,
    (_match, label: string, url: string) => {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color:#84cc16;text-decoration:none;">${label}</a>`;
    }
  );
}

function markdownToHtml(markdown?: string | null): string {
  if (!markdown?.trim()) return "";

  const lines = markdown.replaceAll("\r\n", "\n").split("\n");
  const htmlParts: string[] = [];
  let listBuffer: { type: "ul" | "ol"; items: string[] } | null = null;

  const flushList = () => {
    if (!listBuffer) return;
    const items = listBuffer.items.map((item) => `<li>${item}</li>`).join("");
    htmlParts.push(`<${listBuffer.type} style="margin:0 0 12px 20px;padding:0;color:#18181b;">${items}</${listBuffer.type}>`);
    listBuffer = null;
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushList();
      continue;
    }

    if (line.startsWith("### ")) {
      flushList();
      htmlParts.push(`<h3 style="margin:18px 0 8px;font-size:18px;color:#09090b;">${inlineMarkdownToHtml(line.slice(4))}</h3>`);
      continue;
    }
    if (line.startsWith("## ")) {
      flushList();
      htmlParts.push(`<h2 style="margin:20px 0 10px;font-size:20px;color:#09090b;">${inlineMarkdownToHtml(line.slice(3))}</h2>`);
      continue;
    }
    if (line.startsWith("# ")) {
      flushList();
      htmlParts.push(`<h1 style="margin:22px 0 12px;font-size:24px;color:#09090b;">${inlineMarkdownToHtml(line.slice(2))}</h1>`);
      continue;
    }

    if (line.startsWith("- ")) {
      const content = inlineMarkdownToHtml(line.slice(2));
      if (!listBuffer || listBuffer.type !== "ul") {
        flushList();
        listBuffer = { type: "ul", items: [] };
      }
      listBuffer.items.push(content);
      continue;
    }

    const orderedMatch = line.match(/^(\d+)\.\s+(.+)$/);
    if (orderedMatch) {
      const content = inlineMarkdownToHtml(orderedMatch[2]);
      if (!listBuffer || listBuffer.type !== "ol") {
        flushList();
        listBuffer = { type: "ol", items: [] };
      }
      listBuffer.items.push(content);
      continue;
    }

    flushList();
    htmlParts.push(`<p style="margin:0 0 12px;color:#18181b;line-height:1.65;">${inlineMarkdownToHtml(line)}</p>`);
  }

  flushList();
  return htmlParts.join("");
}

function markdownToPlainText(markdown?: string | null): string {
  if (!markdown?.trim()) return "";

  return markdown
    .replaceAll(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, "$1 ($2)")
    .replaceAll(/^#{1,3}\s*/gm, "")
    .trim();
}

function getConfig(): {
  resend: Resend;
  from: string;
  ownerEmail: string;
} | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.error("[Email] RESEND_API_KEY no está definida. No se enviarán correos. Añádela en .env o en Vercel.");
    return null;
  }

  const from = process.env.EMAIL_FROM?.trim() || "UnikLabs <no-reply@uniklabs.tech>";
  const ownerEmail = process.env.OWNER_NOTIFY_EMAIL?.trim() || DEFAULT_OWNER_EMAIL;

  return {
    resend: new Resend(apiKey),
    from,
    ownerEmail,
  };
}

/** Envía con Resend y lanza si la API devuelve error (Resend no lanza, devuelve { data, error }). */
async function sendEmail(
  config: { resend: Resend; from: string },
  params: { to: string; subject: string; html: string; text: string }
): Promise<void> {
  const { data, error } = await config.resend.emails.send({
    from: config.from,
    to: params.to,
    subject: params.subject,
    html: params.html,
    text: params.text,
  });
  if (error) {
    const msg =
      typeof error === "object" && error !== null && "message" in error
        ? (error as { message?: string }).message
        : String(error);
    console.error("[Email] Resend API error:", { message: msg, to: params.to, subject: params.subject });
    throw new Error(`Resend: ${msg}`);
  }
  console.info("[Email] Sent successfully", { id: data?.id, to: params.to, subject: params.subject });
}

function emailLayout(title: string, bodyHtml: string): string {
  return `
  <div style="font-family:Inter,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:#f4f4f5;padding:24px;">
    <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e4e4e7;">
      <div style="background:#09090b;padding:24px 28px;">
        <h1 style="margin:0;font-size:22px;color:#fafafa;">${escapeHtml(title)}</h1>
        <p style="margin:8px 0 0;color:#a1a1aa;font-size:13px;">${DEFAULT_APP_NAME}</p>
      </div>
      <div style="padding:28px;">
        ${bodyHtml}
      </div>
      <div style="padding:16px 28px;background:#fafafa;color:#71717a;font-size:12px;border-top:1px solid #f4f4f5;">
        Este correo fue enviado automáticamente por ${DEFAULT_APP_NAME}.
      </div>
    </div>
  </div>
  `;
}

function appAccessHtml(access: AppAccessInfo): string {
  const blocks: string[] = [];
  if (access.adminUrl) {
    blocks.push(
      `<p style="margin:0 0 8px;"><strong>Admin:</strong> <a href="${escapeHtml(
        access.adminUrl
      )}" target="_blank" rel="noopener noreferrer" style="color:#84cc16;text-decoration:none;">${escapeHtml(access.adminUrl)}</a></p>`
    );
  }
  if (access.userUrl) {
    blocks.push(
      `<p style="margin:0 0 8px;"><strong>App:</strong> <a href="${escapeHtml(
        access.userUrl
      )}" target="_blank" rel="noopener noreferrer" style="color:#84cc16;text-decoration:none;">${escapeHtml(access.userUrl)}</a></p>`
    );
  }

  const instructionsHtml = markdownToHtml(access.instructionsMd);

  return `
    <div style="margin:14px 0 0;padding:16px;border:1px solid #e4e4e7;border-radius:12px;background:#fafafa;">
      <h2 style="margin:0 0 10px;font-size:16px;color:#09090b;">Accesos e instrucciones de ${escapeHtml(access.appName)}</h2>
      ${blocks.length ? blocks.join("") : `<p style="margin:0 0 8px;color:#52525b;">No hay links configurados para esta app.</p>`}
      ${instructionsHtml ? `<div style="margin-top:12px;">${instructionsHtml}</div>` : ""}
    </div>
  `;
}

export async function sendOwnerPurchaseNotification(params: PurchaseNotificationParams): Promise<void> {
  const config = getConfig();
  if (!config) return;

  const subject = `[Compra] ${params.appName} - ${params.plan}`;
  const body = `
    <p style="margin:0 0 12px;color:#18181b;">Se registró una compra de suscripción en el portal.</p>
    <p style="margin:0 0 8px;"><strong>Cliente:</strong> ${escapeHtml(params.customerName?.trim() || "Sin nombre")} (${escapeHtml(params.customerEmail)})</p>
    <p style="margin:0 0 8px;"><strong>App:</strong> ${escapeHtml(params.appName)} (${escapeHtml(params.appSlug)})</p>
    <p style="margin:0 0 8px;"><strong>Plan:</strong> ${escapeHtml(params.plan)}</p>
    <p style="margin:0 0 8px;"><strong>Subscription ID:</strong> ${escapeHtml(params.subscriptionId)}</p>
    <p style="margin:0;"><strong>PayPal ID:</strong> ${escapeHtml(params.paypalSubscriptionId || "Pendiente")}</p>
  `;

  await sendEmail(config, {
    to: config.ownerEmail,
    subject,
    html: emailLayout("Nueva compra de suscripción", body),
    text: [
      "Se registró una compra de suscripción.",
      `Cliente: ${params.customerName?.trim() || "Sin nombre"} (${params.customerEmail})`,
      `App: ${params.appName} (${params.appSlug})`,
      `Plan: ${params.plan}`,
      `Subscription ID: ${params.subscriptionId}`,
      `PayPal ID: ${params.paypalSubscriptionId || "Pendiente"}`,
    ].join("\n"),
  });
}

export async function sendOwnerCancellationNotification(
  params: CancellationNotificationParams
): Promise<void> {
  const config = getConfig();
  if (!config) return;

  const actionLabel = params.reason === "expired" ? "expirada" : "cancelada";
  const subject = `[${params.reason === "expired" ? "Expirada" : "Cancelada"}] ${params.appName} - ${params.plan}`;
  const body = `
    <p style="margin:0 0 12px;color:#18181b;">La suscripción fue marcada como <strong>${actionLabel}</strong>.</p>
    <p style="margin:0 0 8px;"><strong>Cliente:</strong> ${escapeHtml(params.customerName?.trim() || "Sin nombre")} (${escapeHtml(params.customerEmail)})</p>
    <p style="margin:0 0 8px;"><strong>App:</strong> ${escapeHtml(params.appName)} (${escapeHtml(params.appSlug)})</p>
    <p style="margin:0 0 8px;"><strong>Plan:</strong> ${escapeHtml(params.plan)}</p>
    <p style="margin:0 0 8px;"><strong>Subscription ID:</strong> ${escapeHtml(params.subscriptionId)}</p>
    <p style="margin:0;"><strong>PayPal ID:</strong> ${escapeHtml(params.paypalSubscriptionId || "N/A")}</p>
  `;

  await sendEmail(config, {
    to: config.ownerEmail,
    subject,
    html: emailLayout("Actualización de suscripción", body),
    text: [
      `La suscripción fue ${actionLabel}.`,
      `Cliente: ${params.customerName?.trim() || "Sin nombre"} (${params.customerEmail})`,
      `App: ${params.appName} (${params.appSlug})`,
      `Plan: ${params.plan}`,
      `Subscription ID: ${params.subscriptionId}`,
      `PayPal ID: ${params.paypalSubscriptionId || "N/A"}`,
    ].join("\n"),
  });
}

export async function sendCustomerWelcomeEmail(params: WelcomeEmailParams): Promise<void> {
  const config = getConfig();
  if (!config) return;

  const customerName = params.customerName?.trim() || "Equipo";
  const subject = `Bienvenido a ${params.access.appName} - Accesos e instrucciones`;
  const body = `
    <p style="margin:0 0 12px;color:#18181b;">Hola ${escapeHtml(customerName)},</p>
    <p style="margin:0 0 12px;color:#18181b;">Tu suscripción del plan <strong>${escapeHtml(
      params.plan
    )}</strong> ya está activa. Aquí tienes tus accesos e instrucciones iniciales.</p>
    ${appAccessHtml(params.access)}
    <p style="margin:14px 0 0;color:#18181b;">Si necesitas apoyo adicional, responde a este correo.</p>
  `;

  await sendEmail(config, {
    to: params.customerEmail,
    subject,
    html: emailLayout(`Bienvenido a ${params.access.appName}`, body),
    text: [
      `Hola ${customerName},`,
      "",
      `Tu suscripción (${params.plan}) ya está activa.`,
      "",
      params.access.adminUrl ? `Admin: ${params.access.adminUrl}` : "",
      params.access.userUrl ? `App: ${params.access.userUrl}` : "",
      markdownToPlainText(params.access.instructionsMd),
      "",
      `Subscription ID: ${params.subscriptionId}`,
    ]
      .filter(Boolean)
      .join("\n"),
  });
}

