import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

/**
 * Returns the internal User (from DB) for the currently authenticated Clerk user.
 * Use in API routes that need user_id for subscriptions, etc.
 */
export async function getCurrentDbUser(): Promise<{
  id: string;
  clerk_id: string;
  email: string;
  name: string | null;
} | null> {
  const { userId } = await auth();
  if (!userId) return null;
  const user = await prisma.user.findUnique({
    where: { clerk_id: userId },
    select: { id: true, clerk_id: true, email: true, name: true },
  });
  return user;
}
