import type { PlanTier } from "@/generated/prisma/client";

export type PlanDefinition = {
  id: PlanTier;
  name: string;
  monthlyPriceInr: number;
  brands: number;
  aiGenerationsPerMonth: number;
  scheduledPosts: number | "unlimited";
  features: string[];
};

export const PLANS: PlanDefinition[] = [
  {
    id: "FREE",
    name: "Free",
    monthlyPriceInr: 0,
    brands: 1,
    aiGenerationsPerMonth: 10,
    scheduledPosts: 5,
    features: ["1 brand", "10 AI generations / month", "5 scheduled posts", "Basic analytics"],
  },
  {
    id: "STARTER",
    name: "Starter",
    monthlyPriceInr: 999,
    brands: 1,
    aiGenerationsPerMonth: 100,
    scheduledPosts: 50,
    features: ["1 brand", "100 AI generations", "50 scheduled posts", "SEO tools", "Analytics"],
  },
  {
    id: "GROWTH",
    name: "Growth",
    monthlyPriceInr: 2499,
    brands: 3,
    aiGenerationsPerMonth: 500,
    scheduledPosts: "unlimited",
    features: [
      "3 brands",
      "500 AI generations",
      "Unlimited scheduling",
      "Advanced SEO",
      "Competitor analysis",
      "Campaign builder",
    ],
  },
  {
    id: "AGENCY",
    name: "Agency",
    monthlyPriceInr: 6999,
    brands: 10,
    aiGenerationsPerMonth: 2000,
    scheduledPosts: "unlimited",
    features: [
      "10 brands",
      "Team members",
      "White-label-ready architecture",
      "Advanced reports",
    ],
  },
];

export function getPlan(id: PlanTier) {
  return PLANS.find((plan) => plan.id === id) ?? PLANS[0];
}

export function formatInr(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
