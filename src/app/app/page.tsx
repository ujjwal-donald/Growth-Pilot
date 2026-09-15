import { requireWorkspace } from "@/server/auth-context";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SimpleLineChart } from "@/components/charts/simple-line-chart";
import { getPlan } from "@/lib/billing/plans";

const recommendations = [
  "Your LinkedIn engagement dropped 12% this week.",
  "Publishing between 9 AM and 11 AM may improve engagement.",
  "Your website is missing meta descriptions on 8 pages.",
  "Keyword 'digital marketing automation' has high growth opportunity.",
];

export default async function DashboardHomePage() {
  const ctx = await requireWorkspace();
  const [published, scheduled, leads, generations] = await Promise.all([
    prisma.socialPost.count({ where: { workspaceId: ctx.workspace.id, status: "PUBLISHED" } }),
    prisma.socialPost.count({ where: { workspaceId: ctx.workspace.id, status: "SCHEDULED" } }),
    prisma.lead.count({ where: { workspaceId: ctx.workspace.id } }),
    prisma.aiGeneration.count({ where: { workspaceId: ctx.workspace.id } }),
  ]);

  const plan = getPlan(ctx.subscription?.plan ?? "FREE");
  const traffic = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((label, i) => ({
    label,
    value: 120 + i * 18 + published * 4,
  }));

  const kpis = [
    { label: "Marketing Score", value: "78" },
    { label: "SEO Score", value: "82" },
    { label: "Social Engagement", value: "3.4%" },
    { label: "Total Followers", value: "12.8k" },
    { label: "Website Traffic", value: "4,210" },
    { label: "Leads Generated", value: String(leads) },
    { label: "Posts Published", value: String(published) },
    { label: "Scheduled Posts", value: String(scheduled) },
    { label: "Campaign Spend", value: "₹0" },
    { label: "Conversions", value: "18" },
  ];

  return (
    <div>
      <PageHeader
        title={`Good ${new Date().getHours() < 12 ? "morning" : "afternoon"}, ${ctx.user.name?.split(" ")[0] ?? "there"}`}
        description={`${ctx.workspace.name} · ${plan.name} plan · ${ctx.subscription?.aiGenerationsUsed ?? 0}/${plan.aiGenerationsPerMonth} AI generations this period`}
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {kpis.map((kpi) => (
          <Card key={kpi.label} size="sm">
            <CardHeader>
              <CardTitle className="text-xs font-medium text-muted-foreground">{kpi.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-heading text-2xl font-semibold">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Traffic growth</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleLineChart data={traffic} dataKey="value" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Social engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleLineChart
              data={traffic.map((row) => ({ ...row, value: Number(row.value) * 0.08 }))}
              dataKey="value"
              color="#0D9488"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Lead growth</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleLineChart
              data={traffic.map((row, i) => ({ label: row.label, value: leads + i }))}
              dataKey="value"
              color="#EA580C"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Campaign performance</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleLineChart
              data={traffic.map((row, i) => ({ label: row.label, value: 20 + i * 6 + generations }))}
              dataKey="value"
              color="#7C3AED"
            />
          </CardContent>
        </Card>
      </div>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>AI recommendations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recommendations.map((item) => (
            <div key={item} className="rounded-lg border bg-muted/40 px-3 py-2 text-sm">
              {item}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
