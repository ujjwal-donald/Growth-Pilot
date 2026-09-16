"use server";

import { prisma } from "@/lib/db";
import { requireWorkspace, ActionError } from "@/server/auth-context";
import { getAiProvider } from "@/lib/ai/provider";
import { brandSystemPrompt, promptTemplates, type BrandContext } from "@/lib/ai/prompts";
import { getPlan } from "@/lib/billing/plans";
import { rateLimit } from "@/lib/security/rate-limit";
import { PostStatus, SocialPlatform } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";

function profileContext(profile: BrandContext | null | undefined): BrandContext {
  return profile ?? {};
}

async function trackAndGenerate(input: {
  workspaceId: string;
  userId: string;
  feature: string;
  messages: { role: "system" | "user" | "assistant"; content: string }[];
  json?: boolean;
}) {
  const limited = rateLimit(`ai:${input.workspaceId}`, 30, 60_000);
  if (!limited.success) {
    throw new ActionError("Too many AI requests. Please wait a moment.");
  }

  const workspace = await prisma.workspace.findUnique({
    where: { id: input.workspaceId },
    include: { subscription: true },
  });
  const plan = getPlan(workspace?.subscription?.plan ?? "FREE");
  const used = workspace?.subscription?.aiGenerationsUsed ?? 0;
  if (used >= plan.aiGenerationsPerMonth) {
    throw new ActionError(
      `You have used all ${plan.aiGenerationsPerMonth} AI generations on the ${plan.name} plan this month.`,
    );
  }

  const provider = getAiProvider();
  const result = await provider.generateText({ messages: input.messages, json: input.json });

  await prisma.$transaction([
    prisma.aiGeneration.create({
      data: {
        userId: input.userId,
        workspaceId: input.workspaceId,
        feature: input.feature,
        model: result.model,
        promptTokens: result.promptTokens,
        completionTokens: result.completionTokens,
        estimatedCostUsd: result.estimatedCostUsd,
      },
    }),
    prisma.subscription.update({
      where: { workspaceId: input.workspaceId },
      data: { aiGenerationsUsed: { increment: 1 } },
    }),
  ]);

  return result;
}

function parseJson<T>(text: string): T {
  try {
    return JSON.parse(text) as T;
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new ActionError("The AI response could not be parsed. Try again.");
    return JSON.parse(match[0]) as T;
  }
}

export async function askAssistantAction(question: string) {
  const ctx = await requireWorkspace("EDITOR");
  if (!question.trim()) return { error: "Ask a marketing question first." };

  try {
    const result = await trackAndGenerate({
      workspaceId: ctx.workspace.id,
      userId: ctx.user.id,
      feature: "assistant",
      messages: [
        { role: "system", content: brandSystemPrompt(profileContext(ctx.profile)) },
        { role: "user", content: question },
      ],
    });
    return { text: result.text, model: result.model, provider: result.provider };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "AI request failed" };
  }
}

export async function generatePostAction(input: {
  platform: SocialPlatform;
  contentType: string;
  goal: string;
  topic: string;
  tone: string;
  language: string;
  audience: string;
}) {
  const ctx = await requireWorkspace("EDITOR");
  try {
    const result = await trackAndGenerate({
      workspaceId: ctx.workspace.id,
      userId: ctx.user.id,
      feature: "post_generator",
      json: true,
      messages: [
        { role: "system", content: brandSystemPrompt(profileContext(ctx.profile)) },
        { role: "user", content: promptTemplates.socialPost(input) },
      ],
    });
    const data = parseJson<{
      copy: string;
      cta: string;
      hashtags: string[];
      suggestedPublishingTime: string;
      imageSuggestion: string;
    }>(result.text);
    return { data, model: result.model, provider: result.provider };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Generation failed" };
  }
}

export async function transformCopyAction(copy: string, instruction: string) {
  const ctx = await requireWorkspace("EDITOR");
  try {
    const result = await trackAndGenerate({
      workspaceId: ctx.workspace.id,
      userId: ctx.user.id,
      feature: "copy_transform",
      messages: [
        { role: "system", content: brandSystemPrompt(profileContext(ctx.profile)) },
        {
          role: "user",
          content: `Rewrite the post. Instruction: ${instruction}\n\nPost:\n${copy}`,
        },
      ],
    });
    return { text: result.text };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Rewrite failed" };
  }
}

