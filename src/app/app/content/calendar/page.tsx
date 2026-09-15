import { prisma } from "@/lib/db";
import { requireWorkspace } from "@/server/auth-context";
import { ContentCalendarBoard } from "@/components/content/content-calendar";

export default async function CalendarPage() {
  const ctx = await requireWorkspace();
  const posts = await prisma.socialPost.findMany({
    where: { workspaceId: ctx.workspace.id },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <ContentCalendarBoard
      posts={posts.map((post) => ({
        id: post.id,
        copy: post.copy,
        status: post.status,
        scheduledAt: post.scheduledAt?.toISOString() ?? null,
        platform: post.platform,
      }))}
    />
  );
}
