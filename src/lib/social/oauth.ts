import { getOAuthApp } from "@/lib/social/oauth-apps";

export async function exchangeOAuthCode(input: {
  provider: string;
  code: string;
  redirectUri: string;
  codeVerifier?: string;
}) {
  const app = getOAuthApp(input.provider);
  if (!app) throw new Error("Unknown provider");
  const clientId = process.env[app.clientIdEnv];
  const clientSecret = process.env[app.clientSecretEnv];
  if (!clientId || !clientSecret) {
    throw new Error(`${app.label} OAuth credentials are not configured`);
  }

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code: input.code,
    redirect_uri: input.redirectUri,
    grant_type: "authorization_code",
  });
  if (input.codeVerifier) body.set("code_verifier", input.codeVerifier);

  const response = await fetch(app.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body,
  });
  const json = (await response.json()) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    error?: string;
    error_description?: string;
  };
  if (!response.ok || !json.access_token) {
    throw new Error(json.error_description || json.error || "Token exchange failed");
  }
  return {
    accessToken: json.access_token,
    refreshToken: json.refresh_token,
    expiresAt: json.expires_in ? new Date(Date.now() + json.expires_in * 1000) : null,
  };
}

export function buildAuthorizeUrl(input: {
  provider: string;
  redirectUri: string;
  state: string;
  codeChallenge?: string;
}) {
  const app = getOAuthApp(input.provider);
  if (!app) throw new Error("Unknown provider");
  const clientId = process.env[app.clientIdEnv];
  if (!clientId) throw new Error(`${app.label} client id is not configured`);

  const url = new URL(app.authorizeUrl);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", input.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", app.scopes.join(" "));
  url.searchParams.set("state", input.state);
  if (input.codeChallenge) {
    url.searchParams.set("code_challenge", input.codeChallenge);
    url.searchParams.set("code_challenge_method", "plain");
  }
  Object.entries(app.extraAuthParams ?? {}).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  return url.toString();
}
