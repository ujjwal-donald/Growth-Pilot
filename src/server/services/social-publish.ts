import { ConnectionStatus, PostStatus } from "@/generated/prisma/client";
import { getSocialAdapter } from "@/lib/social/adapters";
import { composePublishText } from "@/lib/social/post-text";
import { decryptSecret } from "@/lib/security/crypto";
import { prisma } from "@/lib/db";
import { notifyWorkspace } from "@/server/notifications";

export async function publishSocialPostById(postId: string) {
  const post = await prisma.socialPost.findUnique({
    where: { id: postId },
    include: { socialAccount: true },
  });
  if (!post) throw new Error("Post not found");
  if (!post.socialAccount) throw new Error("Connect a social account before publishing.");
  if (post.socialAccount.connectionStatus !== ConnectionStatus.CONNECTED) {
    throw new Error("The selected social account is not connected.");
  }

  await prisma.socialPost.update({
    where: { id: post.id },
    data: { status: PostStatus.PUBLISHING, lastError: null },
  });

  try {
    const live = Boolean(post.socialAccount.encryptedAccessToken);
    const token = live ? decryptSecret(post.socialAccount.encryptedAccessToken!) : "demo";
    const adapter = getSocialAdapter(post.socialAccount.platform, live);
    const result = await adapter.publish(token, {
      text: composePublishText(post),
      mediaUrl: post.mediaKey ? `/media/${post.mediaKey}` : undefined,
    });
    await prisma.socialPost.update({
      where: { id: post.id },
      data: {
        status: PostStatus.PUBLISHED,
        publishedAt: new Date(),
        lastError: null,
        externalPostId: result.externalPostId,
      },
    });
    await notifyWorkspace({
      workspaceId: post.workspaceId,
      type: "SOCIAL_PUBLISHED",
      title: "Post published",
      body: post.copy.slice(0, 80),
      href: "/app/social/published",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Publish failed";
    await prisma.socialPost.update({
      where: { id: post.id },
      data: { status: PostStatus.FAILED, lastError: message },
    });
    await notifyWorkspace({
      workspaceId: post.workspaceId,
      type: "SOCIAL_FAILED",
      title: "Publish failed",
      body: message,
      href: "/app/social/scheduler",
    });
    throw error;
  }
}
