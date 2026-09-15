import { requireWorkspace } from "@/server/auth-context";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

export default async function PublishedPostsPage() {
  const ctx = await requireWorkspace();
  const posts = await prisma.socialPost.findMany({
    where: { workspaceId: ctx.workspace.id, status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 50,
    select: {
      id: true,
      platform: true,
      copy: true,
      publishedAt: true,
      externalPostId: true,
    },
  });

  return (
    <div>
      <PageHeader title="Published posts" description="Successful publishes from this workspace. External IDs are stored when the live API returns them." />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Published</TableHead>
            <TableHead>Platform</TableHead>
            <TableHead>Copy</TableHead>
            <TableHead>External ID</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-muted-foreground">
                No published posts yet.
              </TableCell>
            </TableRow>
          ) : (
            posts.map((post) => (
              <TableRow key={post.id}>
                <TableCell className="whitespace-nowrap text-xs">
                  {post.publishedAt ? format(post.publishedAt, "MMM d, yyyy HH:mm") : "—"}
                </TableCell>
                <TableCell>{post.platform.replaceAll("_", " ")}</TableCell>
                <TableCell className="max-w-md truncate">{post.copy}</TableCell>
                <TableCell className="font-mono text-xs">{post.externalPostId ?? "—"}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
