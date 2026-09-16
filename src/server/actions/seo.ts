"use server";

import { getKeywordProvider } from "@/lib/seo/keyword-provider";
import { auditPublicUrl } from "@/lib/seo/site-auditor";
import { analyzeCompetitor } from "@/lib/seo/competitor-intel";
import { requireWorkspace, ActionError } from "@/server/auth-context";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function researchKeywordsAction(keyword: string) {
  const ctx = await requireWorkspace("EDITOR");
  const rows = await getKeywordProvider().research(keyword);
  if (rows[0]) {
    await prisma.keyword.create({
      data: {
        workspaceId: ctx.workspace.id,
        keyword: rows[0].keyword,
        searchVolume: rows[0].searchVolume,
        difficulty: rows[0].difficulty,
        intent: rows[0].intent,
        trend: rows[0].trend,
        competition: rows[0].competition,
        provider: rows[0].provider,
      },
    });
  }
  revalidatePath("/app/seo/keywords");
  return rows;
}

export async function researchKeywordsFormAction(formData: FormData) {
  const keyword = String(formData.get("keyword") || "").trim();
  if (!keyword) return;
  await researchKeywordsAction(keyword);
  redirect("/app/seo/keywords");
}

export async function runWebsiteAuditAction(formData: FormData) {
  const ctx = await requireWorkspace("EDITOR");
  const url = String(formData.get("url") || ctx.profile?.website || "").trim();
  if (!url) throw new ActionError("Add a website URL first.");

  const page = await auditPublicUrl(url);
  await prisma.seoAudit.create({
    data: {
      workspaceId: ctx.workspace.id,
      url: page.url,
      score: page.score,
      summary: page.summary,
      raw: JSON.parse(JSON.stringify(page)),
      issues: {
        create: page.findings.map((finding) => ({
          title: finding.title,
          description: finding.description,
          priority: finding.priority,
          category: finding.category,
          pageUrl: page.url,
        })),
      },
      pages: {
        create: {
          workspaceId: ctx.workspace.id,
          url: page.url,
          title: page.title,
          metaDescription: page.metaDescription,
          h1: page.h1,
          wordCount: page.wordCount,
          score: page.score,
          findings: JSON.parse(JSON.stringify(page.findings)),
        },
      },
    },
  });
  revalidatePath("/app/seo");
  revalidatePath("/app/seo/audit");
  revalidatePath("/app/seo/pages");
  redirect("/app/seo/audit");
}

export async function addCompetitorAction(formData: FormData) {
  const ctx = await requireWorkspace("EDITOR");
  const website = String(formData.get("website") || "").trim();
  if (!website) throw new ActionError("Competitor URL is required.");
  const intel = await analyzeCompetitor(website);
  await prisma.competitor.create({
    data: {
      workspaceId: ctx.workspace.id,
      website: intel.website,
      name: intel.name,
      seoScore: intel.seoScore,
      estimatedKeywords: intel.estimatedKeywords,
      contentTopics: intel.contentTopics,
      socialPresence: intel.socialPresence,
      strengths: intel.strengths,
      weaknesses: intel.weaknesses,
      opportunities: intel.opportunities,
      strategy: intel.strategy,
    },
  });
  revalidatePath("/app/seo/competitors");
  redirect("/app/seo/competitors");
}
