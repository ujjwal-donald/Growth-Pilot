"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { prisma } from "@/lib/db";
import { createWorkspaceForUser } from "@/server/services/workspace";
import crypto from "node:crypto";

function isNextRedirect(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    String((error as { digest?: string }).digest).startsWith("NEXT_REDIRECT")
  );
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) {
    redirect("/login?error=missing");
  }

  try {
    await signIn("credentials", { email, password, redirectTo: "/app" });
  } catch (error) {
    if (isNextRedirect(error)) {
      const digest = String((error as { digest?: string }).digest);
      if (digest.includes("cursorvm.com")) {
        redirect("/app");
      }
      throw error;
    }
    if (error instanceof AuthError) {
      redirect("/login?error=invalid");
    }
    throw error;
  }
}

const signupSchema = z.object({
  name: z.string().min(2, "Enter your full name"),
  email: z.string().email(),
  password: z.string().min(8, "Use at least 8 characters"),
  companyName: z.string().min(2, "Enter your company name"),
});

export async function signupAction(formData: FormData) {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    companyName: formData.get("companyName"),
  });

  if (!parsed.success) {
    redirect("/signup?error=invalid");
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) redirect("/signup?error=exists");

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email,
      passwordHash,
      companyName: parsed.data.companyName,
      platformRole: adminEmail && email === adminEmail ? "SUPER_ADMIN" : "USER",
    },
  });

  await createWorkspaceForUser({ userId: user.id, name: parsed.data.companyName });

  try {
    await signIn("credentials", {
      email,
      password: parsed.data.password,
      redirectTo: "/onboarding",
    });
  } catch (error) {
    if (isNextRedirect(error)) {
      redirect("/onboarding");
    }
    if (error instanceof AuthError) {
      redirect("/login?error=created");
    }
    throw error;
  }
}

export async function requestPasswordResetAction(formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  if (!email) return { error: "Enter your email." };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { ok: true };

  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60);

  await prisma.passwordResetToken.create({
    data: { userId: user.id, tokenHash, expiresAt },
  });

  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/reset-password?token=${token}`;
  if (process.env.NODE_ENV !== "production") {
    console.info("[dev] Password reset URL:", resetUrl);
    return { ok: true, devResetUrl: resetUrl };
  }

  return { ok: true };
}

export async function resetPasswordAction(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!token || password.length < 8) {
    return { error: "Invalid token or password too short." };
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });
  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return { error: "This reset link is invalid or expired." };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
  ]);

  return { ok: true };
}
