"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ConnectionStatus, PlanTier, PostStatus, SocialPlatform } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { getPlan } from "@/lib/billing/plans";
import { getStorageDriver } from "@/lib/storage";
import { mediaObjectKey } from "@/lib/storage/safe-key";
import { ActionError, requireWorkspace } from "@/server/auth-context";
import { publishSocialPostById } from "@/server/services/social-publish";
import { resolveOAuthStart } from "@/server/services/oauth-connect";
import { originFromHeaders } from "@/lib/http/relative-redirect";
import { headers } from "next/headers";

function revalidateSocial() {
  revalidatePath("/app/social/channels");
  revalidatePath("/app/social/create");
  revalidatePath("/app/social/scheduler");
  revalidatePath("/app/social/published");
  revalidatePath("/app/social/analytics");
  revalidatePath("/app");
}

export async function connectSocialAccountAction(formData: FormData) {
  const ctx = await requireWorkspace("MARKETER");
  const platform = String(formData.get("platform") || "");
  const headerList = await headers();
  const { href } = await resolveOAuthStart({
    workspaceId: ctx.workspace.id,
    userId: ctx.user.id,
    platformParam: platform,
    origin: originFromHeaders(headerList),
  });
  revalidateSocial();
  redirect(href);
}

async function uploadMedia(workspaceId: string, file: File | null) {
  if (!file || file.size === 0) return null;
  const buffer = Buffer.from(await file.arrayBuffer());
  const stored = await getStorageDriver().put({
    key: mediaObjectKey(workspaceId, file.name || "upload"),
    body: buffer,
    contentType: file.type || "application/octet-stream",
  });
  return stored.key;
}

async function assertScheduleLimit(workspaceId: string, planId: PlanTier) {
  const plan = getPlan(planId);
  if (plan.scheduledPosts === "unlimited") return;
  const count = await prisma.socialPost.count({
    where: { workspaceId, status: PostStatus.SCHEDULED },
  });
  if (count >= plan.scheduledPosts) {
    throw new ActionError(
      `Your ${plan.name} plan allows ${plan.scheduledPosts} scheduled posts. Upgrade to schedule more.`,
    );
  }
}

export async function disconnectSocialAccountAction(formData: FormData) {
  const ctx = await requireWorkspace("MARKETER");
  const id = String(formData.get("accountId") || "");
  await prisma.socialAccount.updateMany({
    where: { id, workspaceId: ctx.workspace.id },
    data: {
      connectionStatus: ConnectionStatus.NOT_CONNECTED,
      encryptedAccessToken: null,
      encryptedRefreshToken: null,
      tokenExpiry: null,
      lastError: null,
    },
  });
  revalidateSocial();
  redirect("/app/social/channels");
}

export async function createSocialPostAction(formData: FormData) {
  const ctx = await requireWorkspace("EDITOR");
  const intent = String(formData.get("intent") || "draft");
  const accountId = String(formData.get("accountId") || "");
  const copy = String(formData.get("copy") || "").trim();
  const cta = String(formData.get("cta") || "").trim() || null;
  const hashtags = String(formData.get("hashtags") || "")
    .split(/[\s,]+/)
    .map((tag) => tag.trim())
    .filter(Boolean);
  const scheduledRaw = String(formData.get("scheduledAt") || "");

  if (!copy) redirect("/app/social/create?error=copy");

  const account = await prisma.socialAccount.findFirst({
    where: { id: accountId, workspaceId: ctx.workspace.id },
    select: { id: true, platform: true, connectionStatus: true },
  });
  if (!account) redirect("/app/social/create?error=account");

  let mediaKey: string | null = null;
  try {
    const media = formData.get("media");
    mediaKey = await uploadMedia(ctx.workspace.id, media instanceof File ? media : null);
  } catch {
    redirect("/app/social/create?error=media");
  }

  let status: PostStatus = PostStatus.DRAFT;
  let scheduledAt: Date | null = null;
  if (intent === "schedule") {
    if (!scheduledRaw) redirect("/app/social/create?error=schedule");
    scheduledAt = new Date(scheduledRaw);
    if (Number.isNaN(scheduledAt.getTime())) redirect("/app/social/create?error=schedule");
    try {
      await assertScheduleLimit(ctx.workspace.id, ctx.subscription?.plan ?? "FREE");
    } catch (error) {
      redirect(`/app/social/create?error=${encodeURIComponent(error instanceof Error ? error.message : "limit")}`);
    }
    status = PostStatus.SCHEDULED;
  }

  const post = await prisma.socialPost.create({
    data: {
      workspaceId: ctx.workspace.id,
      socialAccountId: account.id,
      createdById: ctx.user.id,
      platform: account.platform as SocialPlatform,
      copy,
      cta,
      hashtags,
      mediaKey,
      status: intent === "publish" ? PostStatus.DRAFT : status,
      scheduledAt,
    },
  });

  if (intent === "publish") {
    try {
      await publishSocialPostById(post.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Publish failed";
      revalidateSocial();
      redirect(`/app/social/create?error=${encodeURIComponent(message)}`);
    }
    revalidateSocial();
    redirect("/app/social/published");
  }

  revalidateSocial();
  redirect(intent === "schedule" ? "/app/social/scheduler" : "/app/social/create?ok=1");
}

export async function publishNowAction(formData: FormData) {
  const ctx = await requireWorkspace("MARKETER");
  const id = String(formData.get("postId") || "");
  const post = await prisma.socialPost.findFirst({
    where: { id, workspaceId: ctx.workspace.id },
    select: { id: true },
  });
  if (!post) redirect("/app/social/scheduler?error=missing");
  try {
    await publishSocialPostById(post.id);
  } catch (error) {
    redirect(
      `/app/social/scheduler?error=${encodeURIComponent(error instanceof Error ? error.message : "failed")}`,
    );
  }
  revalidateSocial();
  redirect("/app/social/published");
}

export async function cancelScheduledPostAction(formData: FormData) {
  const ctx = await requireWorkspace("EDITOR");
  const id = String(formData.get("postId") || "");
  await prisma.socialPost.updateMany({
    where: { id, workspaceId: ctx.workspace.id, status: PostStatus.SCHEDULED },
    data: { status: PostStatus.DRAFT, scheduledAt: null },
  });
  revalidateSocial();
  redirect("/app/social/scheduler");
}

export async function retryFailedPostAction(formData: FormData) {
  const ctx = await requireWorkspace("MARKETER");
  const id = String(formData.get("postId") || "");
  const post = await prisma.socialPost.findFirst({
    where: { id, workspaceId: ctx.workspace.id, status: PostStatus.FAILED },
    select: { id: true },
  });
  if (!post) redirect("/app/social/scheduler?error=missing");
  try {
    await publishSocialPostById(post.id);
  } catch (error) {
    redirect(
      `/app/social/scheduler?error=${encodeURIComponent(error instanceof Error ? error.message : "failed")}`,
    );
  }
  revalidateSocial();
  redirect("/app/social/published");
}
