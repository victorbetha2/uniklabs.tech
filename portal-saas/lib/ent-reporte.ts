/**
 * Integración con la API externa ENT Reporte para provisionar cuentas admin
 * cuando una suscripción a la app ENT queda activa (webhook PayPal BILLING.SUBSCRIPTION.ACTIVATED).
 * El token ENT_REPORTE_API_TOKEN nunca debe aparecer en logs ni respuestas.
 */

const ENT_REPORTE_TIMEOUT_MS = 18_000;

export type ProvisionAdminPayload = {
  email: string;
  nombre: string;
  apellido: string;
  membresiaId: string;
  empresa?: string | null;
  telefono?: string | null;
};

type EntReporteSuccessResponse = {
  success: true;
  data?: { uid?: string };
  meta?: { membresiaId?: string; passwordResetEmailSent?: boolean };
};

type EntReporteErrorBody = {
  success?: false;
  error?: string;
  message?: string;
  [key: string]: unknown;
};

function getConfig(): { url: string; token: string } | null {
  const url = process.env.ENT_REPORTE_API_URL?.trim();
  const token = process.env.ENT_REPORTE_API_TOKEN?.trim();
  if (!url || !token) return null;
  return { url: url.replace(/\/$/, ""), token };
}

/**
 * Provisiona un admin en ENT Reporte. No lanza si la URL o el token no están configurados
 * (solo loguea y retorna). 409 se trata como éxito idempotente (warning). 401 lanza error crítico.
 * Otros errores se registran y se lanza para trazabilidad.
 */
export async function provisionAdmin(payload: ProvisionAdminPayload): Promise<void> {
  const { email, nombre, apellido, membresiaId, empresa, telefono } = payload;

  const config = getConfig();
  if (!config) {
    console.warn(
      "[ENT Reporte] ENT_REPORTE_API_URL or ENT_REPORTE_API_TOKEN not set; skipping provision",
      { membresiaId, email }
    );
    return;
  }

  console.info("[ENT Reporte] Provision attempt", { membresiaId, email });

  const body: Record<string, string> = {
    email,
    nombre,
    apellido,
    membresiaId,
  };
  if (empresa != null && empresa !== "") body.empresa = String(empresa);
  if (telefono != null && telefono !== "") body.telefono = String(telefono);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ENT_REPORTE_TIMEOUT_MS);

  let res: Response;
  let responseText: string;

  try {
    res = await fetch(`${config.url}/api/v1/external/provision-admin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.token}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    responseText = await res.text();
  } catch (err) {
    clearTimeout(timeoutId);
    const message = err instanceof Error ? err.message : String(err);
    console.error("[ENT Reporte] Request failed", {
      membresiaId,
      email,
      message,
    });
    throw new Error(`ENT Reporte provision request failed: ${message}`);
  } finally {
    clearTimeout(timeoutId);
  }

  const statusCode = res.status;

  if (statusCode === 201) {
    let uid: string | undefined;
    try {
      const json = JSON.parse(responseText) as EntReporteSuccessResponse;
      uid = json.data?.uid;
    } catch {
      // ignore parse errors for success path
    }
    console.info("[ENT Reporte] Provision success", { membresiaId, email, uid });
    return;
  }

  if (statusCode === 409) {
    console.warn(
      "[ENT Reporte] Email already exists in ENT Reporte (idempotent ok)",
      { membresiaId, email }
    );
    return;
  }

  let responseBody: EntReporteErrorBody | string = responseText;
  try {
    responseBody = JSON.parse(responseText) as EntReporteErrorBody;
  } catch {
    // keep as string for logging
  }

  const errMessage =
    typeof responseBody === "object"
      ? responseBody.error ?? responseBody.message ?? JSON.stringify(responseBody)
      : responseBody;

  if (statusCode === 401) {
    console.error("[ENT Reporte] Unauthorized — invalid or missing token (check ENT_REPORTE_API_TOKEN)", {
      membresiaId,
      email,
      statusCode,
    });
    throw new Error("ENT Reporte: unauthorized (token invalid or missing)");
  }

  console.error("[ENT Reporte] Provision error", {
    membresiaId,
    email,
    statusCode,
    responseBody: typeof responseBody === "string" ? responseBody : JSON.stringify(responseBody),
  });
  throw new Error(`ENT Reporte provision failed: ${statusCode} — ${errMessage}`);
}
