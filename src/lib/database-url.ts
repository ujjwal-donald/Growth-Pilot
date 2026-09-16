/**
 * Runtime uses the pooled Neon URL.
 * Prisma CLI (migrate / db push) uses DIRECT_URL via prisma.config.ts.
 */
export function getRuntimeDatabaseUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }
  return url;
}

/** Safe summary for logs — never includes user, password, or query string. */
export function describeDatabaseUrl(url: string) {
  const normalized = url.replace(/^postgres(ql)?:/i, "https:");
  const parsed = new URL(normalized);
  const database = parsed.pathname.replace(/^\//, "").split("/")[0] || "(default)";
  const port = parsed.port || "5432";
  return {
    host: parsed.hostname,
    port,
    database,
    usesPooler: parsed.hostname.includes("-pooler") || parsed.hostname.includes("pooler"),
  };
}
