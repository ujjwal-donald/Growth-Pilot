import { auditPublicUrl } from "@/lib/seo/site-auditor";

export async function analyzeCompetitor(rawUrl: string) {
  const audit = await auditPublicUrl(rawUrl);
  const host = (() => {
    try {
      return new URL(audit.url).hostname.replace(/^www\./, "");
    } catch {
      return audit.url;
    }
  })();
  const topics = [audit.title, audit.h1, audit.metaDescription].filter(Boolean) as string[];
  return {
    website: audit.url,
    name: host,
    seoScore: audit.score,
    estimatedKeywords: Math.max(12, Math.round(audit.wordCount / 40)),
    contentTopics: topics.slice(0, 6),
    socialPresence: { note: "Social graphs require platform APIs; on-page signals only for now." },
    strengths: audit.score >= 70 ? ["Solid on-page baseline", "Indexable HTML"] : ["Live URL responded"],
    weaknesses: audit.findings.slice(0, 4).map((item) => item.title),
    opportunities: audit.findings
      .filter((item) => item.priority === "HIGH" || item.priority === "CRITICAL")
      .map((item) => item.description)
      .slice(0, 4),
    strategy: `Beat ${host} by fixing ${audit.findings[0]?.title ?? "on-page basics"} and publishing comparison content around "${audit.h1 ?? host}".`,
  };
}
