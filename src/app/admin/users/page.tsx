import { prisma } from "@/lib/db";
import { suspendUserAction } from "@/server/actions/admin";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 100 });

  return (
    <div>
      <PageHeader title="Users" />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Role</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.status}</TableCell>
              <TableCell>{user.platformRole}</TableCell>
              <TableCell>
                <form
                  action={async () => {
                    "use server";
                    await suspendUserAction(user.id, user.status === "ACTIVE");
                  }}
                >
                  <Button type="submit" variant="outline" size="sm">
                    {user.status === "ACTIVE" ? "Suspend" : "Restore"}
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
