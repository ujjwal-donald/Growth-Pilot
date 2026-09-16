import { prisma } from "@/lib/db";
import { changeWorkspacePlanAction } from "@/server/actions/admin";
import { PlanTier } from "@/generated/prisma/client";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function AdminWorkspacesPage() {
  const workspaces = await prisma.workspace.findMany({
    include: { subscription: true, owner: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader title="Companies" />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Workspace</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>AI used</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {workspaces.map((workspace) => (
            <TableRow key={workspace.id}>
              <TableCell>{workspace.name}</TableCell>
              <TableCell>{workspace.owner.email}</TableCell>
              <TableCell>{workspace.subscription?.plan}</TableCell>
              <TableCell>{workspace.subscription?.aiGenerationsUsed}</TableCell>
              <TableCell>
                <form
                  action={async () => {
                    "use server";
                    await changeWorkspacePlanAction(workspace.id, PlanTier.GROWTH);
                  }}
                >
                  <Button type="submit" variant="outline" size="sm">
                    Set Growth
                  </Button>
                </form>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
