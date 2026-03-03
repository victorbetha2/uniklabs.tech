# CLAUDE.md — uniklabs.tech

## Estructura del repositorio

```
uniklabs.tech/           ← raíz del repo (Prisma, migraciones, seed)
├── prisma/
│   ├── schema.prisma    ← modelos de base de datos
│   ├── seed.ts          ← seed de apps Finaly y ENT
│   └── migrations/      ← migraciones SQL generadas por Prisma
├── generated/
│   └── prisma/          ← cliente Prisma generado (no editar)
├── prisma.config.ts     ← configuración de Prisma 7 (url, seed)
├── package.json         ← dependencias de Prisma (raíz)
├── .env                 ← DATABASE_URL (gitignored)
├── .env.example         ← plantilla de variables de entorno
├── DEPLOYMENT.md        ← guía de despliegue en Vercel
└── portal-saas/         ← app Next.js 16 (front + API)
    ├── app/             ← App Router de Next.js
    │   ├── (marketing)/ ← rutas públicas de marketing
    │   ├── (auth)/      ← sign-in y sign-up (Clerk)
    │   └── api/
    │       └── webhooks/clerk/route.ts  ← sincroniza usuarios Clerk → Neon
    ├── components/
    │   ├── ui/          ← componentes shadcn/ui
    │   └── marketing/   ← secciones de la landing page
    ├── lib/
    │   ├── prisma.ts    ← singleton del cliente Prisma (portal-saas)
    │   └── utils.ts     ← cn() (tailwind-merge + clsx)
    ├── middleware.ts     ← Clerk auth middleware
    └── package.json     ← dependencias del portal
```

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 16 (App Router), React 19, TypeScript 5 |
| Estilos | Tailwind CSS 4, shadcn/ui (new-york), lucide-react |
| Auth | Clerk (`@clerk/nextjs`) |
| Base de datos | PostgreSQL en **Neon** |
| ORM | **Prisma 7** con `@prisma/adapter-pg` |
| Notificaciones | Sonner |
| Webhooks | Svix (verificación de webhooks de Clerk) |

## Variables de entorno

### Raíz (`/.env`)
```
DATABASE_URL="postgresql://USER:PASSWORD@HOST.neon.tech/DATABASE?sslmode=require"
```

### portal-saas (`/portal-saas/.env.local`)
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
CLERK_WEBHOOK_SECRET=whsec_...
DATABASE_URL="postgresql://..."
```

## Comandos clave

### Base de datos (desde la raíz del repo)
```bash
npx prisma migrate dev --name <nombre>   # crear y aplicar migración
npx prisma db seed                        # seed de apps (Finaly, ENT)
npx prisma generate                       # regenerar cliente tras cambiar schema
npx prisma studio                         # UI para explorar datos en Neon
```

### Portal (desde portal-saas/)
```bash
npm run dev      # servidor de desarrollo (puerto 3000)
npm run build    # build de producción
npm run lint     # ESLint
```

## Prisma 7 — particularidades importantes

Prisma 7 tiene cambios de API respecto a versiones anteriores. Seguir estas reglas:

1. **No poner `url` en `prisma/schema.prisma`**. La URL va en `prisma.config.ts`:
   ```ts
   datasource: { url: process.env["DATABASE_URL"] }
   ```

2. **El cliente requiere un adapter**. Nunca usar `new PrismaClient()` sin adapter:
   ```ts
   import { PrismaPg } from "@prisma/adapter-pg";
   const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
   const prisma = new PrismaClient({ adapter });
   ```

3. **El seed se configura en `prisma.config.ts`**, no en `package.json`:
   ```ts
   migrations: { seed: "tsx prisma/seed.ts" }
   ```

4. **El cliente generado está en `generated/prisma/`** (raíz del repo). No importar desde `@prisma/client` directamente en el seed. En el portal importar desde `@prisma/generated/client` (ver `tsconfig.json` del portal).

5. **Tras cada cambio en el schema** ejecutar `npx prisma generate` para actualizar los tipos del cliente.

## Modelos de base de datos

```
User              ← sincronizado desde Clerk vía webhook
App               ← apps del ecosistema (Finaly, ENT, …)
Subscription      ← suscripción de un usuario a una app (PayPal)
PaymentHistory    ← historial de cobros de una suscripción
```

### Campos relevantes

**App**
- `id` — slug manual (ej. `"finaly"`, `"report"`)
- `is_active` — app disponible para suscripción
- `status` — visibilidad de la página: `"draft"` | `"published"`

**Subscription.status** — `"active"` | `"cancelled"` | `"expired"` | `"pending"`

**Subscription.plan** — `"basic"` | `"premium"` | `"enterprise"`

## Singleton de Prisma en portal-saas

`portal-saas/lib/prisma.ts` exporta `prisma` con patrón singleton (evita conexiones múltiples en dev con HMR):

```ts
import { prisma } from "@/lib/prisma";
```

Usar esta importación en todos los Server Components, Route Handlers y Server Actions del portal.

## Clerk — autenticación y sincronización

- Las rutas protegidas se definen en `portal-saas/middleware.ts`.
- Rutas públicas: `/`, `/pricing`, `/products`, `/sign-in(.*)`, `/sign-up(.*)`, `/api/webhooks(.*)`.
- `POST /api/webhooks/clerk` escucha `user.created` y `user.updated` para crear/actualizar la fila `User` en Neon.
- Para desarrollo local, usar un túnel (ngrok) para exponer el webhook.

## Convenciones de código

- Nombres de columnas en **snake_case** (ej. `clerk_id`, `created_at`).
- Componentes React en **PascalCase**.
- Archivos de rutas Next.js: `page.tsx`, `layout.tsx`, `route.ts`.
- Clases de Tailwind con `cn()` de `@/lib/utils` cuando haya condicionales.
- No usar `toast` (deprecated en shadcn); usar `sonner` para notificaciones.
- Al filtrar apps visibles en la UI: `where: { status: "published" }`.

## Despliegue (Vercel)

- **En Vercel solo se despliega el portal:** `portal-saas/`. Con él se despliegan también la **API** (Route Handlers en `app/api/`: webhooks Clerk/PayPal, suscripciones, etc.); no hay un backend separado. La base de datos sigue en Neon.
- **Root Directory en Vercel:** debe ser **`portal-saas`**. Si se deja `./`, Vercel no detecta la app porque está dentro de esa carpeta.
- **Build:** el script `prebuild` en `portal-saas/package.json` ejecuta `npx prisma generate` desde la raíz del repo antes de `next build`; en Vercel se puede usar el comando de build por defecto.
- **Variables de entorno en Vercel:** `DATABASE_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET`. Ver [DEPLOYMENT.md](./DEPLOYMENT.md) para la guía completa (pasos, webhook de Clerk, etc.).
