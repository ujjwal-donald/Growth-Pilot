import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient, PlanTier, SocialPlatform } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }
  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  const email = "demo@updon.ai";
  const passwordHash = await bcrypt.hash("Demo1234!", 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      onboardingCompleted: true,
      platformRole: "SUPER_ADMIN",
      status: "ACTIVE",
    },
    create: {
      email,
      name: "Demo Owner",
      companyName: "Demo Studio",
      passwordHash,
      onboardingCompleted: true,
      platformRole: "SUPER_ADMIN",
    },
  });

  let membership = await prisma.workspaceMember.findFirst({
    where: { userId: user.id },
    include: { workspace: true },
  });

  if (!membership) {
    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + 1);
    const workspace = await prisma.workspace.create({
      data: {
        name: "Demo Studio",
        slug: `demo-studio-${Math.random().toString(36).slice(2, 7)}`,
        ownerId: user.id,
        onboardingCompleted: true,
        members: {
          create: { userId: user.id, role: "OWNER", inviteStatus: "ACCEPTED" },
        },
        subscription: {
          create: { plan: PlanTier.GROWTH, status: "ACTIVE", currentPeriodEnd: periodEnd },
        },
        businessProfile: {
          create: {
            businessName: "Demo Studio",
            website: "https://updon.ai",
            industry: "SaaS",
            targetAudience: "Founders of growing service businesses",
            description: "UPDON demo workspace for evaluating the AI marketing platform.",
            country: "India",
            primaryGoal: "Generate Leads",
            platforms: [SocialPlatform.INSTAGRAM, SocialPlatform.LINKEDIN],
            brandTone: "Professional",
          },
        },
      },
    });
    membership = await prisma.workspaceMember.findFirstOrThrow({
      where: { workspaceId: workspace.id, userId: user.id },
      include: { workspace: true },
    });
  }

  console.log("Seeded", user.email, "workspace", membership.workspace.slug);
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
