import { requireWorkspace } from "@/server/auth-context";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function IntegrationsPage() {
  const ctx = await requireWorkspace();
  const integrations = await prisma.integration.findMany({
    where: { workspaceId: ctx.workspace.id },
    orderBy: { provider: "asc" },
  });

  return (
    <div>
      <PageHeader title="Integrations" description="OAuth connect flows will attach here. Tokens never reach the browser." />
      <div className="grid gap-4 md:grid-cols-3">
        {integrations.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {item.provider.replaceAll("_", " ")}
                <Badge variant={item.status === "CONNECTED" ? "default" : "secondary"}>{item.status.replaceAll("_", " ")}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {item.lastError ?? "Not connected. Phase 2 will add OAuth adapters."}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
