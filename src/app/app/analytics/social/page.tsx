import { requireWorkspace } from "@/server/auth-context";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SimpleLineChart } from "@/components/charts/simple-line-chart";
import Link from "next/link";

export default async function AnalyticsSocialPage() {
  const ctx = await requireWorkspace();
  const grouped = await prisma.socialPost.groupBy({
    by: ["platform"],
    where: { workspaceId: ctx.workspace.id, status: "PUBLISHED" },
    _count: { _all: true },
  });
  const chart = grouped.map((row) => ({
    label: row.platform.replaceAll("_", " "),
    value: row._count._all,
  }));

  return (
    <div>
      <PageHeader
        title="Social analytics"
        description="Workspace publish totals. Connect accounts and publish from Social Media to populate this view."
      />
      <Card>
        <CardHeader>
          <CardTitle>Published by platform</CardTitle>
        </CardHeader>
        <CardContent>
          {chart.length ? (
            <SimpleLineChart data={chart} dataKey="value" />
          ) : (
            <p className="text-sm text-muted-foreground">
              No published posts yet.{" "}
              <Link href="/app/social/channels" className="text-indigo-600">
                Connect an account
              </Link>
              .
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
