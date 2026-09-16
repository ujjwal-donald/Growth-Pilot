import { requireWorkspace } from "@/server/auth-context";
import { prisma } from "@/lib/db";
import { integrationPublicSelect } from "@/lib/social/account-select";
import { demoWebsiteMetrics } from "@/lib/analytics/website-metrics";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SimpleLineChart } from "@/components/charts/simple-line-chart";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { connectIntegrationAction } from "@/server/actions/integrations";

export default async function WebsiteAnalyticsPage() {
  const ctx = await requireWorkspace();
  const integrations = await prisma.integration.findMany({
    where: {
      workspaceId: ctx.workspace.id,
      provider: { in: ["GOOGLE_ANALYTICS", "GOOGLE_SEARCH_CONSOLE"] },
    },
    select: integrationPublicSelect,
  });
  const ga = integrations.find((row) => row.provider === "GOOGLE_ANALYTICS");
  const gsc = integrations.find((row) => row.provider === "GOOGLE_SEARCH_CONSOLE");
  const connected = ga?.status === "CONNECTED" || gsc?.status === "CONNECTED";
  const metrics = demoWebsiteMetrics(connected);

  return (
    <div>
      <PageHeader
        title="Website analytics"
        description="Google Analytics and Search Console connections. Tokens never reach the browser."
      />
      <div className="mb-6 flex flex-wrap gap-3">
        <Card size="sm" className="min-w-[220px]">
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-2 text-sm">
              Google Analytics
              <Badge variant={ga?.status === "CONNECTED" ? "default" : "secondary"}>
                {ga?.status?.replaceAll("_", " ") ?? "NOT CONNECTED"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form action={connectIntegrationAction}>
              <input type="hidden" name="provider" value="GOOGLE_ANALYTICS" />
              <button type="submit" className={cn(buttonVariants({ size: "sm" }))}>
                Connect
              </button>
            </form>
          </CardContent>
        </Card>
        <Card size="sm" className="min-w-[220px]">
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-2 text-sm">
              Search Console
              <Badge variant={gsc?.status === "CONNECTED" ? "default" : "secondary"}>
                {gsc?.status?.replaceAll("_", " ") ?? "NOT CONNECTED"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form action={connectIntegrationAction}>
              <input type="hidden" name="provider" value="GOOGLE_SEARCH_CONSOLE" />
              <button type="submit" className={cn(buttonVariants({ size: "sm" }))}>
                Connect
              </button>
            </form>
          </CardContent>
        </Card>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">{metrics.note}</p>
      <Card>
        <CardHeader>
          <CardTitle>Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleLineChart data={metrics.sessions} dataKey="value" />
        </CardContent>
      </Card>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Search queries</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Query</TableHead>
                <TableHead>Clicks</TableHead>
                <TableHead>Impressions</TableHead>
                <TableHead>Position</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metrics.queries.map((row) => (
                <TableRow key={row.query}>
                  <TableCell>{row.query}</TableCell>
                  <TableCell>{row.clicks}</TableCell>
                  <TableCell>{row.impressions}</TableCell>
                  <TableCell>{row.position}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
