import { getCurrentDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentDbUser();
    if (!user) {
      return Response.json({ error: "No autenticado" }, { status: 401 });
    }

    const subscriptions = await prisma.subscription.findMany({
      where: { user_id: user.id },
      include: {
        app: {
          select: {
            id: true,
            slug: true,
            name: true,
            tagline: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    return Response.json({ subscriptions });
  } catch (err) {
    console.error("[GET /api/subscriptions]", err);
    return Response.json(
      { error: "Error al listar suscripciones" },
      { status: 500 }
    );
  }
}