export async function saveDraftPostAction(input: {
  platform: SocialPlatform;
  copy: string;
  cta?: string;
  hashtags?: string[];
  imageSuggestion?: string;
  suggestedTime?: string;
  contentType?: string;
  goal?: string;
  topic?: string;
  tone?: string;
  language?: string;
  scheduledAt?: string | null;
  status?: PostStatus;
}) {
  const ctx = await requireWorkspace("EDITOR");
  const post = await prisma.socialPost.create({
    data: {
      workspaceId: ctx.workspace.id,
      createdById: ctx.user.id,
      platform: input.platform,
      copy: input.copy,
      cta: input.cta,
      hashtags: input.hashtags ?? [],
      imageSuggestion: input.imageSuggestion,
      suggestedTime: input.suggestedTime,
      contentType: input.contentType,
      goal: input.goal,
      topic: input.topic,
      tone: input.tone,
      language: input.language ?? "English",
      status: input.scheduledAt ? "SCHEDULED" : (input.status ?? "DRAFT"),
      scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
    },
  });
  revalidatePath("/app/content/calendar");
  return { id: post.id };
}

export async function generateCalendarAction(input: {
  goal: string;
  platforms: SocialPlatform[];
  frequency: string;
}) {
  const ctx = await requireWorkspace("EDITOR");
  try {
    const result = await trackAndGenerate({
      workspaceId: ctx.workspace.id,
      userId: ctx.user.id,
      feature: "content_calendar",
      json: true,
      messages: [
        { role: "system", content: brandSystemPrompt(profileContext(ctx.profile)) },
        { role: "user", content: promptTemplates.calendar(input) },
      ],
    });
    const data = parseJson<{ days: Array<Record<string, unknown>> }>(result.text);
    const now = new Date();
    const calendar = await prisma.contentCalendar.create({
      data: {
        workspaceId: ctx.workspace.id,
        name: `${now.toLocaleString("en-US", { month: "long" })} calendar`,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        goal: input.goal,
        platforms: input.platforms,
        postingFrequency: input.frequency,
        generatedPlan: JSON.parse(JSON.stringify(data)),
      },
    });
    revalidatePath("/app/content/calendar");
    return { calendarId: calendar.id, days: data.days };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Calendar generation failed" };
  }
}

export async function reschedulePostAction(postId: string, scheduledAt: string) {
  const ctx = await requireWorkspace("EDITOR");
  await prisma.socialPost.updateMany({
    where: { id: postId, workspaceId: ctx.workspace.id },
    data: { scheduledAt: new Date(scheduledAt), status: "SCHEDULED" },
  });
  revalidatePath("/app/content/calendar");
  return { ok: true };
}

export async function generateBlogAction(input: {
  topic: string;
  keyword: string;
  audience: string;
  tone: string;
  wordCount: number;
}) {
  const ctx = await requireWorkspace("EDITOR");
  try {
    const result = await trackAndGenerate({
      workspaceId: ctx.workspace.id,
      userId: ctx.user.id,
      feature: "blog_generator",
      json: true,
      messages: [
        { role: "system", content: brandSystemPrompt(profileContext(ctx.profile)) },
        { role: "user", content: promptTemplates.blog(input) },
      ],
    });
    return { data: parseJson(result.text) };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Blog generation failed" };
  }
}

export async function generateAdsAction(input: {
  network: string;
  product: string;
  offer: string;
  audience: string;
  objective: string;
  tone: string;
}) {
  const ctx = await requireWorkspace("EDITOR");
  try {
    const result = await trackAndGenerate({
      workspaceId: ctx.workspace.id,
      userId: ctx.user.id,
      feature: "ad_generator",
      json: true,
      messages: [
        { role: "system", content: brandSystemPrompt(profileContext(ctx.profile)) },
        { role: "user", content: promptTemplates.ads(input) },
      ],
    });
    return { data: parseJson(result.text) };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Ad generation failed" };
  }
}

