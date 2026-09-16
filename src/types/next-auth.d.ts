import type { DefaultSession } from "next-auth";
import type { MemberRole, PlatformRole } from "@/generated/prisma/client";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      platformRole: PlatformRole;
      status: "ACTIVE" | "SUSPENDED";
      workspaceId?: string;
      workspaceRole?: MemberRole;
      onboardingCompleted?: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    platformRole?: PlatformRole;
    status?: "ACTIVE" | "SUSPENDED";
    workspaceId?: string;
    workspaceRole?: MemberRole;
    onboardingCompleted?: boolean;
  }
}
