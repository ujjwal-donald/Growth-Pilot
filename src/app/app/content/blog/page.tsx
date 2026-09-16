"use client";

import { useState } from "react";
import { generateBlogAction } from "@/server/actions/ai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export default function BlogGeneratorPage() {
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  return (
    <div>
      <PageHeader title="Blog generator" description="SEO title, meta, outline, article, FAQs, and CTA." />
      <form
        className="mb-6 grid gap-3 md:grid-cols-2"
        onSubmit={async (event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          setPending(true);
          const response = await generateBlogAction({
            topic: String(data.get("topic") || ""),
            keyword: String(data.get("keyword") || ""),
            audience: String(data.get("audience") || ""),
            tone: String(data.get("tone") || "Professional"),
            wordCount: Number(data.get("wordCount") || 800),
          });
          setPending(false);
          if (response.error) toast.error(response.error);
          else setResult(response.data as Record<string, unknown>);
        }}
      >
        <div className="space-y-1">
          <Label>Topic</Label>
          <Input name="topic" required />
        </div>
        <div className="space-y-1">
          <Label>Target keyword</Label>
          <Input name="keyword" required />
        </div>
        <div className="space-y-1">
          <Label>Audience</Label>
          <Input name="audience" />
        </div>
        <div className="space-y-1">
          <Label>Tone</Label>
          <Input name="tone" defaultValue="Educational" />
        </div>
        <div className="space-y-1">
          <Label>Word count</Label>
          <Input name="wordCount" type="number" defaultValue={800} />
        </div>
        <div className="flex items-end">
          <Button type="submit" disabled={pending}>{pending ? "Writing…" : "Generate article"}</Button>
        </div>
      </form>
      {result ? (
        <Card>
          <CardContent className="space-y-3 pt-6 text-sm whitespace-pre-wrap">
            <p className="font-heading text-xl">{String(result.seoTitle ?? "")}</p>
            <p className="text-muted-foreground">{String(result.metaDescription ?? "")}</p>
            <p>{String(result.article ?? JSON.stringify(result, null, 2))}</p>
            <p>
              <strong>CTA:</strong> {String(result.cta ?? "")}
            </p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
