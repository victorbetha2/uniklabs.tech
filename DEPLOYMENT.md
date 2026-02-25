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

El portal usa el cliente Prisma generado en la raíz del repo (`generated/prisma/`). Ese cliente debe generarse **antes** del build.

En **Build and Output Settings** → **Build Command** usa:

```bash
(cd .. && npm install && npx prisma generate) && npm run build
```

- `cd ..` sale de `portal-saas` a la raíz del repo.
- `npm install` instala dependencias de la raíz (Prisma, etc.).
- `npx prisma generate` crea el cliente en `generated/prisma/`.
- `npm run build` hace el build de Next.js dentro de `portal-saas`.

Si no quieres tocar el comando de build, puedes dejar el que venga por defecto y añadir un script `prebuild` en `portal-saas/package.json` que ejecute lo mismo (ver sección opcional más abajo).

### 5. Variables de entorno

En el proyecto de Vercel: **Settings → Environment Variables**. Añade estas variables (para Production, Preview y/o Development según necesites):

| Variable | Descripción | Dónde obtenerla |
|----------|-------------|------------------|
| `DATABASE_URL` | Cadena de conexión a PostgreSQL (Neon) | [Neon Dashboard](https://console.neon.tech) → tu proyecto → Connection string |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clave pública de Clerk | [Clerk Dashboard](https://dashboard.clerk.com) → API Keys |
| `CLERK_SECRET_KEY` | Clave secreta de Clerk | Mismo sitio |
| `CLERK_WEBHOOK_SECRET` | Secreto para firmar el webhook de Clerk | Clerk → Webhooks → tu endpoint → Signing Secret |

Sin `DATABASE_URL` el portal no puede conectar con Neon. Sin las variables de Clerk, la autenticación y el webhook no funcionarán.

### 6. Webhook de Clerk (sincronizar usuarios con Neon)

Para que los usuarios de Clerk se creen/actualicen en la base de datos:

1. En [Clerk Dashboard](https://dashboard.clerk.com) → **Webhooks** → **Add Endpoint**.
2. **Endpoint URL:**  
   `https://<tu-dominio-vercel>.vercel.app/api/webhooks/clerk`  
   (o tu dominio custom si ya lo tienes configurado).
3. Eventos: marca **`user.created`** y **`user.updated`**.
4. Copia el **Signing Secret** y añádelo en Vercel como variable **`CLERK_WEBHOOK_SECRET`**.

Tras el primer despliegue, sustituye `<tu-dominio-vercel>` por la URL real que te asigne Vercel.

---

## Resumen de configuración en Vercel

| Campo | Valor |
|-------|--------|
| **Root Directory** | `portal-saas` |
| **Framework Preset** | Next.js |
| **Build Command** | `(cd .. && npm install && npx prisma generate) && npm run build` |
| **Environment Variables** | `DATABASE_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET` |

---

## Opcional: script `prebuild` en el portal

Si prefieres no configurar el Build Command en la UI de Vercel, puedes generar Prisma desde un script en el portal.

En **`portal-saas/package.json`** añade:

```json
"scripts": {
  "prebuild": "cd .. && npm install && npx prisma generate",
  "build": "next build",
  ...
}
```

Y en Vercel deja el **Build Command** por defecto (`npm run build`). Al ejecutar `npm run build`, npm correrá antes `prebuild` y generará el cliente Prisma.

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
