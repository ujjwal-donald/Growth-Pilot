"use server";

import { prisma } from "@/lib/db";
import { requireWorkspace } from "@/server/auth-context";
import { buildReportMarkdown, getWorkspaceOverview } from "@/lib/analytics/overview";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function generateMarketingReportAction() {
  const ctx = await requireWorkspace("MARKETER");
  const periodEnd = new Date();
  const periodStart = new Date();
  periodStart.setDate(periodEnd.getDate() - 7);
  const overview = await getWorkspaceOverview(ctx.workspace.id);
  const body = buildReportMarkdown({
    workspaceName: ctx.workspace.name,
    periodStart,
    periodEnd,
    overview,
  });
  await prisma.marketingReport.create({
    data: {
      workspaceId: ctx.workspace.id,
      title: `Week of ${periodStart.toISOString().slice(0, 10)}`,
      periodStart,
      periodEnd,
      body,
      metrics: {
        marketingScore: overview.marketingScore,
        published: overview.published,
        pipeline: overview.pipeline,
        seoScore: overview.seoScore,
      },
    },
  });
  revalidatePath("/app/analytics/report");
  redirect("/app/analytics/report");
}
