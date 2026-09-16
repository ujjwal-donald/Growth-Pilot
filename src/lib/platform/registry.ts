import { getAiProvider } from "@/lib/ai/provider";
import { listAdNetworks } from "@/lib/ads/networks";
import { getBillingGateways } from "@/lib/billing/gateway";

export function getPlatformArchitecture() {
  const ai = getAiProvider();
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
        detail: "AI, storage, ads, billing, keywords. Demo implementations run until credentials exist.",
      },
      {
        id: "data",
        title: "Postgres (Neon)",
        detail: "Prisma. App uses DATABASE_URL (pooled). CLI uses DIRECT_URL when set.",
      },
    ],
    adapters: {
      ai: { id: ai.name, live: ai.name !== "demo" },
      keywords: { id: "demo", live: false },
      storage: { id: process.env.STORAGE_DRIVER || "local", live: (process.env.STORAGE_DRIVER || "local") === "local" },
      ads: listAdNetworks(),
      billing: getBillingGateways().map((g) => ({ id: g.id, label: g.label, configured: g.isConfigured() })),
    },
  };
}
