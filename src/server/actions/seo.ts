"use server";

import { getKeywordProvider } from "@/lib/seo/keyword-provider";
import { requireWorkspace } from "@/server/auth-context";
import { prisma } from "@/lib/db";

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
  return rows;
}
