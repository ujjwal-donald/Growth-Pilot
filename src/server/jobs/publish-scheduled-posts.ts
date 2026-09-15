import { PostStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { publishSocialPostById } from "@/server/services/social-publish";

const BATCH = 20;

export async function runPublishDuePosts() {
  const due = await prisma.socialPost.findMany({
    where: {
      status: PostStatus.SCHEDULED,
      scheduledAt: { lte: new Date() },
    },
    take: BATCH,
    orderBy: { scheduledAt: "asc" },
    select: { id: true },
  });

  let published = 0;
  let failed = 0;
  for (const post of due) {
    try {
      await publishSocialPostById(post.id);
      published += 1;
    } catch {
      failed += 1;
    }
  }

  return { processed: due.length, published, failed };
}
