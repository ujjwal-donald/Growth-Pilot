export type BrandContext = {
  businessName?: string | null;
  industry?: string | null;
  targetAudience?: string | null;
  description?: string | null;
  brandTone?: string | null;
  customBrandTone?: string | null;
  primaryGoal?: string | null;
  country?: string | null;
  website?: string | null;
};

export function brandSystemPrompt(profile: BrandContext) {
  const tone = profile.customBrandTone || profile.brandTone || "Professional";
  return [
    "You are the UPDON AI Marketing Assistant, a senior digital marketing strategist.",
    "Write commercially useful, specific advice. Avoid fluff.",
    "Always respect the brand voice and never invent legal or medical claims.",
    `Business: ${profile.businessName ?? "Unknown"}`,
    `Website: ${profile.website ?? "n/a"}`,
    `Industry: ${profile.industry ?? "n/a"}`,
    `Audience: ${profile.targetAudience ?? "n/a"}`,
    `Goal: ${profile.primaryGoal ?? "n/a"}`,
    `Country: ${profile.country ?? "n/a"}`,
    `Brand tone: ${tone}`,
    profile.description ? `Description: ${profile.description}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export const promptTemplates = {
  assistant: (question: string) => question,
  socialPost: (input: {
    platform: string;
    contentType: string;
    goal: string;
    topic: string;
    tone: string;
    language: string;
    audience: string;
  }) =>
    `Create one ${input.platform} ${input.contentType} post.
Goal: ${input.goal}
Topic: ${input.topic}
Tone: ${input.tone}
Language: ${input.language}
Audience: ${input.audience}
Return JSON with keys: copy, cta, hashtags (array), suggestedPublishingTime, imageSuggestion.`,
  blog: (input: {
    topic: string;
    keyword: string;
    audience: string;
    tone: string;
    wordCount: number;
  }) =>
    `Write an SEO blog brief and article.
Topic: ${input.topic}
Target keyword: ${input.keyword}
Audience: ${input.audience}
Tone: ${input.tone}
Word count: about ${input.wordCount}
Return JSON with keys: seoTitle, metaDescription, outline (array), article, faqs (array of {q,a}), cta.`,
  ads: (input: {
    network: string;
    product: string;
    offer: string;
    audience: string;
    objective: string;
    tone: string;
  }) =>
    `Create 3 ${input.network} ad variations.
Product: ${input.product}
Offer: ${input.offer}
Audience: ${input.audience}
Objective: ${input.objective}
Tone: ${input.tone}
Return JSON with key variations: array of {headline, primaryText, description, cta, keywords}.`,
  calendar: (input: { goal: string; platforms: string[]; frequency: string }) =>
    `Create a 30-day content calendar.
Goal: ${input.goal}
Platforms: ${input.platforms.join(", ")}
Posting frequency: ${input.frequency}
Return JSON with key days: array of 30 items with day, platform, topic, contentType, copy, cta, hashtags.`,
  campaign: (input: {
    name: string;
    goal: string;
    audience: string;
    channels: string[];
    budget: string;
  }) =>
    `Recommend a campaign plan for "${input.name}".
Goal: ${input.goal}
Audience: ${input.audience}
Channels: ${input.channels.join(", ") || "recommend"}
Budget: ${input.budget}
Return JSON with keys: channels, contentStrategy, budgetAllocation, postingFrequency, adCopy, kpis.`,
};
