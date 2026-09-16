import "dotenv/config";
import { config as loadEnv } from "dotenv";
import { describeDatabaseUrl } from "../src/lib/database-url";

loadEnv({ path: ".env.local", override: true });

const cliUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
const runtimeUrl = process.env.DATABASE_URL;

if (!cliUrl) {
  console.error("DATABASE_URL is not set (DIRECT_URL optional).");
  process.exit(1);
}

const cli = describeDatabaseUrl(cliUrl);
const runtime = runtimeUrl ? describeDatabaseUrl(runtimeUrl) : null;

console.log(
  JSON.stringify(
    {
      prismaCli: {
        source: process.env.DIRECT_URL ? "DIRECT_URL" : "DATABASE_URL",
        ...cli,
      },
      appRuntime: runtime
        ? { source: "DATABASE_URL", ...runtime }
        : { source: "DATABASE_URL", missing: true },
    },
    null,
    2,
  ),
);
