# Despliegue en Vercel

Esta guía explica cómo desplegar **uniklabs.tech** en Vercel.

## ¿Qué se despliega?

| Componente        | ¿Dónde va? | Notas |
|-------------------|------------|--------|
| **Portal (Next.js)** | **Vercel** | Es la única aplicación que se despliega. Es la carpeta `portal-saas/`. Incluye **frontend** (páginas, componentes) y **API** (rutas en `app/api/`: webhooks Clerk/PayPal, suscripciones, etc.). No hay un backend separado. |
| **Base de datos**    | **Neon** (ya existente) | No se “despliega” en Vercel. Solo se configura la conexión con variables de entorno. |

La base de datos ya está en Neon. En Vercel solo hace falta indicar la **raíz del proyecto** (el portal) y las **variables de entorno**. Al desplegar `portal-saas` se publican a la vez la web y todas las rutas API (`/api/webhooks/clerk`, `/api/subscriptions/*`, etc.).

---

## Por qué Vercel “no reconoce nada”

El repositorio tiene esta estructura:

```
uniklabs.tech/
├── prisma/           ← schema y migraciones (no es una app)
├── generated/        ← cliente Prisma generado
├── package.json      ← scripts y deps de Prisma (raíz)
└── portal-saas/      ← aplicación Next.js que sí se despliega
    ├── app/
    ├── package.json
    └── next.config.ts
```

Si en Vercel dejas **Root Directory** en `./`, Vercel mira la raíz del repo, donde no hay una app Next.js típica, y por eso no reconoce el proyecto.

**Solución:** indicar que la aplicación está en la carpeta **`portal-saas`**.

---

## Pasos en Vercel

### 1. Importar el proyecto

- Conecta el repo de GitHub (por ejemplo `victorbetha2/uniklabs.tech`).
- Rama a desplegar: `main` (o la que uses).

### 2. Configurar el directorio raíz

En **Root Directory**:

- Pulsa **Edit** y escribe: **`portal-saas`**
- Así Vercel usará solo la carpeta del portal como proyecto y detectará Next.js.

### 3. Preset de aplicación

Tras poner Root Directory en `portal-saas`, Vercel suele detectar **Next.js** y elegir el preset correcto. Si no, selecciona **Next.js** manualmente (no “Other”).

### 4. Comando de build

El portal usa el cliente Prisma generado en la raíz del repo (`generated/prisma/`). Ese cliente debe generarse **antes** del build. En `portal-saas/package.json` ya existe un script **`prebuild`** que hace `cd ..`, instala dependencias de la raíz y ejecuta `npx prisma generate`.

**Recomendado:** en **Build and Output Settings** → **Build Command** deja el valor por defecto:

```bash
npm run build
```

Al ejecutar `npm run build`, npm ejecuta antes automáticamente `prebuild`, así que el cliente Prisma se generará en la raíz y el build de Next.js tendrá todo lo necesario. No hace falta configurar un comando más largo.

Si en algún momento no usaras el script `prebuild`, podrías usar este comando explícito (equivale a lo que hace `prebuild` + `build`):

```bash
(cd .. && npm install && npx prisma generate) && npm run build
```

- `cd ..` sale de `portal-saas` a la raíz del repo (donde están `prisma/` y `prisma.config.ts`).
- `npx prisma generate` crea el cliente en `generated/prisma/`, que el portal importa vía `@prisma/generated/client`.

### 5. Variables de entorno

En el proyecto de Vercel: **Settings → Environment Variables**. Añade estas variables (para Production, Preview y/o Development según necesites):

