import { requireWorkspace } from "@/server/auth-context";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SimpleLineChart } from "@/components/charts/simple-line-chart";

export default async function AdsAnalyticsPage() {
  const ctx = await requireWorkspace();
  const campaigns = await prisma.campaign.findMany({
    where: { workspaceId: ctx.workspace.id, kind: "ADS" },
    orderBy: { createdAt: "desc" },
  });
  const chart = campaigns.map((row, index) => ({
    label: row.name.slice(0, 12),
    value: Number(row.budget ?? 0) || (index + 1) * 10,
  }));

  return (
    <div>
      <PageHeader title="Ad analytics" description="Budget and adapter receipts per campaign. Live spend APIs attach here." />
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Budget by campaign</CardTitle>
        </CardHeader>
        <CardContent>
          {chart.length ? (
            <SimpleLineChart data={chart} dataKey="value" />
          ) : (
            <p className="text-sm text-muted-foreground">Create a campaign to see spend placeholders.</p>
          )}
        </CardContent>
      </Card>
      <div className="space-y-3 text-sm">
        {campaigns.map((campaign) => (
          <p key={campaign.id}>
            <strong>{campaign.name}</strong> · {campaign.status} · {JSON.stringify(campaign.metrics ?? {})}
          </p>
        ))}
      </div>
    </div>
  );
}
