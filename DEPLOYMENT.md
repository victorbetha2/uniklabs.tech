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
| **Build Command** | `npm run build` (el `prebuild` genera Prisma antes) |
| **Environment Variables** | `DATABASE_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET` |

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