| Variable | Descripción | Dónde obtenerla |
|----------|-------------|------------------|
| `DATABASE_URL` | Cadena de conexión a PostgreSQL (Neon) | [Neon Dashboard](https://console.neon.tech) → tu proyecto → Connection string |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clave pública de Clerk | [Clerk Dashboard](https://dashboard.clerk.com) → API Keys |
| `CLERK_SECRET_KEY` | Clave secreta de Clerk | Mismo sitio |
| `CLERK_WEBHOOK_SECRET` | Secreto para firmar el webhook de Clerk | Clerk → Webhooks → tu endpoint → Signing Secret |
| `PAYPAL_CLIENT_ID` | Client ID de la app PayPal | [PayPal Developer](https://developer.paypal.com/dashboard/applications) → **Live** (producción) o Sandbox (pruebas) |
| `PAYPAL_SECRET` | Client Secret de la app PayPal | Mismo sitio que el Client ID |
| `PAYPAL_SANDBOX` | Si es `"false"` se usa la API **Live**; cualquier otro valor usa Sandbox | Opcional. En producción real pon `PAYPAL_SANDBOX=false` y usa credenciales **Live** |
| `PAYPAL_WEBHOOK_ID` | ID del webhook de PayPal | PayPal Developer → Webhooks → tu endpoint → Webhook ID |
| `PAYPAL_PLAN_ENT_*` | IDs de planes (Starter, Team, etc.) | PayPal → Productos/Planes de suscripción. Deben ser del mismo entorno (Live o Sandbox) que las credenciales |

**PayPal en producción:** En Vercel, para cobros reales debes usar la app en modo **Live**: en [developer.paypal.com](https://developer.paypal.com/dashboard/applications) cambia a **Live**, copia Client ID y Secret de esa app, y en Vercel define `PAYPAL_SANDBOX=false` y esas credenciales. Los IDs de planes (`PAYPAL_PLAN_ENT_STARTER`, etc.) deben ser los de los planes creados en **Live**, no los del Sandbox.

Sin `DATABASE_URL` el portal no puede conectar con Neon. Sin las variables de Clerk, la autenticación y el webhook no funcionarán. Sin las de PayPal, la suscripción y el flujo de pago fallarán (error "Client Authentication failed" si usas credenciales Sandbox contra la API Live).

### 6. Webhook de Clerk (sincronizar usuarios con Neon)

Para que los usuarios de Clerk se creen/actualicen en la base de datos:

1. En [Clerk Dashboard](https://dashboard.clerk.com) → **Webhooks** → **Add Endpoint**.
2. **Endpoint URL:**  
   `https://<tu-dominio-vercel>.vercel.app/api/webhooks/clerk`  
   (o tu dominio custom si ya lo tienes configurado).
3. Eventos: marca **`user.created`** y **`user.updated`**.
4. Copia el **Signing Secret** y añádelo en Vercel como variable **`CLERK_WEBHOOK_SECRET`**.

Tras el primer despliegue, sustituye `<tu-dominio-vercel>` por la URL real que te asigne Vercel.

### 7. Webhook de PayPal (activar suscripciones y cobros)

Para que las suscripciones pasen de **pending** a **active** cuando el usuario aprueba el pago en PayPal, y para registrar cancelaciones y el historial de cobros:

1. Ve al [PayPal Developer Portal](https://developer.paypal.com/dashboard/applications).
2. Selecciona tu app y cambia a **Live** (producción) o **Sandbox** (pruebas). Debe coincidir con las credenciales que usas en Vercel (`PAYPAL_SANDBOX`).
3. Entra en **Webhooks** (en el menú de la app) y pulsa **Add Webhook**.
4. **Webhook URL:**  
   `https://<tu-dominio-vercel>.vercel.app/api/webhooks/paypal`  
   (o tu dominio custom, por ejemplo `https://uniklabs.tech/api/webhooks/paypal`).
5. **Eventos a suscribir:** marca al menos:
   - **`BILLING.SUBSCRIPTION.ACTIVATED`** — cuando el usuario aprueba en PayPal; la app actualiza la suscripción a `active`.
   - **`BILLING.SUBSCRIPTION.CANCELLED`** — cancelación.
   - **`BILLING.SUBSCRIPTION.EXPIRED`** — fin del plan.
   - **`PAYMENT.SALE.COMPLETED`** — cada cobro recurrente; se guarda en el historial de pagos.
6. Guarda el webhook y copia el **Webhook ID**. Añádelo en Vercel como variable **`PAYPAL_WEBHOOK_ID`**.

Si el webhook no está configurado o la URL es incorrecta, las suscripciones se quedarán en **pending** aunque el pago se haya procesado en PayPal.

---

## Resumen de configuración en Vercel

| Campo | Valor |
|-------|--------|
| **Root Directory** | `portal-saas` |
| **Framework Preset** | Next.js |
| **Build Command** | `npm run build` (el `prebuild` genera Prisma antes) |
| **Environment Variables** | `DATABASE_URL`, Clerk (`NEXT_PUBLIC_CLERK_*`, `CLERK_*`), PayPal (`PAYPAL_CLIENT_ID`, `PAYPAL_SECRET`, `PAYPAL_SANDBOX`, `PAYPAL_WEBHOOK_ID`, `PAYPAL_PLAN_*`) |

---

## Opcional: script `prebuild` en el portal

El proyecto **ya incluye** este script en `portal-saas/package.json`:

```json
"prebuild": "cd .. && npm install && npx prisma generate"
```

Con eso, en Vercel basta usar **Build Command:** `npm run build`. No hace falta configurar el comando largo en la UI. Esta sección solo tiene sentido si en el futuro quieres cambiar o depurar qué hace el prebuild.

---

## ¿Es seguro tener el cliente Prisma generado (`generated/prisma/`)?

Sí. Ese directorio contiene solo **código generado** (tipos TypeScript y el cliente que habla con la base de datos). No incluye credenciales ni secretos; la conexión se configura con la variable de entorno `DATABASE_URL` en el servidor. Además, `generated/prisma` está en `.gitignore`, así que no se sube al repositorio: se genera en cada máquina de desarrollo y en cada deploy (por ejemplo con el script `prebuild`). Es la práctica recomendada para Prisma.

---

## Base de datos (Neon)

- La base de datos **no se despliega en Vercel**. Ya está en Neon.
- Migraciones y seeds se ejecutan **en tu máquina** (o en CI) desde la **raíz del repo**:
  - `npx prisma migrate dev` / `npx prisma migrate deploy`
  - `npx prisma db seed`
- En Vercel solo necesitas que `DATABASE_URL` apunte a esa base de datos Neon.

---

## Referencia rápida

- **Desplegar en Vercel:** solo el **portal** (`portal-saas`); con él se despliegan también la **API** (rutas en `app/api/`) y la web. No hay backend separado.
- **Root Directory en Vercel:** `portal-saas`.
- **Base de datos:** Neon; configurar `DATABASE_URL` en Vercel.
- **Clerk:** configurar las 3 variables y el webhook con la URL de tu app en Vercel.
- **PayPal:** configurar `PAYPAL_CLIENT_ID`, `PAYPAL_SECRET`, `PAYPAL_SANDBOX`, `PAYPAL_WEBHOOK_ID` y los planes; y crear el webhook en PayPal con la URL `/api/webhooks/paypal` para que las suscripciones pasen a **active** y se registren los cobros.
