import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { hasRole } from "@/lib/rbac";
import type { MemberRole } from "@/generated/prisma/client";
import { redirect } from "next/navigation";

export class ActionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ActionError";
  }
}

export async function redirectIfAuthenticated() {
  const session = await auth();
  if (session?.user?.id) redirect("/app");
}

import { cookies } from "next/headers";
import { unstable_noStore as noStore } from "next/cache";

export async function requireUser() {
  noStore();
  await cookies();
  const session = await auth();
  let user = session?.user;
  if (!user?.id && user?.email) {
    const row = await prisma.user.findUnique({ where: { email: user.email.toLowerCase() } });
    if (row) {
      user = {
        ...user,
        id: row.id,
        platformRole: row.platformRole,
        status: row.status,
        onboardingCompleted: row.onboardingCompleted,
      };
    }
  }
  if (!user?.id) redirect("/login");
  if (user.status === "SUSPENDED") redirect("/login?error=suspended");
  return user;
}

export async function requireWorkspace(minimumRole: MemberRole = "VIEWER") {
  const user = await requireUser();
  if (!user.workspaceId) redirect("/onboarding");

  const membership = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: { workspaceId: user.workspaceId, userId: user.id },
    },
    include: {
      workspace: {
        include: {
          businessProfile: true,
          subscription: true,
        },
      },
    },
  });

  if (!membership) redirect("/onboarding");
  if (!hasRole(membership.role, minimumRole)) {
    throw new ActionError("You do not have permission to perform this action.");
  }

  return {
    user,
    membership,
    workspace: membership.workspace,
    profile: membership.workspace.businessProfile,
    subscription: membership.workspace.subscription,
  };
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.platformRole !== "SUPER_ADMIN") redirect("/app");
  return user;
}
