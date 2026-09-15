import { requireWorkspace } from "@/server/auth-context";
import { inviteMemberAction } from "@/server/actions/workspace";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function TeamPage() {
  const ctx = await requireWorkspace();
  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId: ctx.workspace.id },
    include: { user: true },
  });

  return (
    <div>
      <PageHeader title="Team" description="Owner, Admin, Marketer, Editor, Viewer — workspace-scoped RBAC." />
      <form
        action={async (formData) => {
          "use server";
          await inviteMemberAction(formData);
        }}
        className="mb-6 flex max-w-xl gap-2"
      >
        <Input name="email" type="email" placeholder="teammate@company.com" required />
        <select name="role" className="h-8 rounded-lg border px-2 text-sm">
          <option>MARKETER</option>
          <option>EDITOR</option>
          <option>ADMIN</option>
          <option>VIEWER</option>
        </select>
        <Button type="submit">Invite</Button>
      </form>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id}>
              <TableCell>{member.user.name}</TableCell>
              <TableCell>{member.user.email}</TableCell>
              <TableCell>{member.role}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
