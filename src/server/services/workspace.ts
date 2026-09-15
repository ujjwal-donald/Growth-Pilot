import { MemberRole, PlanTier } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";

function slugify(value: string) {
  const base = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 40);
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${base || "workspace"}-${suffix}`;
}

export async function createWorkspaceForUser(input: {
  userId: string;
  name: string;
  role?: MemberRole;
}) {
  const periodEnd = new Date();
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  return prisma.$transaction(async (tx) => {
    const workspace = await tx.workspace.create({
      data: {
        name: input.name,
        slug: slugify(input.name),
        ownerId: input.userId,
        members: {
          create: {
            userId: input.userId,
            role: input.role ?? "OWNER",
            inviteStatus: "ACCEPTED",
          },
        },
        subscription: {
          create: {
            plan: PlanTier.FREE,
            status: "ACTIVE",
            currentPeriodEnd: periodEnd,
          },
        },
        integrations: {
          create: [
            "FACEBOOK",
            "INSTAGRAM",
            "LINKEDIN",
            "X",
            "YOUTUBE",
            "GOOGLE_BUSINESS",
            "GOOGLE_ANALYTICS",
            "GOOGLE_SEARCH_CONSOLE",
            "GOOGLE_ADS",
          ].map((provider) => ({
            provider: provider as never,
            status: "NOT_CONNECTED",
          })),
        },
      },
    });

    return workspace;
  });
}

export async function ensureWorkspaceForUser(userId: string, fallbackName: string) {
  const membership = await prisma.workspaceMember.findFirst({
    where: { userId, inviteStatus: "ACCEPTED" },
    include: { workspace: true },
    orderBy: { createdAt: "asc" },
  });
  if (membership) return membership.workspace;
  return createWorkspaceForUser({ userId, name: fallbackName });
}
