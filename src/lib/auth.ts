import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { isPromoPeriod, PROMO_CREDITS } from "@/lib/constants/promo";

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
    const grantPromo = isPromoPeriod();
    user = await db.user.create({
      data: {
        clerkId: userId,
        email: clerkUser?.emailAddresses[0]?.emailAddress ?? "",
        name: clerkUser?.firstName
          ? `${clerkUser.firstName}${clerkUser.lastName ? " " + clerkUser.lastName : ""}`
          : "User",
        creditsBalance: grantPromo ? PROMO_CREDITS : 0,
        config: { isAdmin: false },
      },
    });

    if (grantPromo) {
      await db.creditTransaction.create({
        data: {
          userId: user.id,
          actionType: "PROMO_SIGNUP",
          creditsUsed: -PROMO_CREDITS,
        },
      });
    }
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

export function isUserAdmin(user: { config: unknown }): boolean {
  const config = user.config as Record<string, unknown> | null;
  return config?.isAdmin === true;
}
