import { z } from "zod";

const optionalString = z.string().optional().or(z.literal(""));

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_ENV: z.enum(["development", "test", "production"]).optional(),
  NEXT_PUBLIC_APP_NAME: z.string().default("UPDON AI Marketing"),
  NEXT_PUBLIC_APP_URL: z.string().default("http://localhost:3000"),
  AUTH_SECRET: z.string().min(1, "AUTH_SECRET is required"),
  AUTH_URL: optionalString,
  GOOGLE_CLIENT_ID: optionalString,
  GOOGLE_CLIENT_SECRET: optionalString,
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DIRECT_URL: optionalString,
  ADMIN_EMAIL: optionalString,
  AI_PROVIDER: z.string().default("openai"),
  OPENAI_API_KEY: optionalString,
  OPENAI_MODEL: z.string().default("gpt-4o-mini"),
  ANTHROPIC_API_KEY: optionalString,
  GOOGLE_GEMINI_API_KEY: optionalString,
  TOKEN_ENCRYPTION_KEY: z.string().min(16).optional().or(z.literal("")),
  STORAGE_DRIVER: z.enum(["local", "s3", "r2"]).default("local"),
  LOCAL_STORAGE_DIR: z.string().default("./storage"),
});

export type AppEnv = z.infer<typeof envSchema>;

export function getEnv(): AppEnv {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`Invalid environment: ${issues}`);
  }
  return parsed.data;
}

export function isGoogleAuthEnabled() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function isOpenAiConfigured() {
  return Boolean(process.env.OPENAI_API_KEY);
}
