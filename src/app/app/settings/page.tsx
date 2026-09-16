import { requireWorkspace } from "@/server/auth-context";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { getPlatformArchitecture } from "@/lib/platform/registry";
import { saveWhiteLabelAction } from "@/server/actions/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function SettingsPage() {
  const ctx = await requireWorkspace();
  const architecture = getPlatformArchitecture();

  return (
    <div>
      <PageHeader title="Settings" description="Account, agency white-label, AWS cloud adapters, and live provider status." />
      <Card className="mb-6">
        <CardContent className="space-y-2 pt-6 text-sm">
          <p>
            <strong>Name:</strong> {ctx.user.name}
          </p>
          <p>
            <strong>Email:</strong> {ctx.user.email}
          </p>
          <p>
            <strong>Workspace role:</strong> {ctx.membership.role}
          </p>
          <p className="text-muted-foreground">Password changes use the reset flow.</p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <h2 className="mb-4 font-heading text-lg">Agency white-label</h2>
          <form action={saveWhiteLabelAction} className="grid max-w-lg gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="whiteLabelEnabled" defaultChecked={ctx.workspace.whiteLabelEnabled} />
              Enable client-facing branding
            </label>
            <div className="space-y-1">
              <Label>Primary</Label>
              <Input name="whiteLabelPrimary" defaultValue={ctx.workspace.whiteLabelPrimary ?? "#4F46E5"} />
            </div>
            <div className="space-y-1">
              <Label>Accent</Label>
              <Input name="whiteLabelAccent" defaultValue={ctx.workspace.whiteLabelAccent ?? "#0D9488"} />
            </div>
            <Button type="submit">Save branding</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 pt-6 text-sm">
          <h2 className="font-heading text-lg">Architecture status ({architecture.appEnv})</h2>
          <p>
            AI: {architecture.adapters.ai.id} {architecture.adapters.ai.live ? "(live)" : "(demo)"}
          </p>
          <p>
            Storage: {architecture.adapters.storage.id}
            {architecture.adapters.storage.live ? "" : " (not connected)"}
          </p>
          <p>Email: {architecture.adapters.email.id}</p>
          <p>
            Ads: {architecture.adapters.ads.map((n) => `${n.label}${n.configured ? "*" : ""}`).join(", ")}
          </p>
          <p>
            Billing: {architecture.adapters.billing.map((n) => `${n.label}${n.configured ? "*" : ""}`).join(", ")}
          </p>
          <div className="pt-2">
            <p className="font-medium text-foreground">
              AWS ({architecture.adapters.aws.region}
              {architecture.adapters.aws.credentialsPresent ? ", credentials present" : ", credentials not set"})
            </p>
            <ul className="mt-2 list-disc pl-5 text-muted-foreground">
              {architecture.adapters.aws.services.map((service) => (
                <li key={service.id}>
                  {service.label}: {service.configured ? "configured" : "not connected"} — {service.role}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
