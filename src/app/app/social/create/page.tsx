import { requireWorkspace } from "@/server/auth-context";
import { prisma } from "@/lib/db";
import { socialAccountPublicSelect } from "@/lib/social/account-select";
import { createSocialPostAction } from "@/server/actions/social";
import { PageHeader } from "@/components/layout/page-header";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default async function CreateSocialPostPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const ctx = await requireWorkspace();
  const params = await searchParams;
  const accounts = await prisma.socialAccount.findMany({
    where: { workspaceId: ctx.workspace.id, connectionStatus: "CONNECTED" },
    select: socialAccountPublicSelect,
    orderBy: { platform: "asc" },
  });

  return (
    <div>
      <PageHeader
        title="Create post"
        description="Compose copy, attach media, then save a draft, schedule, or publish. Tokens never leave the server."
        actions={
          <Link href="/app/content/posts" className={cn(buttonVariants({ variant: "outline" }))}>
            AI post generator
          </Link>
        }
      />
      {params.ok ? <p className="mb-4 text-sm text-teal-700">Draft saved.</p> : null}
      {params.error ? (
        <p className="mb-4 text-sm text-destructive">
          {params.error === "copy"
            ? "Write some copy before saving."
            : params.error === "account"
              ? "Connect a social account first."
              : params.error === "schedule"
                ? "Choose a schedule time."
                : params.error === "media"
                  ? "Media upload failed."
                  : decodeURIComponent(params.error)}
        </p>
      ) : null}
      {accounts.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-sm text-muted-foreground">
            Connect an account on{" "}
            <Link href="/app/social/channels" className="text-indigo-600">
              Social accounts
            </Link>{" "}
            before composing.
          </CardContent>
        </Card>
      ) : (
        <form action={createSocialPostAction} className="max-w-2xl space-y-4" encType="multipart/form-data">
          <div className="space-y-2">
            <Label htmlFor="accountId">Account</Label>
            <select
              id="accountId"
              name="accountId"
              required
              className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm"
            >
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.platform.replaceAll("_", " ")} · {account.accountName}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="copy">Copy</Label>
            <Textarea id="copy" name="copy" required rows={8} placeholder="Write the post…" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cta">Call to action</Label>
            <Input id="cta" name="cta" placeholder="Shop now, Book a demo…" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hashtags">Hashtags</Label>
            <Input id="hashtags" name="hashtags" placeholder="#marketing #growth" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="media">Media</Label>
            <Input id="media" name="media" type="file" accept="image/*,video/mp4" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="scheduledAt">Schedule (for Schedule)</Label>
            <Input id="scheduledAt" name="scheduledAt" type="datetime-local" />
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="submit" name="intent" value="draft" className={cn(buttonVariants({ variant: "outline" }))}>
              Save draft
            </button>
            <button type="submit" name="intent" value="schedule" className={cn(buttonVariants({ variant: "secondary" }))}>
              Schedule
            </button>
            <button type="submit" name="intent" value="publish" className={cn(buttonVariants())}>
              Publish now
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
