"use server";

import { prisma } from "@/lib/db";
import { requireWorkspace, ActionError } from "@/server/auth-context";
import { getAiProvider } from "@/lib/ai/provider";
import { brandSystemPrompt, promptTemplates, type BrandContext } from "@/lib/ai/prompts";
import { getAdNetwork, type AdNetworkId } from "@/lib/ads/networks";
import { CampaignKind, CampaignStatus } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getPlan } from "@/lib/billing/plans";
import { rateLimit } from "@/lib/security/rate-limit";

function profileContext(profile: BrandContext | null | undefined): BrandContext {
  return profile ?? {};
}

async function generateJson(ctx: { workspace: { id: string }; user: { id: string }; profile: BrandContext | null }, feature: string, userPrompt: string) {
  const limited = rateLimit(`ai:${ctx.workspace.id}`, 30, 60_000);
  if (!limited.success) throw new ActionError("Too many AI requests. Please wait a moment.");
  const workspace = await prisma.workspace.findUnique({
    where: { id: ctx.workspace.id },
    include: { subscription: true },
  });
  const plan = getPlan(workspace?.subscription?.plan ?? "FREE");
  const used = workspace?.subscription?.aiGenerationsUsed ?? 0;
  if (used >= plan.aiGenerationsPerMonth) {
    throw new ActionError(`You have used all ${plan.aiGenerationsPerMonth} AI generations on the ${plan.name} plan this month.`);
  }
  const result = await getAiProvider().generateText({
    json: true,
    messages: [
      { role: "system", content: brandSystemPrompt(profileContext(ctx.profile)) },
      { role: "user", content: userPrompt },
    ],
  });
  await prisma.$transaction([
    prisma.aiGeneration.create({
      data: {
        userId: ctx.user.id,
        workspaceId: ctx.workspace.id,
        feature,
        model: result.model,
        promptTokens: result.promptTokens,
        completionTokens: result.completionTokens,
        estimatedCostUsd: result.estimatedCostUsd,
      },
    }),
    prisma.subscription.update({
      where: { workspaceId: ctx.workspace.id },
      data: { aiGenerationsUsed: { increment: 1 } },
    }),
  ]);
  try {
    return JSON.parse(result.text) as Record<string, unknown>;
  } catch {
    const match = result.text.match(/\{[\s\S]*\}/);
    if (!match) throw new ActionError("The AI response could not be parsed. Try again.");
    return JSON.parse(match[0]) as Record<string, unknown>;
  }
}

export async function createCampaignAction(formData: FormData) {
  const ctx = await requireWorkspace("MARKETER");
  const kind = (String(formData.get("kind") || "ADS") as CampaignKind) || "ADS";
  const channels = String(formData.get("channels") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const budgetRaw = String(formData.get("budget") || "").trim();
  await prisma.campaign.create({
    data: {
      workspaceId: ctx.workspace.id,
      name: String(formData.get("name") || "Untitled campaign"),
      goal: String(formData.get("goal") || ctx.profile?.primaryGoal || "") || null,
      audience: String(formData.get("audience") || ctx.profile?.targetAudience || "") || null,
      channels,
      budget: budgetRaw ? Number(budgetRaw) : null,
      network: String(formData.get("network") || "") || null,
      kind,
      status: "DRAFT",
    },
  });
  revalidatePath("/app/ads/campaigns");
  revalidatePath("/app/leads/campaigns");
  redirect(kind === "LEAD" ? "/app/leads/campaigns" : "/app/ads/campaigns");
}

export async function planCampaignAction(formData: FormData) {
  const ctx = await requireWorkspace("MARKETER");
  const id = String(formData.get("campaignId") || "");
  const campaign = await prisma.campaign.findFirst({
    where: { id, workspaceId: ctx.workspace.id },
  });
  if (!campaign) throw new ActionError("Campaign not found.");
  const plan = await generateJson(
    ctx,
    "campaign_planner",
    promptTemplates.campaign({
      name: campaign.name,
      goal: campaign.goal ?? "Generate Leads",
      audience: campaign.audience ?? ctx.profile?.targetAudience ?? "buyers",
      channels: campaign.channels,
      budget: campaign.budget ? String(campaign.budget) : "undecided",
    }),
  );
  await prisma.campaign.update({
    where: { id: campaign.id },
    data: { aiRecommendations: plan as object },
  });
  revalidatePath("/app/ads/campaigns");
  redirect("/app/ads/campaigns");
}

export async function setCampaignStatusAction(formData: FormData) {
  const ctx = await requireWorkspace("MARKETER");
  const id = String(formData.get("campaignId") || "");
  const status = String(formData.get("status") || "DRAFT") as CampaignStatus;
  await prisma.campaign.updateMany({
    where: { id, workspaceId: ctx.workspace.id },
    data: { status },
  });
  revalidatePath("/app/ads/campaigns");
  revalidatePath("/app/leads/campaigns");
}

export async function publishCampaignToNetworkAction(formData: FormData) {
  const ctx = await requireWorkspace("ADMIN");
  const id = String(formData.get("campaignId") || "");
  const network = String(formData.get("network") || "facebook") as AdNetworkId;
  const campaign = await prisma.campaign.findFirst({
    where: { id, workspaceId: ctx.workspace.id },
  });
  if (!campaign) throw new ActionError("Campaign not found.");
  const result = await getAdNetwork(network).publish({
    name: campaign.name,
    budget: campaign.budget ? String(campaign.budget) : undefined,
  });
  await prisma.campaign.update({
    where: { id: campaign.id },
    data: {
      network,
      metrics: { lastPublish: result },
    },
  });
  revalidatePath("/app/ads/facebook");
  revalidatePath("/app/ads/google");
  revalidatePath("/app/ads/analytics");
  redirect(network === "google" ? "/app/ads/google" : "/app/ads/facebook");
}
