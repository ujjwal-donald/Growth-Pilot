import { requireWorkspace } from "@/server/auth-context";
import { prisma } from "@/lib/db";
import { publishCampaignToNetworkAction } from "@/server/actions/campaigns";
import { getAdNetwork } from "@/lib/ads/networks";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function FacebookAdsPage() {
  const ctx = await requireWorkspace();
  const adapter = getAdNetwork("facebook");
  const campaigns = await prisma.campaign.findMany({
    where: { workspaceId: ctx.workspace.id, kind: "ADS" },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader
        title="Facebook Ads"
        description={
          adapter.isConfigured()
            ? "Meta adapter keys are present. Campaign create-on-network still requires spend approval."
            : "Meta adapter is wired. Set META_APP_ID and META_APP_SECRET to go live. Drafts stay in UPDON."
        }
      />
      <div className="grid gap-4">
        {campaigns.map((campaign) => (
          <Card key={campaign.id}>
            <CardHeader>
              <CardTitle className="text-base">{campaign.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={publishCampaignToNetworkAction}>
                <input type="hidden" name="campaignId" value={campaign.id} />
                <input type="hidden" name="network" value="facebook" />
                <Button type="submit" size="sm">
                  Queue to Meta
                </Button>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
