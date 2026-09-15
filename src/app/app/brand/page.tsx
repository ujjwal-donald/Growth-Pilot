import { requireWorkspace } from "@/server/auth-context";
import { updateBusinessProfileAction } from "@/server/actions/onboarding";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default async function BrandProfilePage() {
  const ctx = await requireWorkspace();
  const profile = ctx.profile;
  const colors = (profile?.brandColors as { primary?: string; accent?: string } | null) ?? {};

  return (
    <div>
      <PageHeader title="Brand profile" description="Every AI feature reads this automatically." />
        <form
          action={async (formData) => {
            "use server";
            await updateBusinessProfileAction(formData);
          }}
          className="grid max-w-3xl gap-4"
        >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <Label>Business name</Label>
            <Input name="businessName" defaultValue={profile?.businessName ?? ctx.workspace.name} />
          </div>
          <div className="space-y-1">
            <Label>Website</Label>
            <Input name="website" defaultValue={profile?.website ?? ""} />
          </div>
          <div className="space-y-1">
            <Label>Industry</Label>
            <Input name="industry" defaultValue={profile?.industry ?? ""} />
          </div>
          <div className="space-y-1">
            <Label>Country</Label>
            <Input name="country" defaultValue={profile?.country ?? ""} />
          </div>
        </div>
        <div className="space-y-1">
          <Label>Target audience</Label>
          <Input name="targetAudience" defaultValue={profile?.targetAudience ?? ""} />
        </div>
        <div className="space-y-1">
          <Label>Description</Label>
          <Textarea name="description" defaultValue={profile?.description ?? ""} rows={4} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <Label>Brand tone</Label>
            <Input name="brandTone" defaultValue={profile?.brandTone ?? ""} />
          </div>
          <div className="space-y-1">
            <Label>Custom tone</Label>
            <Input name="customBrandTone" defaultValue={profile?.customBrandTone ?? ""} />
          </div>
          <div className="space-y-1">
            <Label>Primary color</Label>
            <Input name="primaryColor" defaultValue={colors.primary ?? "#4F46E5"} />
          </div>
          <div className="space-y-1">
            <Label>Accent color</Label>
            <Input name="accentColor" defaultValue={colors.accent ?? "#0D9488"} />
          </div>
        </div>
        <div className="space-y-1">
          <Label>Products (comma separated)</Label>
          <Input name="products" defaultValue={profile?.products.join(", ") ?? ""} />
        </div>
        <div className="space-y-1">
          <Label>Services (comma separated)</Label>
          <Input name="services" defaultValue={profile?.services.join(", ") ?? ""} />
        </div>
        <div className="space-y-1">
          <Label>Competitors (comma separated)</Label>
          <Input name="competitors" defaultValue={profile?.competitors.join(", ") ?? ""} />
        </div>
        <Button type="submit">Save brand profile</Button>
      </form>
    </div>
  );
}
