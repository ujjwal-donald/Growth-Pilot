import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/db";
import { isGoogleAuthEnabled } from "@/lib/env";
import { ensureWorkspaceForUser } from "@/server/services/workspace";

const googleProvider =
  isGoogleAuthEnabled() && process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? [
        Google({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
      ]
    : [];

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  // Credentials + JWT cannot use a database session adapter — it drops the cookie.
  providers: [
    ...googleProvider,
    Credentials({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "")
          .trim()
          .toLowerCase();
        const password = String(credentials?.password ?? "");
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.passwordHash) return null;
        if (user.status === "SUSPENDED") return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger, session }) {
      if (user) {
        const email = user.email?.toLowerCase();
        if (email) {
          const dbUser = await prisma.user.upsert({
            where: { email },
            update: {
              name: user.name ?? undefined,
              image: user.image ?? undefined,
            },
            create: {
              email,
              name: user.name,
              image: user.image,
            },
          });
          token.userId = dbUser.id;
          await ensureWorkspaceForUser(
            dbUser.id,
            dbUser.companyName || dbUser.name || "My workspace",
          );
        } else if (user.id) {
          token.userId = String(user.id);
        }
      }

      if (trigger === "update" && session?.workspaceId) {
        token.workspaceId = session.workspaceId;
      }

      if (token.userId) {
        const userId = String(token.userId);
        const dbUser = await prisma.user.findUnique({ where: { id: userId } });
        const memberships = await prisma.workspaceMember.findMany({
          where: { userId },
          orderBy: { createdAt: "asc" },
        });
        if (dbUser) {
          token.platformRole = dbUser.platformRole;
          token.status = dbUser.status;
          token.onboardingCompleted = dbUser.onboardingCompleted;
          token.workspaceId = token.workspaceId ?? memberships[0]?.workspaceId;
          token.workspaceRole = memberships.find((m) => m.workspaceId === token.workspaceId)?.role;
          if (!token.workspaceRole && memberships[0]) {
            token.workspaceRole = memberships[0].role;
            token.workspaceId = memberships[0].workspaceId;
          }
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.userId ?? "");
        session.user.platformRole = (token.platformRole as typeof session.user.platformRole) ?? "USER";
        session.user.status = (token.status as typeof session.user.status) ?? "ACTIVE";
        session.user.workspaceId = token.workspaceId ? String(token.workspaceId) : undefined;
        session.user.workspaceRole = token.workspaceRole as typeof session.user.workspaceRole;
        session.user.onboardingCompleted = Boolean(token.onboardingCompleted);
      }
      return session;
    },
  },
});
