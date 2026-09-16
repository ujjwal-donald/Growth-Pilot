import { requireWorkspace } from "@/server/auth-context";
import { prisma } from "@/lib/db";
import { createCampaignAction, planCampaignAction, setCampaignStatusAction } from "@/server/actions/campaigns";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdsCampaignsPage() {
  const ctx = await requireWorkspace();
  const campaigns = await prisma.campaign.findMany({
    where: { workspaceId: ctx.workspace.id, kind: "ADS" },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader
        title="Campaigns"
        description="Plan channel mix, budget, and AI recommendations. Network publish stays in the adapter until ad credentials exist."
      />
      <form action={createCampaignAction} className="mb-8 grid gap-2 md:grid-cols-3">
        <input type="hidden" name="kind" value="ADS" />
        <Input name="campaignName" placeholder="Campaign name" defaultValue="Untitled campaign" />
        <Input name="goal" placeholder="Goal" defaultValue={ctx.profile?.primaryGoal ?? "Generate Leads"} />
        <Input name="audience" placeholder="Audience" defaultValue={ctx.profile?.targetAudience ?? ""} />
        <Input name="channels" placeholder="Channels (comma)" defaultValue="LinkedIn, Google Search" />
        <Input name="budget" type="number" placeholder="Budget INR" />
        <Input name="network" placeholder="facebook or google" />
        <Button type="submit">Create campaign</Button>
      </form>
      <div className="space-y-4">
        {campaigns.map((campaign) => (
          <Card key={campaign.id}>
            <CardHeader>
              <CardTitle className="flex flex-wrap items-center justify-between gap-2 text-base">
                <span>
                  {campaign.name} · {campaign.status}
                </span>
                <span className="text-sm font-normal text-muted-foreground">
                  {campaign.network ?? "no network"} · {campaign.budget ? `₹${campaign.budget}` : "no budget"}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-muted-foreground">{campaign.goal}</p>
              <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs">
                {JSON.stringify(campaign.aiRecommendations ?? { note: "Generate an AI plan" }, null, 2)}
              </pre>
              <div className="flex flex-wrap gap-2">
                <form action={planCampaignAction}>
                  <input type="hidden" name="campaignId" value={campaign.id} />
                  <Button type="submit" size="sm">
                    AI plan
                  </Button>
                </form>
                <form action={setCampaignStatusAction}>
                  <input type="hidden" name="campaignId" value={campaign.id} />
                  <input type="hidden" name="status" value="ACTIVE" />
                  <Button type="submit" size="sm" variant="outline">
                    Mark active
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
