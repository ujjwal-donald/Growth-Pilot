import { requireWorkspace } from "@/server/auth-context";
import { prisma } from "@/lib/db";
import { integrationPublicSelect } from "@/lib/social/account-select";
import { isOAuthConfigured, oauthApps } from "@/lib/social/oauth-apps";
import { disconnectIntegrationAction, connectIntegrationAction } from "@/server/actions/integrations";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { IntegrationProvider } from "@/generated/prisma/client";

const PROVIDERS: IntegrationProvider[] = [
  "FACEBOOK",
  "INSTAGRAM",
  "LINKEDIN",
  "X",
  "YOUTUBE",
  "GOOGLE_BUSINESS",
  "GOOGLE_ANALYTICS",
  "GOOGLE_SEARCH_CONSOLE",
  "GOOGLE_ADS",
];

export default async function IntegrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const ctx = await requireWorkspace();
  const params = await searchParams;
  const rows = await prisma.integration.findMany({
    where: { workspaceId: ctx.workspace.id },
    select: integrationPublicSelect,
  });
  const byProvider = new Map(rows.map((row) => [row.provider, row]));
  const demoAllowed = process.env.NODE_ENV !== "production";

  return (
    <div>
      <PageHeader
        title="Integrations"
        description="OAuth tokens are encrypted at rest and never sent to the browser. Social networks can also be connected from Social accounts."
      />
      {params.error ? (
        <p className="mb-4 text-sm text-destructive">{decodeURIComponent(params.error)}</p>
      ) : null}
      <div className="grid gap-4 md:grid-cols-3">
        {PROVIDERS.map((provider) => {
          const item = byProvider.get(provider);
          const app = oauthApps[provider];
          const live = app ? isOAuthConfigured(provider) : false;
          return (
            <Card key={provider}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-2">
                  {provider.replaceAll("_", " ")}
                  <Badge variant={item?.status === "CONNECTED" ? "default" : "secondary"}>
                    {item?.status?.replaceAll("_", " ") ?? "NOT CONNECTED"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  {item?.lastError ??
                    (app
                      ? live
                        ? "Ready for live OAuth."
                        : demoAllowed
                          ? "Demo connect available in development."
                          : "Add OAuth credentials to connect."
                      : "Adapter placeholder. Credentials are not wired yet.")}
                </p>
                {app ? (
                  <div className="flex flex-wrap gap-2">
                    <form action={connectIntegrationAction}>
                      <input type="hidden" name="provider" value={provider} />
                      <button type="submit" className={cn(buttonVariants())}>
                        {item?.status === "CONNECTED" ? "Reconnect" : "Connect"}
                      </button>
                    </form>
                    {item?.status === "CONNECTED" ? (
                      <form action={disconnectIntegrationAction}>
                        <input type="hidden" name="provider" value={provider} />
                        <button type="submit" className={cn(buttonVariants({ variant: "outline" }))}>
                          Disconnect
                        </button>
                      </form>
                    ) : null}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
