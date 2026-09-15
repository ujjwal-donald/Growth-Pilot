import crypto from "node:crypto";
import { ConnectionStatus, type IntegrationProvider, type SocialPlatform } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { encryptSecret } from "@/lib/security/crypto";
import { getOAuthApp, isOAuthConfigured } from "@/lib/social/oauth-apps";
import { buildAuthorizeUrl, exchangeOAuthCode } from "@/lib/social/oauth";
import { signOAuthState, readOAuthState } from "@/lib/social/oauth-state";
import { locationRedirect, relativeRedirect, requestOrigin } from "@/lib/http/relative-redirect";
import { auth } from "@/auth";

function normalizeProvider(platform: string) {
  return platform.replaceAll("-", "_").toUpperCase();
}

function accountsRedirect(error?: string) {
  const path = error ? `/app/social/accounts?error=${encodeURIComponent(error)}` : "/app/social/accounts";
  return relativeRedirect(path);
}

function integrationsRedirect(error?: string) {
  const path = error
    ? `/app/integrations?error=${encodeURIComponent(error)}`
    : "/app/integrations";
  return relativeRedirect(path);
}

function successRedirect(kind: "social" | "analytics") {
  return kind === "analytics" ? integrationsRedirect() : accountsRedirect();
}

function errorRedirect(kind: "social" | "analytics", message: string) {
  return kind === "analytics" ? integrationsRedirect(message) : accountsRedirect(message);
}

async function requireSessionUser() {
  const session = await auth();
  if (!session?.user?.id || !session.user.workspaceId) return null;
  return session.user;
}

async function upsertDemoSocial(workspaceId: string, platform: SocialPlatform) {
  const existing = await prisma.socialAccount.findFirst({
    where: { workspaceId, platform },
    select: { id: true },
  });
  const data = {
    accountName: `Demo ${platform.replaceAll("_", " ")}`,
    externalAccountId: `demo-${platform.toLowerCase()}`,
    encryptedAccessToken: null,
    encryptedRefreshToken: null,
    tokenExpiry: null,
    connectionStatus: ConnectionStatus.CONNECTED,
    lastError: null,
  };
  if (existing) {
    await prisma.socialAccount.update({ where: { id: existing.id }, data });
  } else {
    await prisma.socialAccount.create({
      data: { workspaceId, platform, ...data },
    });
  }
}

async function upsertDemoIntegration(workspaceId: string, provider: IntegrationProvider) {
  await prisma.integration.upsert({
    where: { workspaceId_provider: { workspaceId, provider } },
    create: {
      workspaceId,
      provider,
      status: ConnectionStatus.CONNECTED,
      lastError: null,
      encryptedAccessToken: null,
      encryptedRefreshToken: null,
    },
    update: {
      status: ConnectionStatus.CONNECTED,
      lastError: null,
      encryptedAccessToken: null,
      encryptedRefreshToken: null,
    },
  });
}

