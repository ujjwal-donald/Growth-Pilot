const BLOCKED_HOSTS = new Set(["localhost", "metadata.google.internal", "metadata.google.com"]);

function isPrivateHostname(hostname: string) {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (BLOCKED_HOSTS.has(host) || host.endsWith(".local") || host.endsWith(".internal")) return true;
  if (host === "0.0.0.0" || host === "::1" || host === "127.0.0.1") return true;
  const ipv4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!ipv4) return false;
  const [a, b] = [Number(ipv4[1]), Number(ipv4[2])];
  if (a === 10 || a === 127 || a === 0) return true;
  if (a === 169 && b === 254) return true;
  if (a === 192 && b === 168) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  return false;
}

export function assertPublicHttpUrl(raw: string) {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("Enter a valid http(s) URL.");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Only http and https URLs can be audited.");
  }
  if (isPrivateHostname(url.hostname)) {
    throw new Error("That host cannot be crawled.");
  }
  return url;
}

export async function fetchPublicHtml(raw: string) {
  const url = assertPublicHttpUrl(raw);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: { "user-agent": "UPDON-SEO-Auditor/1.0" },
    });
    const contentType = response.headers.get("content-type") ?? "";
    const buffer = Buffer.from(await response.arrayBuffer()).subarray(0, 750_000);
    const html = buffer.toString("utf8");
    return {
      finalUrl: response.url || url.toString(),
      status: response.status,
      contentType,
      html,
      https: url.protocol === "https:",
    };
  } finally {
    clearTimeout(timer);
  }
}
