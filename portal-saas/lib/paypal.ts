export function getPayPalBaseUrl(): string {
  return process.env.NODE_ENV === "production"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

export async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("PAYPAL_CLIENT_ID or PAYPAL_SECRET is not configured");
  }

  const baseUrl = getPayPalBaseUrl();
  const res = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`PayPal token request failed: ${err}`);
  }

  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

export async function createPayPalSubscription(
  planId: string,
  returnUrl: string,
  cancelUrl: string
): Promise<{ id: string; approvalUrl: string }> {
  const baseUrl = getPayPalBaseUrl();
  const accessToken = await getPayPalAccessToken();

  const res = await fetch(`${baseUrl}/v1/billing/subscriptions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      plan_id: planId,
      application_context: {
        return_url: returnUrl,
        cancel_url: cancelUrl,
        user_action: "SUBSCRIBE_NOW",
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`PayPal subscription creation failed: ${err}`);
  }

  const data = (await res.json()) as {
    id: string;
    links: { rel: string; href: string }[];
  };

  const approvalUrl = data.links.find((l) => l.rel === "approve")?.href;
  if (!approvalUrl) {
    throw new Error("PayPal did not return an approval URL");
  }

  return { id: data.id, approvalUrl };
}
