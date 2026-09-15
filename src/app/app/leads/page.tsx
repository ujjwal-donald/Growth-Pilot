import { requireWorkspace } from "@/server/auth-context";
import { prisma } from "@/lib/db";
import { createLeadAction } from "@/server/actions/workspace";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function LeadsPage() {
  const ctx = await requireWorkspace();
  const leads = await prisma.lead.findMany({
    where: { workspaceId: ctx.workspace.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader title="Leads" description="Lightweight CRM: New, Contacted, Qualified, Proposal, Won, Lost." />
      <form action={createLeadAction} className="mb-6 grid gap-2 md:grid-cols-5">
        <Input name="name" placeholder="Name" required />
        <Input name="email" placeholder="Email" />
        <Input name="company" placeholder="Company" />
        <Input name="source" placeholder="Source" />
        <Button type="submit">Add lead</Button>
      </form>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id}>
              <TableCell>{lead.name}</TableCell>
              <TableCell>{lead.email}</TableCell>
              <TableCell>{lead.company}</TableCell>
              <TableCell>{lead.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
