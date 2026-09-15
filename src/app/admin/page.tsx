import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminHomePage() {
  const [users, workspaces, generations, failedPosts] = await Promise.all([
    prisma.user.count(),
    prisma.workspace.count(),
    prisma.aiGeneration.aggregate({ _sum: { estimatedCostUsd: true }, _count: true }),
    prisma.socialPost.count({ where: { status: "FAILED" } }),
  ]);

  const cards = [
    ["Users", users],
    ["Companies", workspaces],
    ["AI generations", generations._count],
    ["Est. AI cost (USD)", Number(generations._sum.estimatedCostUsd ?? 0).toFixed(4)],
    ["Failed social posts", failedPosts],
    ["Revenue", "₹0 (billing disconnected)"],
  ];

  return (
    <div>
      <PageHeader title="Platform admin" description="Usage, subscriptions, and support operations." />
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map(([label, value]) => (
          <Card key={String(label)}>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
            </CardHeader>
            <CardContent className="font-heading text-2xl">{value}</CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
