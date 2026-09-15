"use server";

import { prisma } from "@/lib/db";
import { requireWorkspace } from "@/server/auth-context";
import { LeadStatus, MemberRole } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";

export async function createLeadAction(formData: FormData) {
  const ctx = await requireWorkspace("MARKETER");
  await prisma.lead.create({
    data: {
      workspaceId: ctx.workspace.id,
      createdById: ctx.user.id,
      name: String(formData.get("name") || "Untitled lead"),
      email: String(formData.get("email") || "") || null,
      phone: String(formData.get("phone") || "") || null,
      company: String(formData.get("company") || "") || null,
      source: String(formData.get("source") || "Manual"),
      status: (String(formData.get("status") || "NEW") as LeadStatus) || "NEW",
      notes: String(formData.get("notes") || "") || null,
    },
  });
  revalidatePath("/app/leads");
}

export async function updateLeadStatusAction(leadId: string, status: LeadStatus) {
  const ctx = await requireWorkspace("MARKETER");
  await prisma.lead.updateMany({
    where: { id: leadId, workspaceId: ctx.workspace.id },
    data: { status },
  });
  revalidatePath("/app/leads");
}

export async function inviteMemberAction(formData: FormData) {
  const ctx = await requireWorkspace("ADMIN");
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const role = (String(formData.get("role") || "VIEWER") as MemberRole) || "VIEWER";
  if (!email) return { error: "Email is required" };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return {
      error: "No account exists for that email yet. Ask them to sign up, then invite again.",
    };
  }

  await prisma.workspaceMember.upsert({
    where: { workspaceId_userId: { workspaceId: ctx.workspace.id, userId: user.id } },
    create: {
      workspaceId: ctx.workspace.id,
      userId: user.id,
      role,
      inviteStatus: "ACCEPTED",
      invitedEmail: email,
    },
    update: { role, inviteStatus: "ACCEPTED" },
  });
  revalidatePath("/app/team");
  return { ok: true };
}
