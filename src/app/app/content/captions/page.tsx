import { requireWorkspace } from "@/server/auth-context";
import { prisma } from "@/lib/db";
import { generateCaptionFormAction } from "@/server/actions/ai";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SOCIAL_PLATFORMS } from "@/lib/constants";

export default async function CaptionsPage() {
  const ctx = await requireWorkspace();
  const drafts = await prisma.socialPost.findMany({
    where: { workspaceId: ctx.workspace.id, contentType: "caption" },
    orderBy: { createdAt: "desc" },
    take: 12,
  });

  return (
    <div>
      <PageHeader title="Caption generator" description="Short-form lines in your brand voice. Saved as drafts." />
      <form action={generateCaptionFormAction} className="mb-8 grid max-w-xl gap-3">
        <div className="space-y-1">
          <Label>Platform</Label>
          <select name="platform" className="h-9 w-full rounded-lg border px-3 text-sm">
            {SOCIAL_PLATFORMS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label>Topic</Label>
          <Input name="topic" required defaultValue={ctx.profile?.primaryGoal ?? ""} />
        </div>
        <div className="space-y-1">
          <Label>Tone</Label>
          <Input name="tone" defaultValue={ctx.profile?.brandTone ?? "Professional"} />
        </div>
        <Button type="submit">Generate captions</Button>
      </form>
      <div className="grid gap-4 md:grid-cols-2">
        {drafts.map((draft) => (
          <Card key={draft.id}>
            <CardHeader>
              <CardTitle className="text-base">{draft.platform}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">{draft.copy}</CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
