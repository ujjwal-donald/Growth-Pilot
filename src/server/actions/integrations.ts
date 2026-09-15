"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ConnectionStatus, IntegrationProvider } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { requireWorkspace } from "@/server/auth-context";
import { resolveOAuthStart } from "@/server/services/oauth-connect";
import { originFromHeaders } from "@/lib/http/relative-redirect";
import { headers } from "next/headers";

export async function connectIntegrationAction(formData: FormData) {
  const ctx = await requireWorkspace("MARKETER");
  const provider = String(formData.get("provider") || "");
  const headerList = await headers();
  const { href } = await resolveOAuthStart({
    workspaceId: ctx.workspace.id,
    userId: ctx.user.id,
    platformParam: provider,
    origin: originFromHeaders(headerList),
  });
  revalidatePath("/app/integrations");
  revalidatePath("/app/analytics/website");
  redirect(href);
}

export async function disconnectIntegrationAction(formData: FormData) {
  const ctx = await requireWorkspace("MARKETER");
  const provider = String(formData.get("provider") || "") as IntegrationProvider;
  await prisma.integration.updateMany({
    where: { workspaceId: ctx.workspace.id, provider },
    data: {
      status: ConnectionStatus.NOT_CONNECTED,
      encryptedAccessToken: null,
      encryptedRefreshToken: null,
      tokenExpiry: null,
      lastError: null,
    },
  });
  revalidatePath("/app/integrations");
  revalidatePath("/app/analytics/website");
  redirect("/app/integrations");
}