export async function generateCaptionFormAction(formData: FormData) {
  const ctx = await requireWorkspace("EDITOR");
  const platform = (String(formData.get("platform") || "INSTAGRAM") as SocialPlatform) || "INSTAGRAM";
  const topic = String(formData.get("topic") || "weekly offer");
  const tone = String(formData.get("tone") || ctx.profile?.brandTone || "Professional");
  try {
    const result = await trackAndGenerate({
      workspaceId: ctx.workspace.id,
      userId: ctx.user.id,
      feature: "caption_generator",
      json: true,
      messages: [
        { role: "system", content: brandSystemPrompt(profileContext(ctx.profile)) },
        { role: "user", content: promptTemplates.caption({ platform, topic, tone }) },
      ],
    });
    const data = parseJson<{ captions?: Array<{ text?: string; cta?: string; hashtags?: string[] }> }>(result.text);
    const first = data.captions?.[0];
    if (first?.text) {
      await prisma.socialPost.create({
        data: {
          workspaceId: ctx.workspace.id,
          createdById: ctx.user.id,
          platform,
          copy: first.text,
          cta: first.cta,
          hashtags: first.hashtags ?? [],
          contentType: "caption",
          topic,
          tone,
          status: "DRAFT",
        },
      });
    }
  } catch (error) {
    if (error instanceof ActionError) throw error;
    throw new ActionError(error instanceof Error ? error.message : "Caption generation failed");
  }
  revalidatePath("/app/content/captions");
}

export async function generateHashtagsFormAction(formData: FormData) {
  const ctx = await requireWorkspace("EDITOR");
  const platform = (String(formData.get("platform") || "INSTAGRAM") as SocialPlatform) || "INSTAGRAM";
  const topic = String(formData.get("topic") || ctx.profile?.industry || "marketing");
  try {
    const result = await trackAndGenerate({
      workspaceId: ctx.workspace.id,
      userId: ctx.user.id,
      feature: "hashtag_generator",
      json: true,
      messages: [
        { role: "system", content: brandSystemPrompt(profileContext(ctx.profile)) },
        { role: "user", content: promptTemplates.hashtags({ platform, topic }) },
      ],
    });
    const data = parseJson<{ primary?: string[]; niche?: string[] }>(result.text);
    const tags = [...(data.primary ?? []), ...(data.niche ?? [])];
    await prisma.socialPost.create({
      data: {
        workspaceId: ctx.workspace.id,
        createdById: ctx.user.id,
        platform,
        copy: tags.join(" "),
        hashtags: tags,
        contentType: "hashtags",
        topic,
        status: "DRAFT",
      },
    });
  } catch (error) {
    if (error instanceof ActionError) throw error;
    throw new ActionError(error instanceof Error ? error.message : "Hashtag generation failed");
  }
  revalidatePath("/app/content/hashtags");
}

export async function generateContentSuggestionsAction() {
  const ctx = await requireWorkspace("EDITOR");
  const keywords = await prisma.keyword.findMany({
    where: { workspaceId: ctx.workspace.id },
    take: 8,
    orderBy: { createdAt: "desc" },
  });
  const issues = await prisma.seoIssue.findMany({
    where: { audit: { workspaceId: ctx.workspace.id } },
    take: 6,
    orderBy: { createdAt: "desc" },
  });
  const result = await trackAndGenerate({
    workspaceId: ctx.workspace.id,
    userId: ctx.user.id,
    feature: "seo_suggestions",
    json: true,
    messages: [
      { role: "system", content: brandSystemPrompt(profileContext(ctx.profile)) },
      {
        role: "user",
        content: promptTemplates.suggestions({
          business: ctx.profile?.businessName ?? ctx.workspace.name,
          keywords: keywords.map((row) => row.keyword),
          issues: issues.map((row) => row.title),
        }),
      },
    ],
  });
  const data = parseJson<{ ideas?: Array<Record<string, unknown>> }>(result.text);
  const calendar = await prisma.contentCalendar.create({
    data: {
      workspaceId: ctx.workspace.id,
      name: "SEO content suggestions",
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      goal: "Improve SEO",
      generatedPlan: JSON.parse(JSON.stringify(data)),
    },
  });
  revalidatePath("/app/seo/suggestions");
  return { calendarId: calendar.id };
}
