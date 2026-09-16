"use client";

import { useState } from "react";
import {
  generatePostAction,
  saveDraftPostAction,
  transformCopyAction,
} from "@/server/actions/ai";
import { CONTENT_TYPES, SOCIAL_PLATFORMS } from "@/lib/constants";
import type { SocialPlatform } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export function PostGenerator() {
  const [form, setForm] = useState({
    platform: "INSTAGRAM" as SocialPlatform,
    contentType: "Educational",
    goal: "Build Brand Awareness",
    topic: "",
    tone: "Professional",
    language: "English",
    audience: "",
  });
  const [result, setResult] = useState<{
    copy: string;
    cta: string;
    hashtags: string[];
    suggestedPublishingTime: string;
    imageSuggestion: string;
  } | null>(null);
  const [scheduleAt, setScheduleAt] = useState("");
  const [pending, setPending] = useState(false);

  async function generate() {
    setPending(true);
    const response = await generatePostAction(form);
    setPending(false);
    if (response.error || !response.data) {
      toast.error(response.error ?? "Generation failed");
      return;
    }
    setResult(response.data);
  }

  async function transform(instruction: string) {
    if (!result) return;
    setPending(true);
    const response = await transformCopyAction(result.copy, instruction);
    setPending(false);
    if (response.error || !response.text) {
      toast.error(response.error ?? "Rewrite failed");
      return;
    }
    setResult({ ...result, copy: response.text });
  }

  async function save(schedule = false) {
    if (!result) return;
    const response = await saveDraftPostAction({
      platform: form.platform,
      ...result,
      suggestedTime: result.suggestedPublishingTime,
      contentType: form.contentType,
      goal: form.goal,
      topic: form.topic,
      tone: form.tone,
      language: form.language,
      scheduledAt: schedule ? scheduleAt : null,
    });
    toast.success(schedule ? "Post scheduled" : "Draft saved");
    return response.id;
  }

  return (
    <div>
      <PageHeader
        title="AI Post Generator"
        description="Generate platform-native copy, CTAs, hashtags, and creative direction."
      />
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Brief</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Label>Platform</Label>
              <select
                className="h-9 w-full rounded-lg border px-3 text-sm"
                value={form.platform}
                onChange={(e) => setForm({ ...form, platform: e.target.value as SocialPlatform })}
              >
                {SOCIAL_PLATFORMS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label>Content type</Label>
              <select
                className="h-9 w-full rounded-lg border px-3 text-sm"
                value={form.contentType}
                onChange={(e) => setForm({ ...form, contentType: e.target.value })}
              >
                {CONTENT_TYPES.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label>Goal</Label>
              <Input value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Topic</Label>
              <Input value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Tone</Label>
              <Input value={form.tone} onChange={(e) => setForm({ ...form, tone: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Language</Label>
              <Input value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Target audience</Label>
              <Input value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })} />
            </div>
            <Button className="w-full" disabled={pending} onClick={generate}>
              {pending ? "Generating…" : "Generate"}
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Output</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!result ? (
              <p className="text-sm text-muted-foreground">Generate a post to see copy, CTA, hashtags, and image direction.</p>
            ) : (
              <>
                <Textarea value={result.copy} onChange={(e) => setResult({ ...result, copy: e.target.value })} rows={8} />
                <p className="text-sm">
                  <strong>CTA:</strong> {result.cta}
                </p>
                <p className="text-sm">
                  <strong>Hashtags:</strong> {result.hashtags.join(" ")}
                </p>
                <p className="text-sm">
                  <strong>Suggested time:</strong> {result.suggestedPublishingTime}
                </p>
                <p className="text-sm">
                  <strong>Image suggestion:</strong> {result.imageSuggestion}
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    ["Regenerate", "Rewrite with a fresh angle"],
                    ["Shorten", "Make it shorter"],
                    ["Expand", "Make it longer and more specific"],
                    ["Change Tone", "Make the tone warmer"],
                    ["Add Emojis", "Add a few relevant emojis"],
                    ["Remove Emojis", "Remove all emojis"],
                  ].map(([label, instruction]) => (
                    <Button key={label} variant="outline" size="sm" onClick={() => transform(instruction)}>
                      {label}
                    </Button>
                  ))}
                </div>
                <div className="flex flex-wrap items-end gap-2">
                  <div className="space-y-1">
                    <Label>Schedule</Label>
                    <Input type="datetime-local" value={scheduleAt} onChange={(e) => setScheduleAt(e.target.value)} />
                  </div>
                  <Button variant="outline" onClick={() => save(false)}>
                    Save draft
                  </Button>
                  <Button onClick={() => save(true)} disabled={!scheduleAt}>
                    Schedule post
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
