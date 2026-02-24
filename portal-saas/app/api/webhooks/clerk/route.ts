import { Webhook } from "svix";
import { prisma } from "@/lib/prisma";

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
if (!webhookSecret) {
  console.warn("CLERK_WEBHOOK_SECRET is not set; webhook verification will fail.");
}

type ClerkWebhookPayload = {
  type: string;
  data: {
    id: string;
    email_addresses?: { email_address: string }[];
    first_name?: string | null;
    last_name?: string | null;
  };
};

function getEmail(payload: ClerkWebhookPayload): string {
  const emails = payload.data.email_addresses;
  if (!emails?.length) {
    throw new Error("No email in webhook payload");
  }
  return emails[0].email_address;
}

function getName(payload: ClerkWebhookPayload): string | null {
  const first = payload.data.first_name ?? "";
  const last = payload.data.last_name ?? "";
  const name = [first, last].filter(Boolean).join(" ").trim();
  return name || null;
}

export async function POST(req: Request) {
  if (!webhookSecret) {
    return Response.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const svixId = req.headers.get("svix-id") ?? "";
  const svixTimestamp = req.headers.get("svix-timestamp") ?? "";
  const svixSignature = req.headers.get("svix-signature") ?? "";

  if (!svixId || !svixTimestamp || !svixSignature) {
    return Response.json({ error: "Missing Svix headers" }, { status: 401 });
  }

  const body = await req.text();
  const wh = new Webhook(webhookSecret);

  let payload: ClerkWebhookPayload;
  try {
    payload = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkWebhookPayload;
  } catch (err) {
    console.error("Clerk webhook verification failed:", err);
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  try {
    if (payload.type === "user.created") {
      const email = getEmail(payload);
      const name = getName(payload);
      await prisma.user.create({
        data: {
          clerk_id: payload.data.id,
          email,
          name,
        },
      });
    } else if (payload.type === "user.updated") {
      const email = getEmail(payload);
      const name = getName(payload);
      await prisma.user.update({
        where: { clerk_id: payload.data.id },
        data: { email, name },
      });
    }
    return Response.json({ success: true });
  } catch (err) {
    console.error("Clerk webhook handler error:", err);
    return Response.json({ error: "Processing failed" }, { status: 500 });
  }
}
