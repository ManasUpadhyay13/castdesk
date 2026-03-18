import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function getAuthUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

export async function getOrCreateUser() {
  const { userId } = await auth();
  if (!userId) return null;

  let user = await db.user.findUnique({ where: { clerkId: userId } });
  if (!user) {
    const clerkUser = await currentUser();
    user = await db.user.create({
      data: {
        clerkId: userId,
        email: clerkUser?.emailAddresses[0]?.emailAddress ?? "",
        name: clerkUser?.firstName
          ? `${clerkUser.firstName}${clerkUser.lastName ? " " + clerkUser.lastName : ""}`
          : "User",
        creditsBalance: 0,
        config: { isAdmin: false },
      },
    });
  }

  return user;
}

export async function requireAuth() {
  const user = await getOrCreateUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  const config = user.config as Record<string, unknown> | null;
  if (!config?.isAdmin) throw new Error("Forbidden");
  return user;
}
