"use server";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/server/auth-context";
import { PlanTier, UserStatus } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";

export async function suspendUserAction(userId: string, suspend: boolean) {
  await requireAdmin();
  await prisma.user.update({
    where: { id: userId },
    data: { status: suspend ? UserStatus.SUSPENDED : UserStatus.ACTIVE },
  });
  revalidatePath("/admin/users");
}

export async function changeWorkspacePlanAction(workspaceId: string, plan: PlanTier) {
  await requireAdmin();
  await prisma.subscription.update({
    where: { workspaceId },
    data: { plan },
  });
  revalidatePath("/admin");
}
