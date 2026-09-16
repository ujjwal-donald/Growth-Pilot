import { requireWorkspace } from "@/server/auth-context";
import { updateBrandVoiceAction } from "@/server/actions/brand";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default async function BrandVoicePage() {
  const ctx = await requireWorkspace();
  return (
    <div>
      <PageHeader title="Brand voice" description="This tone is injected into every AI prompt for the workspace." />
      <form action={updateBrandVoiceAction} className="grid max-w-2xl gap-4">
        <div className="space-y-1">
          <Label>Brand tone</Label>
          <Input name="brandTone" defaultValue={ctx.profile?.brandTone ?? "Professional"} />
        </div>
        <div className="space-y-1">
          <Label>Custom instructions</Label>
          <Input name="customBrandTone" defaultValue={ctx.profile?.customBrandTone ?? ""} placeholder="Words to use / avoid" />
        </div>
        <div className="space-y-1">
          <Label>Voice examples</Label>
          <Textarea name="description" rows={5} defaultValue={ctx.profile?.description ?? ""} />
        </div>
        <Button type="submit">Save voice</Button>
      </form>
    </div>
  );
}
