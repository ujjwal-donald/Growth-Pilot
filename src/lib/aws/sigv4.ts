import crypto from "node:crypto";

function hmac(key: Buffer | string, data: string) {
  return crypto.createHmac("sha256", key).update(data, "utf8").digest();
}

function sha256Hex(data: Buffer | string) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

function amzDate(date = new Date()) {
  const iso = date.toISOString().replace(/[:-]|\.\d{3}/g, "");
  return { amz: iso.slice(0, 15) + "Z", day: iso.slice(0, 8) };
}

export async function awsSignedFetch(input: {
  service: string;
  region: string;
  method: string;
  url: string;
  accessKeyId: string;
  secretAccessKey: string;
  headers?: Record<string, string>;
  body?: Buffer | string;
}) {
  const url = new URL(input.url);
  const { amz, day } = amzDate();
  const body = input.body ?? "";
  const payloadHash = sha256Hex(body);
  const headers: Record<string, string> = {
    host: url.host,
    "x-amz-date": amz,
    "x-amz-content-sha256": payloadHash,
  };
  for (const [name, value] of Object.entries(input.headers ?? {})) {
    headers[name.toLowerCase()] = value;
  }
  const signedHeaderNames = Object.keys(headers).sort();
  const canonicalHeaders = signedHeaderNames.map((name) => `${name}:${headers[name].trim()}\n`).join("");
  const signedHeaders = signedHeaderNames.join(";");
  const canonicalQuery = [...url.searchParams.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
  const canonical = [
    input.method.toUpperCase(),
    url.pathname || "/",
    canonicalQuery,
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");
  const scope = `${day}/${input.region}/${input.service}/aws4_request`;
  const stringToSign = ["AWS4-HMAC-SHA256", amz, scope, sha256Hex(canonical)].join("\n");
  const kDate = hmac(`AWS4${input.secretAccessKey}`, day);
  const kRegion = hmac(kDate, input.region);
  const kService = hmac(kRegion, input.service);
  const kSigning = hmac(kService, "aws4_request");
  const signature = crypto.createHmac("sha256", kSigning).update(stringToSign, "utf8").digest("hex");
  headers.authorization = `AWS4-HMAC-SHA256 Credential=${input.accessKeyId}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const fetchBody =
    body === "" ? undefined : Buffer.isBuffer(body) ? new Uint8Array(body) : body;

  return fetch(url, {
    method: input.method,
    headers,
    body: fetchBody,
  });
}
