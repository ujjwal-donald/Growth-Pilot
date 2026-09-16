import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

loadEnv({ path: ".env" });
loadEnv({ path: ".env.local", override: true });

/**
 * Neon: DATABASE_URL should be the pooled connection (runtime).
 * DIRECT_URL should be the direct (non-pooler) connection for migrate/db push.
 * Prisma CLI uses DIRECT_URL when set; otherwise DATABASE_URL.
 */
function prismaCliDatabaseUrl() {
  const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. For Neon, set DATABASE_URL (pooled) and DIRECT_URL (direct) in the environment or GitHub Environment secrets. Do not commit connection strings.",
    );
  }
  return url;
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: prismaCliDatabaseUrl(),
  },
});
