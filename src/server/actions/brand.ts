"use server";

import { prisma } from "@/lib/db";
import { requireWorkspace, ActionError } from "@/server/auth-context";
import { getStorageDriver } from "@/lib/storage";
import { mediaObjectKey } from "@/lib/storage/safe-key";
import { AssetType } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateBrandVoiceAction(formData: FormData) {
  const ctx = await requireWorkspace("ADMIN");
  await prisma.businessProfile.upsert({
    where: { workspaceId: ctx.workspace.id },
    create: {
      workspaceId: ctx.workspace.id,
      businessName: ctx.workspace.name,
      brandTone: String(formData.get("brandTone") || "Professional"),
      customBrandTone: String(formData.get("customBrandTone") || "") || null,
      description: String(formData.get("description") || "") || null,
    },
    update: {
      brandTone: String(formData.get("brandTone") || "Professional"),
      customBrandTone: String(formData.get("customBrandTone") || "") || null,
      description: String(formData.get("description") || ctx.profile?.description || "") || null,
    },
  });
  revalidatePath("/app/brand/voice");
  redirect("/app/brand/voice");
}

export async function uploadBrandAssetAction(formData: FormData) {
  const ctx = await requireWorkspace("ADMIN");
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    throw new ActionError("Choose a file to upload.");
  }
  if (file.size > 6_000_000) {
    throw new ActionError("Files must be under 6 MB.");
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  const stored = await getStorageDriver().put({
    key: mediaObjectKey(ctx.workspace.id, file.name),
    body: buffer,
    contentType: file.type || "application/octet-stream",
  });
  const typeRaw = String(formData.get("type") || "IMAGE") as AssetType;
  await prisma.brandAsset.create({
    data: {
      workspaceId: ctx.workspace.id,
      type: typeRaw,
      name: String(formData.get("name") || file.name),
      storageKey: stored.key,
      mimeType: file.type,
      url: stored.url,
    },
  });
  revalidatePath("/app/brand/assets");
  redirect("/app/brand/assets");
}

export async function saveWhiteLabelAction(formData: FormData) {
  const ctx = await requireWorkspace("OWNER");
  await prisma.workspace.update({
    where: { id: ctx.workspace.id },
    data: {
      whiteLabelEnabled: String(formData.get("whiteLabelEnabled") || "") === "on",
      whiteLabelPrimary: String(formData.get("whiteLabelPrimary") || "") || null,
      whiteLabelAccent: String(formData.get("whiteLabelAccent") || "") || null,
    },
  });
  revalidatePath("/app/settings");
  redirect("/app/settings");
}
