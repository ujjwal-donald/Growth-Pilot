import { requireWorkspace } from "@/server/auth-context";
import { prisma } from "@/lib/db";
import { createCampaignAction, setCampaignStatusAction } from "@/server/actions/campaigns";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function LeadCampaignsPage() {
  const ctx = await requireWorkspace();
  const campaigns = await prisma.campaign.findMany({
    where: { workspaceId: ctx.workspace.id, kind: "LEAD" },
    include: { _count: { select: { leads: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader
        title="Lead campaigns"
        description="Nurture tracks that attach to CRM leads. Email/WhatsApp providers plug into this adapter later."
      />
      <form action={createCampaignAction} className="mb-8 grid gap-2 md:grid-cols-3">
        <input type="hidden" name="kind" value="LEAD" />
        <Input name="name" placeholder="Campaign name" required />
        <Input name="goal" placeholder="Offer / CTA" />
        <Input name="channels" placeholder="Email, WhatsApp, Call" defaultValue="Email" />
        <Button type="submit">Create lead campaign</Button>
      </form>
      <div className="grid gap-4 md:grid-cols-2">
        {campaigns.map((campaign) => (
          <Card key={campaign.id}>
            <CardHeader>
              <CardTitle className="text-base">
                {campaign.name} · {campaign._count.leads} leads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form action={setCampaignStatusAction}>
                <input type="hidden" name="campaignId" value={campaign.id} />
                <input type="hidden" name="status" value={campaign.status === "ACTIVE" ? "PAUSED" : "ACTIVE"} />
                <Button type="submit" size="sm" variant="outline">
                  {campaign.status === "ACTIVE" ? "Pause" : "Activate"}
                </Button>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
