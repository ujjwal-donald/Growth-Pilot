import { requireWorkspace } from "@/server/auth-context";
import { prisma } from "@/lib/db";
import { cancelScheduledPostAction, publishNowAction, retryFailedPostAction } from "@/server/actions/social";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { format } from "date-fns";

export default async function SchedulerPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const ctx = await requireWorkspace();
  const params = await searchParams;
  const posts = await prisma.socialPost.findMany({
    where: {
      workspaceId: ctx.workspace.id,
      status: { in: ["DRAFT", "SCHEDULED", "PUBLISHING", "FAILED"] },
    },
    orderBy: [{ scheduledAt: "asc" }, { createdAt: "desc" }],
    take: 50,
    select: {
      id: true,
      platform: true,
      copy: true,
      status: true,
      scheduledAt: true,
      lastError: true,
      createdAt: true,
    },
  });

  return (
    <div>
      <PageHeader
        title="Scheduler"
        description="Due posts publish automatically about once a minute in development, or via POST /api/jobs/publish with CRON_SECRET."
        actions={
          <Link href="/app/social/create" className={cn(buttonVariants())}>
            New post
          </Link>
        }
      />
      {params.error ? <p className="mb-4 text-sm text-destructive">{decodeURIComponent(params.error)}</p> : null}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>When</TableHead>
            <TableHead>Platform</TableHead>
            <TableHead>Copy</TableHead>
            <TableHead>Status</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-muted-foreground">
                Nothing queued. Create a post to schedule it.
              </TableCell>
            </TableRow>
          ) : (
            posts.map((post) => (
              <TableRow key={post.id}>
                <TableCell className="whitespace-nowrap text-xs">
                  {post.scheduledAt ? format(post.scheduledAt, "MMM d, HH:mm") : "—"}
                </TableCell>
                <TableCell>{post.platform.replaceAll("_", " ")}</TableCell>
                <TableCell className="max-w-sm truncate">{post.copy}</TableCell>
                <TableCell>
                  <Badge variant={post.status === "FAILED" ? "destructive" : "secondary"}>{post.status}</Badge>
                  {post.lastError ? <p className="mt-1 text-xs text-destructive">{post.lastError}</p> : null}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-2">
                    {post.status === "SCHEDULED" || post.status === "DRAFT" ? (
                      <form action={publishNowAction}>
                        <input type="hidden" name="postId" value={post.id} />
                        <button type="submit" className={cn(buttonVariants({ size: "sm" }))}>
                          Publish
                        </button>
                      </form>
                    ) : null}
                    {post.status === "SCHEDULED" ? (
                      <form action={cancelScheduledPostAction}>
                        <input type="hidden" name="postId" value={post.id} />
                        <button type="submit" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
                          Cancel
                        </button>
                      </form>
                    ) : null}
                    {post.status === "FAILED" ? (
                      <form action={retryFailedPostAction}>
                        <input type="hidden" name="postId" value={post.id} />
                        <button type="submit" className={cn(buttonVariants({ size: "sm" }))}>
                          Retry
                        </button>
                      </form>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
