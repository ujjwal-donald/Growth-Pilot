import { requireWorkspace } from "@/server/auth-context";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function CampaignPerformancePage() {
  const ctx = await requireWorkspace();
  const campaigns = await prisma.campaign.findMany({
    where: { workspaceId: ctx.workspace.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { leads: true } } },
  });

  return (
    <div>
      <PageHeader title="Campaign performance" description="Ads and lead campaigns in one table. Network spend fills in when adapters go live." />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Kind</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Network</TableHead>
            <TableHead>Leads</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.kind}</TableCell>
              <TableCell>{row.status}</TableCell>
              <TableCell>{row.network ?? "—"}</TableCell>
              <TableCell>{row._count.leads}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
