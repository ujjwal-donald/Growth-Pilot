import type { SocialPlatform, IntegrationProvider } from "@/generated/prisma/client";

export type OAuthProviderId =
  | SocialPlatform
  | Extract<IntegrationProvider, "GOOGLE_ANALYTICS" | "GOOGLE_SEARCH_CONSOLE">;

export type OAuthAppConfig = {
  id: OAuthProviderId;
  label: string;
  kind: "social" | "analytics";
  authorizeUrl: string;
  tokenUrl: string;
  scopes: string[];
  clientIdEnv: string;
  clientSecretEnv: string;
  extraAuthParams?: Record<string, string>;
};

export const oauthApps: Record<string, OAuthAppConfig> = {
  FACEBOOK: {
    id: "FACEBOOK",
    label: "Facebook",
    kind: "social",
    authorizeUrl: "https://www.facebook.com/v21.0/dialog/oauth",
    tokenUrl: "https://graph.facebook.com/v21.0/oauth/access_token",
    scopes: ["pages_show_list", "pages_manage_posts", "pages_read_engagement"],
    clientIdEnv: "META_APP_ID",
    clientSecretEnv: "META_APP_SECRET",
  },
  INSTAGRAM: {
    id: "INSTAGRAM",
    label: "Instagram",
    kind: "social",
    authorizeUrl: "https://www.facebook.com/v21.0/dialog/oauth",
    tokenUrl: "https://graph.facebook.com/v21.0/oauth/access_token",
    scopes: ["instagram_basic", "instagram_content_publish", "pages_show_list"],
    clientIdEnv: "META_APP_ID",
    clientSecretEnv: "META_APP_SECRET",
  },
  LINKEDIN: {
    id: "LINKEDIN",
    label: "LinkedIn",
    kind: "social",
    authorizeUrl: "https://www.linkedin.com/oauth/v2/authorization",
    tokenUrl: "https://www.linkedin.com/oauth/v2/accessToken",
    scopes: ["w_member_social", "openid", "profile"],
    clientIdEnv: "LINKEDIN_CLIENT_ID",
    clientSecretEnv: "LINKEDIN_CLIENT_SECRET",
  },
  X: {
    id: "X",
    label: "X",
    kind: "social",
    authorizeUrl: "https://twitter.com/i/oauth2/authorize",
    tokenUrl: "https://api.twitter.com/2/oauth2/token",
    scopes: ["tweet.read", "tweet.write", "users.read", "offline.access"],
    clientIdEnv: "X_CLIENT_ID",
    clientSecretEnv: "X_CLIENT_SECRET",
    extraAuthParams: { code_challenge_method: "plain" },
  },
  YOUTUBE: {
    id: "YOUTUBE",
    label: "YouTube",
    kind: "social",
    authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    scopes: ["https://www.googleapis.com/auth/youtube.upload"],
    clientIdEnv: "GOOGLE_OAUTH_CLIENT_ID",
    clientSecretEnv: "GOOGLE_OAUTH_CLIENT_SECRET",
    extraAuthParams: { access_type: "offline", prompt: "consent" },
  },
  GOOGLE_BUSINESS: {
    id: "GOOGLE_BUSINESS",
    label: "Google Business Profile",
    kind: "social",
    authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    scopes: ["https://www.googleapis.com/auth/business.manage"],
    clientIdEnv: "GOOGLE_OAUTH_CLIENT_ID",
    clientSecretEnv: "GOOGLE_OAUTH_CLIENT_SECRET",
    extraAuthParams: { access_type: "offline", prompt: "consent" },
  },
  GOOGLE_ANALYTICS: {
    id: "GOOGLE_ANALYTICS",
    label: "Google Analytics",
    kind: "analytics",
    authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    scopes: ["https://www.googleapis.com/auth/analytics.readonly"],
    clientIdEnv: "GOOGLE_OAUTH_CLIENT_ID",
    clientSecretEnv: "GOOGLE_OAUTH_CLIENT_SECRET",
    extraAuthParams: { access_type: "offline", prompt: "consent" },
  },
  GOOGLE_SEARCH_CONSOLE: {
    id: "GOOGLE_SEARCH_CONSOLE",
    label: "Google Search Console",
    kind: "analytics",
    authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
    clientIdEnv: "GOOGLE_OAUTH_CLIENT_ID",
    clientSecretEnv: "GOOGLE_OAUTH_CLIENT_SECRET",
    extraAuthParams: { access_type: "offline", prompt: "consent" },
  },
};

export function getOAuthApp(id: string) {
  return oauthApps[id];
}

export function isOAuthConfigured(id: string) {
  const app = getOAuthApp(id);
  if (!app) return false;
  return Boolean(process.env[app.clientIdEnv] && process.env[app.clientSecretEnv]);
}

export function oauthCallbackPath(id: string) {
  return `/api/social/oauth/${id.toLowerCase()}/callback`;
}
