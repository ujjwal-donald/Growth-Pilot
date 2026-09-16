import { getAiProvider } from "@/lib/ai/provider";
import { listAdNetworks } from "@/lib/ads/networks";
import { getBillingGateways } from "@/lib/billing/gateway";
import { getAwsArchitecture } from "@/lib/aws/platform";
import { getEmailDriver } from "@/lib/aws/ses";

export function getPlatformArchitecture() {
  const ai = getAiProvider();
  const aws = getAwsArchitecture();
  const email = getEmailDriver();
  return {
    appEnv: process.env.APP_ENV || process.env.NODE_ENV || "development",
    layers: [
      {
        id: "edge",
        title: "App Router UI",
        detail: "Marketing site, Auth.js session, workspace dashboard. Tokens never render in the browser.",
      },
      {
        id: "actions",
        title: "Server actions / route handlers",
        detail: "RBAC + workspace isolation. Swap this boundary later for a standalone API.",
      },
      {
        id: "domain",
        title: "Domain services",
        detail: "Social publish, SEO audit, campaign planner, lead CRM, analytics snapshots, reports.",
      },
      {
        id: "adapters",
        title: "Provider adapters",
        detail: "AI, AWS (S3/SES/SQS), ads, billing, keywords. Demo implementations run until credentials exist.",
      },
      {
        id: "data",
        title: "Postgres (Neon or Amazon RDS/Aurora)",
        detail: "Prisma. App uses DATABASE_URL (pooled). CLI uses DIRECT_URL when set.",
      },
      {
        id: "aws",
        title: "AWS cloud",
        detail: `${aws.region}: S3, CloudFront, SES, SQS, EventBridge, IAM. Optional ECS/App Runner runtime.`,
      },
    ],
    adapters: {
      ai: { id: ai.name, live: ai.name !== "demo" },
      keywords: { id: "demo", live: false },
      storage: {
        id: process.env.STORAGE_DRIVER || "local",
        live:
          (process.env.STORAGE_DRIVER || "local") === "local" ||
          Boolean(aws.services.find((s) => s.id === "s3")?.configured),
      },
      email: { id: email.id, configured: email.isConfigured() },
      ads: listAdNetworks(),
      billing: getBillingGateways().map((g) => ({ id: g.id, label: g.label, configured: g.isConfigured() })),
      aws,
    },
  };
}
