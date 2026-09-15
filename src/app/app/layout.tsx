import { requireWorkspace } from "@/server/auth-context";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const ctx = await requireWorkspace();
  if (!ctx.workspace.onboardingCompleted) redirect("/onboarding");

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] dark:bg-background">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader
          userName={ctx.user.name}
          workspaceName={ctx.workspace.name}
          isAdmin={ctx.user.platformRole === "SUPER_ADMIN"}
        />
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
