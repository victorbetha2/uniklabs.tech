import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

/**
 * Returns the internal User (from DB) for the currently authenticated Clerk user.
 * Proactively creates the user in the database if it doesn't exist.
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

  let user = await prisma.user.findUnique({
    where: { clerk_id: userId },
    select: { id: true, clerk_id: true, email: true, name: true },
  });

  // If user doesn't exist in DB, create it just-in-time
  if (!user) {
    const clerkUser = await currentUser();
    if (!clerkUser) return null;

    const email = clerkUser.emailAddresses[0]?.emailAddress;
    if (!email) return null;

    const firstName = clerkUser.firstName ?? "";
    const lastName = clerkUser.lastName ?? "";
    const name = [firstName, lastName].filter(Boolean).join(" ").trim() || null;

    user = await prisma.user.create({
      data: {
        clerk_id: userId,
        email,
        name,
      },
      select: { id: true, clerk_id: true, email: true, name: true },
    });
  }

  return user;
}
