import { requireWorkspace } from "@/server/auth-context";
import { prisma } from "@/lib/db";
import { getWorkspaceOverview } from "@/lib/analytics/overview";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default async function SeoDashboardPage() {
  const ctx = await requireWorkspace();
  const overview = await getWorkspaceOverview(ctx.workspace.id);
  const latest = await prisma.seoAudit.findFirst({
    where: { workspaceId: ctx.workspace.id },
    orderBy: { createdAt: "desc" },
    include: { issues: { take: 5, orderBy: { createdAt: "desc" } } },
  });

  return (
    <div>
      <PageHeader
        title="SEO dashboard"
        description="On-page crawler, keyword tracker, and competitor snapshots for this workspace."
      />
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-xs text-muted-foreground">SEO score</CardTitle>
          </CardHeader>
          <CardContent className="font-heading text-2xl">{overview.seoScore ?? "—"}</CardContent>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-xs text-muted-foreground">Open issues</CardTitle>
          </CardHeader>
          <CardContent className="font-heading text-2xl">{overview.seoIssues}</CardContent>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-xs text-muted-foreground">Tracked keywords</CardTitle>
          </CardHeader>
          <CardContent className="font-heading text-2xl">{overview.keywords}</CardContent>
        </Card>
      </div>
      <div className="mb-6 flex flex-wrap gap-2">
        <Link href="/app/seo/audit" className={cn(buttonVariants())}>
          Run website audit
        </Link>
        <Link href="/app/seo/keywords" className={cn(buttonVariants({ variant: "outline" }))}>
          Research keywords
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Latest audit</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          {latest ? (
            <>
              <p>
                {latest.url} · score {latest.score}
              </p>
              <p>{latest.summary}</p>
              <ul className="list-disc pl-5">
                {latest.issues.map((issue) => (
                  <li key={issue.id}>
                    {issue.priority}: {issue.title}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p>No audit yet. Start from Website Audit with your homepage URL.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
