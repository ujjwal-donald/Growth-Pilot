import { requireUser } from "@/server/auth-context";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";

export default async function SettingsPage() {
  const user = await requireUser();
  return (
    <div>
      <PageHeader title="Settings" description="Account, workspace, and security preferences." />
      <Card>
        <CardContent className="space-y-2 pt-6 text-sm">
          <p>
            <strong>Name:</strong> {user.name}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Role:</strong> {user.workspaceRole}
          </p>
          <p className="text-muted-foreground">
            Password changes use the reset flow. Two-factor and SSO can be added on the Auth.js adapter later.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
