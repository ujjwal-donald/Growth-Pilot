import type { AiProvider, GenerateTextInput, GenerateTextResult } from "./types";

const DEMO_COST = 0;

function lastUserPrompt(input: GenerateTextInput) {
  return [...input.messages].reverse().find((m) => m.role === "user")?.content ?? "";
}

export class DemoAiProvider implements AiProvider {
  readonly name = "demo";

  async generateText(input: GenerateTextInput): Promise<GenerateTextResult> {
    const prompt = lastUserPrompt(input);
    const text = input.json
      ? JSON.stringify(this.jsonFor(prompt), null, 2)
      : this.proseFor(prompt);

    return {
      text,
      model: "updon-demo-v1",
      promptTokens: Math.ceil(prompt.length / 4),
      completionTokens: Math.ceil(text.length / 4),
      estimatedCostUsd: DEMO_COST,
      provider: this.name,
    };
  }

  private proseFor(prompt: string) {
    return [
      "Here is a practical UPDON marketing recommendation based on your brand profile.",
      "",
      "1. Lead with a customer outcome, not a product feature.",
      "2. Publish 4–5 times per week on your primary platform, then recycle winning posts.",
      "3. Pair every promotional post with an educational post that builds trust.",
      "4. Track one north-star KPI (leads or booked calls) instead of vanity metrics.",
      "",
      `Request: ${prompt.slice(0, 280)}`,
      "",
      "Connect OPENAI_API_KEY to replace this demo response with live model output.",
    ].join("\n");
  }

  private jsonFor(prompt: string) {
    const lower = prompt.toLowerCase();
    if (lower.includes("calendar")) {
      return {
        days: Array.from({ length: 7 }, (_, i) => ({
          day: i + 1,
          platform: "INSTAGRAM",
          topic: `Value post ${i + 1}`,
          contentType: i % 2 === 0 ? "Educational" : "Promotional",
          copy: "Share a customer win and invite replies.",
          cta: "Save this for later",
          hashtags: ["#DigitalMarketing", "#SmallBusiness", "#UPDON"],
        })),
      };
    }

    if (lower.includes("blog")) {
      return {
        seoTitle: "How to build a 30-day AI marketing system",
        metaDescription:
          "A practical playbook for small teams that want consistent content, SEO, and measurable leads.",
        outline: ["Why consistency beats virality", "Weekly operating cadence", "KPIs that matter"],
        article:
          "Most teams do not need more tools. They need a repeatable weekly cadence: plan on Monday, create on Tuesday, publish mid-week, review on Friday.",
        faqs: [
          { q: "How often should we post?", a: "Start with 4 posts per week on your highest-ROI channel." },
        ],
        cta: "Book a strategy review this week.",
      };
    }

    if (lower.includes("ad")) {
      return {
        variations: [
          {
            headline: "Turn content into customers",
            primaryText: "Stop guessing what to post. UPDON builds your weekly marketing engine.",
            description: "AI content, SEO, and campaigns in one dashboard.",
            cta: "Start Free",
            keywords: ["ai marketing", "content calendar", "seo tools"],
          },
          {
            headline: "Your marketing team, on demand",
            primaryText: "Create posts, ads, and SEO briefs in minutes — with your brand voice.",
            description: "Built for startups, shops, and agencies.",
            cta: "Book Demo",
            keywords: ["social media scheduler", "ad copy generator"],
          },
        ],
      };
    }

    return {
      copy: "We help ambitious brands grow with content that actually converts. This week: one story, one proof point, one offer.",
      cta: "Get the playbook",
      hashtags: ["#MarketingStrategy", "#ContentMarketing", "#SEO"],
      suggestedPublishingTime: "9:30 AM local time on weekdays",
      imageSuggestion: "Clean product-in-use photo with a short overlay headline and lots of negative space.",
    };
  }
}
