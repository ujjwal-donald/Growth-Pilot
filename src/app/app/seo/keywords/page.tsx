import { requireWorkspace } from "@/server/auth-context";
import { prisma } from "@/lib/db";
import { researchKeywordsFormAction } from "@/server/actions/seo";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function KeywordsPage() {
  const ctx = await requireWorkspace();
  const rows = await prisma.keyword.findMany({
    where: { workspaceId: ctx.workspace.id },
    orderBy: { createdAt: "desc" },
    take: 40,
  });

  return (
    <div>
      <PageHeader
        title="Keyword research"
        description="Demo provider until Keyword Planner / DataForSEO credentials are set. Results persist on this workspace."
      />
      <form action={researchKeywordsFormAction} className="mb-6 flex max-w-lg gap-2">
        <Input name="keyword" placeholder="digital marketing automation" required />
        <Button type="submit">Research</Button>
      </form>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Keyword</TableHead>
            <TableHead>Volume</TableHead>
            <TableHead>Difficulty</TableHead>
            <TableHead>Intent</TableHead>
            <TableHead>Provider</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.keyword}</TableCell>
              <TableCell>{row.searchVolume}</TableCell>
              <TableCell>{row.difficulty}</TableCell>
              <TableCell>{row.intent}</TableCell>
              <TableCell>{row.provider}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
