import { requireWorkspace } from "@/server/auth-context";
import { prisma } from "@/lib/db";
import { publishCampaignToNetworkAction } from "@/server/actions/campaigns";
import { getAdNetwork } from "@/lib/ads/networks";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function GoogleAdsPage() {
  const ctx = await requireWorkspace();
  const adapter = getAdNetwork("google");
  const campaigns = await prisma.campaign.findMany({
    where: { workspaceId: ctx.workspace.id, kind: "ADS" },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader
        title="Google Ads"
        description={
          adapter.isConfigured()
            ? "Google Ads developer token is present. Live campaign create stays gated."
            : "Google Ads adapter is wired. Set GOOGLE_ADS_DEVELOPER_TOKEN to go live."
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
                <input type="hidden" name="network" value="google" />
                <Button type="submit" size="sm">
                  Queue to Google Ads
                </Button>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
