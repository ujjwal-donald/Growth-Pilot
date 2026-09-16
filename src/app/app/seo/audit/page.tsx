import { requireWorkspace } from "@/server/auth-context";
import { prisma } from "@/lib/db";
import { runWebsiteAuditAction } from "@/server/actions/seo";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function SeoAuditPage() {
  const ctx = await requireWorkspace();
  const audits = await prisma.seoAudit.findMany({
    where: { workspaceId: ctx.workspace.id },
    orderBy: { createdAt: "desc" },
    take: 8,
    include: { issues: { orderBy: { createdAt: "asc" } } },
  });
  const latest = audits[0];

  return (
    <div>
      <PageHeader
        title="Website audit"
        description="Fetches the public URL and scores titles, meta, headings, HTTPS, viewport, canonical, and image alt text."
      />
      <form action={runWebsiteAuditAction} className="mb-6 flex max-w-xl gap-2">
        <Input name="url" type="url" placeholder="https://example.com" defaultValue={ctx.profile?.website ?? ""} required />
        <Button type="submit">Audit URL</Button>
      </form>
      {latest ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Priority</TableHead>
              <TableHead>Issue</TableHead>
              <TableHead>Category</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {latest.issues.map((issue) => (
              <TableRow key={issue.id}>
                <TableCell>{issue.priority}</TableCell>
                <TableCell>
                  <p className="font-medium text-foreground">{issue.title}</p>
                  <p className="text-muted-foreground">{issue.description}</p>
                </TableCell>
                <TableCell>{issue.category}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="text-sm text-muted-foreground">Run the first audit to populate issues.</p>
      )}
    </div>
  );
}
