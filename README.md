# uniklabs.tech
Dashboard CMS

## Portal (Next.js + Clerk)

The `portal-saas` app uses Clerk for authentication.

1. Copy `portal-saas/.env.example` to `portal-saas/.env.local`.
2. In [Clerk Dashboard](https://dashboard.clerk.com), create an application and set in `.env.local`:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
3. Add `DATABASE_URL` (Neon connection string) so the webhook can sync users to the DB.

### Clerk Webhook (user sync to Neon DB)

To sync Clerk users to your database (Neon):

1. In Clerk Dashboard go to **Webhooks** and add an endpoint.
2. **Endpoint URL**: `https://<your-domain>/api/webhooks/clerk` (for local dev use a tunnel like [ngrok](https://ngrok.com)).
3. Subscribe to events: `user.created`, `user.updated`.
4. Copy the **Signing Secret** and set it as `CLERK_WEBHOOK_SECRET` in your environment (e.g. Vercel env vars or `portal-saas/.env.local`).

The route `POST /api/webhooks/clerk` verifies the request with Svix and creates/updates the `User` row in the database.

## Database (Prisma + Neon)

1. Copy `.env.example` to `.env` and set `DATABASE_URL` to your Neon PostgreSQL connection string.
2. From the repo root run:
   - `npx prisma migrate dev --name init` — create tables
   - `npx prisma db seed` — seed apps Finaly and ENT (optional)
   - `npx prisma studio` — open Prisma Studio

### Si el portal falla con "Can't resolve 'tailwindcss'"

Next.js usa como raíz del proyecto la carpeta donde encuentra un `package-lock.json`. En este repo el lockfile de la raíz está renombrado a `package-lock.json.root` para que Next use solo el de `portal-saas`. Si en la raíz vuelves a hacer `npm install` y se genera un nuevo `package-lock.json`, renómbralo a `package-lock.json.root` para que el portal arranque bien.
