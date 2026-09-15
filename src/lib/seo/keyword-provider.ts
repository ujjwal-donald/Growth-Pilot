export type KeywordInsight = {
  keyword: string;
  searchVolume: number | null;
  difficulty: number | null;
  intent: string;
  trend: string;
  competition: string;
  provider: string;
};

export interface KeywordProvider {
  research(keyword: string): Promise<KeywordInsight[]>;
}

class DemoKeywordProvider implements KeywordProvider {
  async research(keyword: string): Promise<KeywordInsight[]> {
    const seeds = [keyword, `${keyword} tools`, `${keyword} strategy`, `best ${keyword} software`];
    return seeds.map((term, index) => ({
      keyword: term,
      searchVolume: 2400 - index * 420,
      difficulty: 28 + index * 11,
      intent: index === 0 ? "Informational" : "Commercial",
      trend: index === 1 ? "Rising" : "Stable",
      competition: index > 1 ? "High" : "Medium",
      provider: "demo",
    }));
  }
}

export function getKeywordProvider(): KeywordProvider {
  // Swap for Google Ads Keyword Planner / DataForSEO / Semrush / Ahrefs here.
  return new DemoKeywordProvider();
}
