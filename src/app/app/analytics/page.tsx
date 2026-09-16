import { requireWorkspace } from "@/server/auth-context";
import { getWorkspaceOverview } from "@/lib/analytics/overview";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SimpleLineChart } from "@/components/charts/simple-line-chart";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function AnalyticsOverviewPage() {
  const ctx = await requireWorkspace();
  const overview = await getWorkspaceOverview(ctx.workspace.id);
  const chart = [
    { label: "Published", value: overview.published },
    { label: "Scheduled", value: overview.scheduled },
    { label: "Leads", value: overview.pipeline },
    { label: "Won", value: overview.won },
    { label: "Campaigns", value: overview.campaigns },
  ];

  return (
    <div>
      <PageHeader title="Analytics overview" description="Workspace scorecard from posts, leads, SEO, and campaigns." />
      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Marketing score", overview.marketingScore],
          ["SEO score", overview.seoScore ?? "—"],
          ["Leads", overview.pipeline],
          ["Published", overview.published],
        ].map(([label, value]) => (
          <Card key={String(label)} size="sm">
            <CardHeader>
              <CardTitle className="text-xs text-muted-foreground">{label}</CardTitle>
            </CardHeader>
            <CardContent className="font-heading text-2xl">{value}</CardContent>
          </Card>
        ))}
      </div>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Activity mix</CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleLineChart data={chart} dataKey="value" />
        </CardContent>
      </Card>
      <Link href="/app/analytics/report" className={cn(buttonVariants())}>
        Generate weekly report
      </Link>
    </div>
  );
}
