import { requireAdmin } from "@/server/auth-context";
import { Logo } from "@/components/brand/logo";
import Link from "next/link";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex h-14 items-center justify-between border-b bg-white px-6">
        <Logo />
        <nav className="flex gap-4 text-sm">
          <Link href="/admin">Overview</Link>
          <Link href="/admin/users">Users</Link>
          <Link href="/admin/workspaces">Companies</Link>
          <Link href="/app">Back to app</Link>
        </nav>
      </header>
      <main className="p-8">{children}</main>
    </div>
  );
}