async function fetchProfile(provider: string, accessToken: string) {
  try {
    if (provider === "FACEBOOK" || provider === "INSTAGRAM") {
      const res = await fetch("https://graph.facebook.com/v21.0/me?fields=id,name", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const json = (await res.json()) as { id?: string; name?: string };
      return { id: json.id ?? null, name: json.name ?? provider };
    }
    if (provider === "LINKEDIN") {
      const res = await fetch("https://api.linkedin.com/v2/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const json = (await res.json()) as { sub?: string; name?: string };
      return { id: json.sub ?? null, name: json.name ?? "LinkedIn" };
    }
    if (provider === "X") {
      const res = await fetch("https://api.twitter.com/2/users/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const json = (await res.json()) as { data?: { id?: string; name?: string; username?: string } };
      return {
        id: json.data?.id ?? null,
        name: json.data?.username ? `@${json.data.username}` : (json.data?.name ?? "X"),
      };
    }
    const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const json = (await res.json()) as { id?: string; email?: string; name?: string };
    return { id: json.id ?? null, name: json.email || json.name || provider };
  } catch {
    return { id: null, name: provider.replaceAll("_", " ") };
  }
}

export async function startOAuth(request: Request, platformParam: string) {
  const user = await requireSessionUser();
  if (!user?.workspaceId) return relativeRedirect("/login");

  const provider = normalizeProvider(platformParam);
  const app = getOAuthApp(provider);
  if (!app) return accountsRedirect("Unknown provider");

  if (!isOAuthConfigured(provider)) {
    if (process.env.NODE_ENV === "production") {
      return errorRedirect(app.kind, `${app.label} OAuth is not configured.`);
    }
    if (app.kind === "analytics") {
      await upsertDemoIntegration(user.workspaceId, provider as IntegrationProvider);
    } else {
      await upsertDemoSocial(user.workspaceId, provider as SocialPlatform);
    }
    return successRedirect(app.kind);
  }

  const origin = requestOrigin(request);
  const redirectUri = `${origin}/api/social/oauth/${platformParam.toLowerCase()}/callback`;
  const codeVerifier = provider === "X" ? crypto.randomBytes(32).toString("hex") : undefined;
  const state = signOAuthState({
    workspaceId: user.workspaceId,
    userId: user.id,
    provider,
    codeVerifier,
  });
  const url = buildAuthorizeUrl({
    provider,
    redirectUri,
    state,
    codeChallenge: codeVerifier,
  });
  return locationRedirect(url);
}

export async function handleOAuthCallback(request: Request, platformParam: string) {
  const provider = normalizeProvider(platformParam);
  const app = getOAuthApp(provider);
  if (!app) return accountsRedirect("Unknown provider");

  const url = new URL(request.url);
  const error = url.searchParams.get("error");
  if (error) return errorRedirect(app.kind, error);

  const code = url.searchParams.get("code");
  const stateRaw = url.searchParams.get("state");
  if (!code || !stateRaw) return errorRedirect(app.kind, "Missing OAuth code");

  let state;
  try {
    state = readOAuthState(stateRaw);
  } catch {
    return errorRedirect(app.kind, "Invalid OAuth state");
  }
  if (state.provider !== provider) return errorRedirect(app.kind, "Provider mismatch");

  try {
    const origin = requestOrigin(request);
    const redirectUri = `${origin}/api/social/oauth/${platformParam.toLowerCase()}/callback`;
    const tokens = await exchangeOAuthCode({
      provider,
      code,
      redirectUri,
      codeVerifier: state.codeVerifier,
    });
    const profile = await fetchProfile(provider, tokens.accessToken);
    const encryptedAccess = encryptSecret(tokens.accessToken);
    const encryptedRefresh = tokens.refreshToken ? encryptSecret(tokens.refreshToken) : null;

    if (app.kind === "analytics") {
      await prisma.integration.upsert({
        where: {
          workspaceId_provider: {
            workspaceId: state.workspaceId,
            provider: provider as IntegrationProvider,
          },
        },
        create: {
          workspaceId: state.workspaceId,
          provider: provider as IntegrationProvider,
          status: ConnectionStatus.CONNECTED,
          lastError: null,
          encryptedAccessToken: encryptedAccess,
          encryptedRefreshToken: encryptedRefresh,
          tokenExpiry: tokens.expiresAt,
          metadata: { accountName: profile.name, externalAccountId: profile.id },
        },
        update: {
          status: ConnectionStatus.CONNECTED,
          lastError: null,
          encryptedAccessToken: encryptedAccess,
          encryptedRefreshToken: encryptedRefresh,
          tokenExpiry: tokens.expiresAt,
          metadata: { accountName: profile.name, externalAccountId: profile.id },
        },
      });
    } else {
      const existing = await prisma.socialAccount.findFirst({
        where: { workspaceId: state.workspaceId, platform: provider as SocialPlatform },
        select: { id: true },
      });
      const data = {
        accountName: profile.name,
        externalAccountId: profile.id,
        encryptedAccessToken: encryptedAccess,
        encryptedRefreshToken: encryptedRefresh,
        tokenExpiry: tokens.expiresAt,
        connectionStatus: ConnectionStatus.CONNECTED,
        lastError: null,
      };
      if (existing) {
        await prisma.socialAccount.update({ where: { id: existing.id }, data });
      } else {
        await prisma.socialAccount.create({
          data: {
            workspaceId: state.workspaceId,
            platform: provider as SocialPlatform,
            ...data,
          },
        });
      }
    }
    return successRedirect(app.kind);
  } catch (err) {
    const message = err instanceof Error ? err.message : "OAuth failed";
    return errorRedirect(app.kind, message);
  }
}
