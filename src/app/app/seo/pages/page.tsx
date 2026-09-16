import { requireWorkspace } from "@/server/auth-context";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function SeoPagesPage() {
  const ctx = await requireWorkspace();
  const pages = await prisma.seoPage.findMany({
    where: { workspaceId: ctx.workspace.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader title="Page optimization" description="Pages captured from website audits. Fix titles, meta, and H1s first." />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>URL</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>H1</TableHead>
            <TableHead>Words</TableHead>
            <TableHead>Score</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pages.map((page) => (
            <TableRow key={page.id}>
              <TableCell className="max-w-xs truncate">{page.url}</TableCell>
              <TableCell>{page.title}</TableCell>
              <TableCell>{page.h1}</TableCell>
              <TableCell>{page.wordCount}</TableCell>
              <TableCell>{page.score}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
