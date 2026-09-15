import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
    newUser: "/onboarding",
  },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isLoggedIn = Boolean(auth?.user);
      const isAuthRoute =
        pathname.startsWith("/login") ||
        pathname.startsWith("/signup") ||
        pathname.startsWith("/forgot-password") ||
        pathname.startsWith("/reset-password");
      const isApp = pathname.startsWith("/app") || pathname.startsWith("/onboarding");
      const isAdmin = pathname.startsWith("/admin");

      if ((isApp || isAdmin) && !isLoggedIn) return false;
      if (isAuthRoute && isLoggedIn) return Response.redirect(new URL("/app", request.nextUrl));
      if (isAdmin && auth?.user?.platformRole !== "SUPER_ADMIN") {
        return Response.redirect(new URL("/app", request.nextUrl));
      }
      if (auth?.user?.status === "SUSPENDED" && isApp) {
        return Response.redirect(new URL("/login?error=suspended", request.nextUrl));
      }
      return true;
    },
  },
} satisfies NextAuthConfig;
