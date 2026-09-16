import { requireWorkspace } from "@/server/auth-context";
import { prisma } from "@/lib/db";
import { addCompetitorAction } from "@/server/actions/seo";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function CompetitorsPage() {
  const ctx = await requireWorkspace();
  const competitors = await prisma.competitor.findMany({
    where: { workspaceId: ctx.workspace.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader
        title="Competitor analysis"
        description="Public-page crawl of a competitor URL: score, topics, and gaps you can publish against."
      />
      <form action={addCompetitorAction} className="mb-6 flex max-w-xl gap-2">
        <Input name="website" type="url" placeholder="https://competitor.com" required />
        <Button type="submit">Analyze</Button>
      </form>
      <div className="grid gap-4 md:grid-cols-2">
        {competitors.map((row) => (
          <Card key={row.id}>
            <CardHeader>
              <CardTitle className="text-base">
                {row.name ?? row.website} · SEO {row.seoScore ?? "—"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>{row.website}</p>
              <p>{row.strategy}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
