import crypto from "node:crypto";

type OAuthState = {
  workspaceId: string;
  userId: string;
  provider: string;
  nonce: string;
  ts: number;
  codeVerifier?: string;
};

function secret() {
  return process.env.AUTH_SECRET || process.env.TOKEN_ENCRYPTION_KEY || "";
}

export function signOAuthState(payload: Omit<OAuthState, "nonce" | "ts">) {
  const state: OAuthState = {
    ...payload,
    nonce: crypto.randomBytes(8).toString("hex"),
    ts: Date.now(),
  };
  const body = Buffer.from(JSON.stringify(state)).toString("base64url");
  const sig = crypto.createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function readOAuthState(value: string): OAuthState {
  const [body, sig] = value.split(".");
  if (!body || !sig) throw new Error("Invalid OAuth state");
  const expected = crypto.createHmac("sha256", secret()).update(body).digest("base64url");
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expected);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    throw new Error("Invalid OAuth signature");
  }
  const parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as OAuthState;
  if (Date.now() - parsed.ts > 1000 * 60 * 20) {
    throw new Error("OAuth state expired");
  }
  return parsed;
}
