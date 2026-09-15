import { requireWorkspace } from "@/server/auth-context";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SimpleLineChart } from "@/components/charts/simple-line-chart";

export default async function SocialAnalyticsPage() {
  const ctx = await requireWorkspace();
  const [published, failed, scheduled, byPlatform] = await Promise.all([
    prisma.socialPost.count({ where: { workspaceId: ctx.workspace.id, status: "PUBLISHED" } }),
    prisma.socialPost.count({ where: { workspaceId: ctx.workspace.id, status: "FAILED" } }),
    prisma.socialPost.count({ where: { workspaceId: ctx.workspace.id, status: "SCHEDULED" } }),
    prisma.socialPost.groupBy({
      by: ["platform"],
      where: { workspaceId: ctx.workspace.id, status: "PUBLISHED" },
      _count: { _all: true },
    }),
  ]);

  const chart = byPlatform.map((row) => ({
    label: row.platform.replaceAll("_", " "),
    value: row._count._all,
  }));

  return (
    <div>
      <PageHeader
        title="Social analytics"
        description="Publish counts from this workspace. Live platform insights attach when each adapter returns metrics."
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-xs text-muted-foreground">Published</CardTitle>
          </CardHeader>
          <CardContent className="font-heading text-2xl font-semibold">{published}</CardContent>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-xs text-muted-foreground">Scheduled</CardTitle>
          </CardHeader>
          <CardContent className="font-heading text-2xl font-semibold">{scheduled}</CardContent>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-xs text-muted-foreground">Failed</CardTitle>
          </CardHeader>
          <CardContent className="font-heading text-2xl font-semibold">{failed}</CardContent>
        </Card>
      </div>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Published by platform</CardTitle>
        </CardHeader>
        <CardContent>
          {chart.length ? (
            <SimpleLineChart data={chart} dataKey="value" />
          ) : (
            <p className="text-sm text-muted-foreground">Publish posts to see platform totals.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
