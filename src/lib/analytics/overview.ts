import { prisma } from "@/lib/db";

export async function getWorkspaceOverview(workspaceId: string) {
  const [published, scheduled, failed, leads, campaigns, latestAudit, keywords, generations, snapshots] =
    await Promise.all([
      prisma.socialPost.count({ where: { workspaceId, status: "PUBLISHED" } }),
      prisma.socialPost.count({ where: { workspaceId, status: "SCHEDULED" } }),
      prisma.socialPost.count({ where: { workspaceId, status: "FAILED" } }),
      prisma.lead.findMany({ where: { workspaceId }, select: { status: true, value: true } }),
      prisma.campaign.findMany({
        where: { workspaceId },
        select: { id: true, name: true, status: true, kind: true, budget: true, network: true, metrics: true },
      }),
      prisma.seoAudit.findFirst({
        where: { workspaceId },
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { issues: true } } },
      }),
      prisma.keyword.count({ where: { workspaceId } }),
      prisma.aiGeneration.count({ where: { workspaceId } }),
      prisma.analyticsSnapshot.findMany({
        where: { workspaceId },
        orderBy: { date: "desc" },
        take: 14,
      }),
    ]);

  const won = leads.filter((row) => row.status === "WON").length;
  const pipeline = leads.length;
  const seoScore = latestAudit?.score ?? null;

  return {
    published,
    scheduled,
    failed,
    pipeline,
    won,
    campaigns: campaigns.length,
    activeCampaigns: campaigns.filter((row) => row.status === "ACTIVE").length,
    keywords,
    generations,
    seoScore,
    seoIssues: latestAudit?._count.issues ?? 0,
    campaignRows: campaigns,
    snapshots,
    marketingScore: Math.min(
      99,
      40 + published * 3 + won * 4 + (seoScore ? Math.round(seoScore / 5) : 0) + Math.min(generations, 20),
    ),
  };
}

export function buildReportMarkdown(input: {
  workspaceName: string;
  periodStart: Date;
  periodEnd: Date;
  overview: Awaited<ReturnType<typeof getWorkspaceOverview>>;
}) {
  const { overview } = input;
  return [
    `# ${input.workspaceName} marketing report`,
    `${input.periodStart.toDateString()} – ${input.periodEnd.toDateString()}`,
    "",
    "## Scorecard",
    `- Marketing score: ${overview.marketingScore}`,
    `- SEO score: ${overview.seoScore ?? "n/a"} (${overview.seoIssues} open issues)`,
    `- Published posts: ${overview.published}`,
    `- Scheduled posts: ${overview.scheduled}`,
    `- Leads in pipeline: ${overview.pipeline} (won ${overview.won})`,
    `- Campaigns: ${overview.campaigns} (${overview.activeCampaigns} active)`,
    `- AI generations: ${overview.generations}`,
    `- Tracked keywords: ${overview.keywords}`,
    "",
    "## Next actions",
    "- Publish or reschedule failed posts.",
    "- Close high-priority SEO issues on the homepage.",
    "- Move qualified leads into an active lead campaign.",
    "- Keep one paid campaign in draft until network credentials exist.",
  ].join("\n");
}
