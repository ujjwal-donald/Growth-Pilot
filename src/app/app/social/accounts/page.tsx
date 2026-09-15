import { requireWorkspace } from "@/server/auth-context";
import { prisma } from "@/lib/db";
import { SOCIAL_PLATFORMS } from "@/lib/constants";
import { socialAccountPublicSelect } from "@/lib/social/account-select";
import { isOAuthConfigured } from "@/lib/social/oauth-apps";
import { disconnectSocialAccountAction } from "@/server/actions/social";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const errors: Record<string, string> = {
  Unknown: "Could not connect that provider.",
};

export default async function SocialAccountsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const ctx = await requireWorkspace();
  const params = await searchParams;
  const accounts = await prisma.socialAccount.findMany({
    where: { workspaceId: ctx.workspace.id },
    select: socialAccountPublicSelect,
    orderBy: { platform: "asc" },
  });
  const byPlatform = new Map(accounts.map((account) => [account.platform, account]));
  const demoAllowed = process.env.NODE_ENV !== "production";

  return (
    <div>
      <PageHeader
        title="Social accounts"
        description="Connect Instagram, Facebook, LinkedIn, X, YouTube, and Google Business. Access tokens are encrypted at rest and never sent to the browser."
      />
      {params.error ? (
        <p className="mb-4 text-sm text-destructive">{errors[params.error] ?? decodeURIComponent(params.error)}</p>
      ) : null}
      {demoAllowed ? (
        <p className="mb-4 text-sm text-muted-foreground">
          OAuth app credentials are optional in development. Connect without keys to attach a demo account and publish locally.
        </p>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {SOCIAL_PLATFORMS.map((platform) => {
          const account = byPlatform.get(platform.id);
          const live = isOAuthConfigured(platform.id);
          return (
            <Card key={platform.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-2">
                  {platform.label}
                  <Badge variant={account?.connectionStatus === "CONNECTED" ? "default" : "secondary"}>
                    {account?.connectionStatus?.replaceAll("_", " ") ?? "NOT CONNECTED"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="text-muted-foreground">
                  {account?.accountName ?? "No account connected."}
                  {account?.lastError ? ` · ${account.lastError}` : ""}
                </p>
                <p className="text-xs text-muted-foreground">
                  {live ? "Live OAuth is configured." : demoAllowed ? "Demo connect (no live API)." : "OAuth is not configured."}
                </p>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={`/api/social/oauth/${platform.id.toLowerCase()}/start`}
                    className={cn(buttonVariants())}
                  >
                    {account?.connectionStatus === "CONNECTED" ? "Reconnect" : "Connect"}
                  </a>
                  {account ? (
                    <form action={disconnectSocialAccountAction}>
                      <input type="hidden" name="accountId" value={account.id} />
                      <button type="submit" className={cn(buttonVariants({ variant: "outline" }))}>
                        Disconnect
                      </button>
                    </form>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
