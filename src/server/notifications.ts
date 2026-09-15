import { prisma } from "@/lib/db";

export async function notifyWorkspace(input: {
  workspaceId: string;
  type: string;
  title: string;
  body: string;
  href?: string;
}) {
  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId: input.workspaceId },
    select: { userId: true },
  });
  if (members.length === 0) return;

  await prisma.notification.createMany({
    data: members.map((member) => ({
      userId: member.userId,
      workspaceId: input.workspaceId,
      type: input.type,
      title: input.title,
      body: input.body,
      href: input.href,
    })),
  });
}
