import { requireWorkspace } from "@/server/auth-context";
import { prisma } from "@/lib/db";
import { generateMarketingReportAction } from "@/server/actions/reports";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ReportsPage() {
  const ctx = await requireWorkspace();
  const reports = await prisma.marketingReport.findMany({
    where: { workspaceId: ctx.workspace.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Markdown scorecards for the last 7 days. PDF export can wrap this body when a renderer is connected."
      />
      <form action={generateMarketingReportAction} className="mb-6">
        <Button type="submit">Generate this weeks report</Button>
      </form>
      <div className="space-y-4">
        {reports.map((report) => (
          <Card key={report.id}>
            <CardHeader>
              <CardTitle>{report.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-sm">{report.body}</pre>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
