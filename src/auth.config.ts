import type { NextAuthConfig } from "next-auth";

function hasSessionCookie(request: { cookies: { get(name: string): { value: string } | undefined } }) {
  const names = [
    "authjs.session-token",
    "__Secure-authjs.session-token",
    "__Host-authjs.session-token",
    "next-auth.session-token",
    "__Secure-next-auth.session-token",
  ];
  return names.some((name) => Boolean(request.cookies.get(name)?.value));
}

export const authConfig = {
  trustHost: true,
  pages: {
    signIn: "/login",
    newUser: "/onboarding",
  },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isLoggedIn = Boolean(auth?.user?.email || auth?.user?.id) || hasSessionCookie(request);
      const isAuthRoute =
        pathname.startsWith("/login") ||
        pathname.startsWith("/signup") ||
        pathname.startsWith("/forgot-password") ||
        pathname.startsWith("/reset-password");
      const isApp = pathname.startsWith("/app") || pathname.startsWith("/onboarding");
      const isAdmin = pathname.startsWith("/admin");

      if ((isApp || isAdmin) && !isLoggedIn) return false;
      if (isAuthRoute && isLoggedIn) {
        return new Response(null, { status: 303, headers: { Location: "/app" } });
      }
      if (isAdmin && auth?.user?.platformRole !== "SUPER_ADMIN") {
        // Cookie may be valid even when Edge JWT decode skipped custom fields — let Node layout enforce admin.
        if (!auth?.user && hasSessionCookie(request)) return true;
        return new Response(null, { status: 303, headers: { Location: "/app" } });
      }
      if (auth?.user?.status === "SUSPENDED" && isApp) {
        return new Response(null, { status: 303, headers: { Location: "/login?error=suspended" } });
      }
      return true;
    },
    redirect({ url }) {
      try {
        const parsed = new URL(url, "http://localhost");
        if (parsed.hostname.endsWith("cursorvm.com")) {
          return `${parsed.pathname}${parsed.search}`;
        }
        if (url.startsWith("/")) return url;
        return `${parsed.pathname}${parsed.search}` || "/app";
      } catch {
        return url.startsWith("/") ? url : "/app";
      }
    },
  },
} satisfies NextAuthConfig;
