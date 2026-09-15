import { requireWorkspace } from "@/server/auth-context";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function LegacySocialAccountsPage() {
  await requireWorkspace();
  redirect("/app/social/channels");
}
