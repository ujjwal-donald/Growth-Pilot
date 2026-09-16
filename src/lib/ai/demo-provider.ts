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

    if (lower.includes("caption")) {
      return {
        captions: [
          { text: "A customer outcome in one line. Proof in the next.", cta: "Save this", hashtags: ["#SmallBusiness"] },
          { text: "We shipped the weekly plan so you do not have to guess tonight.", cta: "Start Free", hashtags: ["#AIMarketing"] },
          { text: "Consistency beats virality. Here is this week's cadence.", cta: "Follow for more", hashtags: ["#ContentStrategy"] },
        ],
      };
    }

    if (lower.includes("hashtag")) {
      return {
        primary: ["#DigitalMarketing", "#AIMarketing", "#ContentStrategy"],
        niche: ["#LocalSEO", "#B2BContent", "#FounderLed"],
        avoid: ["#Follow4Follow", "#Crypto"],
      };
    }

    if (lower.includes("content pieces") || lower.includes("propose 6")) {
      return {
        ideas: [
          { title: "30-day content operating system", format: "Blog", keyword: "ai marketing system", outline: "Cadence, tools, KPIs" },
          { title: "Before/after SEO audit", format: "Carousel", keyword: "website audit", outline: "Score, fixes, results" },
        ],
      };
    }

    if (lower.includes("campaign plan") || lower.includes("recommend a campaign")) {
      return {
        channels: ["LinkedIn", "Google Search", "Email"],
        contentStrategy: "Proof posts mid-week, offer posts on Thursday, recap Friday.",
        budgetAllocation: { linkedin: "40%", google: "40%", creative: "20%" },
        postingFrequency: "5 organic posts / week + 1 always-on search campaign",
        adCopy: "Stop guessing your marketing calendar. UPDON runs the weekly engine.",
        kpis: ["Leads", "Cost per qualified conversation", "Organic traffic"],
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
