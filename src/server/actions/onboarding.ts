"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser, requireWorkspace } from "@/server/auth-context";
import { SOCIAL_PLATFORMS } from "@/lib/constants";
import type { SocialPlatform } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";

const onboardingSchema = z.object({
  businessName: z.string().min(2),
  website: z.string().optional(),
  industry: z.string().min(2),
  targetAudience: z.string().min(2),
  description: z.string().min(10),
  country: z.string().min(2),
  primaryGoal: z.string().min(2),
  platforms: z.array(z.string()).min(1),
  brandTone: z.string().min(2),
  customBrandTone: z.string().optional(),
});

export async function completeOnboardingAction(input: z.infer<typeof onboardingSchema>) {
  const parsed = onboardingSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid onboarding data" };

  const user = await requireUser();
  const ctx = await requireWorkspace("EDITOR");
  const platforms = parsed.data.platforms.filter((p) =>
    SOCIAL_PLATFORMS.some((item) => item.id === p),
  ) as SocialPlatform[];

  await prisma.$transaction([
    prisma.businessProfile.upsert({
      where: { workspaceId: ctx.workspace.id },
      create: {
        workspaceId: ctx.workspace.id,
        businessName: parsed.data.businessName,
        website: parsed.data.website,
        industry: parsed.data.industry,
        targetAudience: parsed.data.targetAudience,
        description: parsed.data.description,
        country: parsed.data.country,
        primaryGoal: parsed.data.primaryGoal,
        platforms,
        brandTone: parsed.data.brandTone,
        customBrandTone: parsed.data.customBrandTone,
      },
      update: {
        businessName: parsed.data.businessName,
        website: parsed.data.website,
        industry: parsed.data.industry,
        targetAudience: parsed.data.targetAudience,
        description: parsed.data.description,
        country: parsed.data.country,
        primaryGoal: parsed.data.primaryGoal,
        platforms,
        brandTone: parsed.data.brandTone,
        customBrandTone: parsed.data.customBrandTone,
      },
    }),
    prisma.workspace.update({
      where: { id: ctx.workspace.id },
      data: { name: parsed.data.businessName, onboardingCompleted: true },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: { onboardingCompleted: true },
    }),
  ]);

  revalidatePath("/app");
  return { ok: true };
}

export async function updateBusinessProfileAction(formData: FormData) {
  const ctx = await requireWorkspace("ADMIN");
  const products = String(formData.get("products") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const services = String(formData.get("services") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const competitors = String(formData.get("competitors") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  await prisma.businessProfile.upsert({
    where: { workspaceId: ctx.workspace.id },
    create: {
      workspaceId: ctx.workspace.id,
      businessName: String(formData.get("businessName") || ctx.workspace.name),
      website: String(formData.get("website") || ""),
      industry: String(formData.get("industry") || ""),
      targetAudience: String(formData.get("targetAudience") || ""),
      description: String(formData.get("description") || ""),
      country: String(formData.get("country") || ""),
      primaryGoal: String(formData.get("primaryGoal") || ""),
      brandTone: String(formData.get("brandTone") || "Professional"),
      customBrandTone: String(formData.get("customBrandTone") || ""),
      brandColors: {
        primary: String(formData.get("primaryColor") || "#4F46E5"),
        accent: String(formData.get("accentColor") || "#0D9488"),
      },
      products,
      services,
      competitors,
    },
    update: {
      businessName: String(formData.get("businessName") || ctx.workspace.name),
      website: String(formData.get("website") || ""),
      industry: String(formData.get("industry") || ""),
      targetAudience: String(formData.get("targetAudience") || ""),
      description: String(formData.get("description") || ""),
      country: String(formData.get("country") || ""),
      primaryGoal: String(formData.get("primaryGoal") || ""),
      brandTone: String(formData.get("brandTone") || "Professional"),
      customBrandTone: String(formData.get("customBrandTone") || ""),
      brandColors: {
        primary: String(formData.get("primaryColor") || "#4F46E5"),
        accent: String(formData.get("accentColor") || "#0D9488"),
      },
      products,
      services,
      competitors,
    },
  });

  revalidatePath("/app/brand");
  return { ok: true };
}
