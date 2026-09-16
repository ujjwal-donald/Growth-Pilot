import { requireWorkspace } from "@/server/auth-context";
import { prisma } from "@/lib/db";
import { generateHashtagsFormAction } from "@/server/actions/ai";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SOCIAL_PLATFORMS } from "@/lib/constants";

export default async function HashtagsPage() {
  const ctx = await requireWorkspace();
  const drafts = await prisma.socialPost.findMany({
    where: { workspaceId: ctx.workspace.id, contentType: "hashtags" },
    orderBy: { createdAt: "desc" },
    take: 12,
  });

  return (
    <div>
      <PageHeader title="Hashtag generator" description="Primary and niche tags saved onto draft posts." />
      <form action={generateHashtagsFormAction} className="mb-8 grid max-w-xl gap-3">
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
          <Input name="topic" required defaultValue={ctx.profile?.industry ?? ""} />
        </div>
        <Button type="submit">Generate hashtags</Button>
      </form>
      <ul className="space-y-3 text-sm">
        {drafts.map((draft) => (
          <li key={draft.id} className="rounded-lg border p-3">
            {draft.hashtags.join(" ")}
          </li>
        ))}
      </ul>
    </div>
  );
}
