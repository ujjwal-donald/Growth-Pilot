import { fetchPublicHtml } from "@/lib/http/safe-fetch";
import type { SeoIssuePriority } from "@/generated/prisma/client";

export type AuditFinding = {
  title: string;
  description: string;
  priority: SeoIssuePriority;
  category: string;
};

export type PageAudit = {
  url: string;
  title: string | null;
  metaDescription: string | null;
  h1: string | null;
  wordCount: number;
  score: number;
  findings: AuditFinding[];
  summary: string;
};

function tagText(html: string, tag: string) {
  const match = html.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  return match?.[1]?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() || null;
}

function meta(html: string, name: string) {
  const match = html.match(
    new RegExp(`<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']+)["']`, "i"),
  ) ?? html.match(
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["']${name}["']`, "i"),
  );
  return match?.[1]?.trim() || null;
}

function has(html: string, pattern: RegExp) {
  return pattern.test(html);
}

export function analyzeHtml(url: string, html: string, https: boolean, status: number): PageAudit {
  const findings: AuditFinding[] = [];
  const title = tagText(html, "title");
  const metaDescription = meta(html, "description");
  const h1 = tagText(html, "h1");
  const text = html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ");
  const wordCount = text.split(/\s+/).filter(Boolean).length;

  if (status >= 400) {
    findings.push({
      title: `HTTP ${status}`,
      description: "The page did not return a successful status code.",
      priority: "CRITICAL",
      category: "availability",
    });
  }
  if (!https) {
    findings.push({
      title: "Not on HTTPS",
      description: "Search engines prefer secure origins.",
      priority: "HIGH",
      category: "security",
    });
  }
  if (!title) {
    findings.push({
      title: "Missing title tag",
      description: "Add a unique title of 50–60 characters.",
      priority: "CRITICAL",
      category: "on-page",
    });
  } else if (title.length < 15 || title.length > 65) {
    findings.push({
      title: "Title length",
      description: `Title is ${title.length} characters. Aim for 50–60.`,
      priority: "MEDIUM",
      category: "on-page",
    });
  }
  if (!metaDescription) {
    findings.push({
      title: "Missing meta description",
      description: "Write a 140–160 character summary that includes the primary keyword.",
      priority: "HIGH",
      category: "on-page",
    });
  }
  if (!h1) {
    findings.push({
      title: "Missing H1",
      description: "Each page should have one clear H1.",
      priority: "HIGH",
      category: "on-page",
    });
  }
  if (!has(html, /<meta[^>]+name=["']viewport["']/i)) {
    findings.push({
      title: "Missing viewport",
      description: "Mobile indexing requires a viewport meta tag.",
      priority: "MEDIUM",
      category: "technical",
    });
  }
  if (!has(html, /rel=["']canonical["']/i)) {
    findings.push({
      title: "Missing canonical",
      description: "Add a canonical URL to prevent duplicate-index issues.",
      priority: "LOW",
      category: "technical",
    });
  }
  const images = html.match(/<img\b[^>]*>/gi) ?? [];
  const missingAlt = images.filter((tag) => !/alt=/i.test(tag)).length;
  if (missingAlt) {
    findings.push({
      title: `${missingAlt} image(s) missing alt text`,
      description: "Describe images for accessibility and image search.",
      priority: missingAlt > 3 ? "HIGH" : "MEDIUM",
      category: "accessibility",
    });
  }
  if (wordCount < 180) {
    findings.push({
      title: "Thin content",
      description: `About ${wordCount} words detected. Add useful copy around the primary topic.`,
      priority: "MEDIUM",
      category: "content",
    });
  }

  const penalties = findings.reduce((sum, item) => {
    if (item.priority === "CRITICAL") return sum + 18;
    if (item.priority === "HIGH") return sum + 10;
    if (item.priority === "MEDIUM") return sum + 6;
    return sum + 3;
  }, 0);
  const score = Math.max(12, 100 - penalties);
  const summary = findings.length
    ? `${findings.length} issue(s) found. Highest priority: ${findings[0]?.title}.`
    : "No major on-page issues detected on this URL.";

  return { url, title, metaDescription, h1, wordCount, score, findings, summary };
}

export async function auditPublicUrl(rawUrl: string): Promise<PageAudit> {
  const page = await fetchPublicHtml(rawUrl);
  return analyzeHtml(page.finalUrl, page.html, page.https, page.status);
}
