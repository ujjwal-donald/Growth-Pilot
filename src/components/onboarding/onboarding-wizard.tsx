"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { completeOnboardingAction } from "@/server/actions/onboarding";
import { BRAND_TONES, INDUSTRIES, MARKETING_GOALS, SOCIAL_PLATFORMS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Logo } from "@/components/brand/logo";

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState({
    businessName: "",
    website: "",
    industry: "SaaS",
    targetAudience: "",
    description: "",
    country: "India",
    primaryGoal: "Generate Leads",
    platforms: ["INSTAGRAM", "LINKEDIN"] as string[],
    brandTone: "Professional",
    customBrandTone: "",
  });

  function togglePlatform(id: string) {
    setForm((current) => ({
      ...current,
      platforms: current.platforms.includes(id)
        ? current.platforms.filter((item) => item !== id)
        : [...current.platforms, id],
    }));
  }

  async function finish() {
    setPending(true);
    setError(null);
    const result = await completeOnboardingAction(form);
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.push("/app");
    router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-2xl rounded-2xl border bg-white p-8 shadow-sm">
      <Logo />
      <p className="mt-6 text-xs font-medium tracking-wider text-indigo-600 uppercase">
        Step {step + 1} of 3
      </p>
      {step === 0 ? (
        <div className="mt-4 space-y-4">
          <h1 className="font-heading text-2xl font-semibold">Tell us about the business</h1>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Business name</Label>
              <Input
                value={form.businessName}
                onChange={(e) => setForm({ ...form, businessName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              <Input
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                placeholder="https://"
              />
            </div>
            <div className="space-y-2">
              <Label>Industry</Label>
              <select
                className="h-9 w-full rounded-lg border px-3 text-sm"
                value={form.industry}
                onChange={(e) => setForm({ ...form, industry: e.target.value })}
              >
                {INDUSTRIES.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Country</Label>
              <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Target audience</Label>
            <Input
              value={form.targetAudience}
              onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Business description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
            />
          </div>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="mt-4 space-y-4">
          <h1 className="font-heading text-2xl font-semibold">Goals and platforms</h1>
          <div className="flex flex-wrap gap-2">
            {MARKETING_GOALS.map((goal) => (
              <button
                key={goal}
                type="button"
                onClick={() => setForm({ ...form, primaryGoal: goal })}
                className={`rounded-full border px-3 py-1 text-sm ${
                  form.primaryGoal === goal ? "border-indigo-600 bg-indigo-50 text-indigo-700" : ""
                }`}
              >
                {goal}
              </button>
            ))}
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            {SOCIAL_PLATFORMS.map((platform) => (
              <label key={platform.id} className="flex items-center gap-2 rounded-lg border p-3 text-sm">
                <input
                  type="checkbox"
                  checked={form.platforms.includes(platform.id)}
                  onChange={() => togglePlatform(platform.id)}
                />
                {platform.label}
              </label>
            ))}
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="mt-4 space-y-4">
          <h1 className="font-heading text-2xl font-semibold">Brand tone</h1>
          <div className="flex flex-wrap gap-2">
            {BRAND_TONES.map((tone) => (
              <button
                key={tone}
                type="button"
                onClick={() => setForm({ ...form, brandTone: tone })}
                className={`rounded-full border px-3 py-1 text-sm ${
                  form.brandTone === tone ? "border-indigo-600 bg-indigo-50 text-indigo-700" : ""
                }`}
              >
                {tone}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            <Label>Custom brand tone (optional)</Label>
            <Input
              value={form.customBrandTone}
              onChange={(e) => setForm({ ...form, customBrandTone: e.target.value })}
              placeholder="Warm, expert, slightly witty"
            />
          </div>
        </div>
      ) : null}

      {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}
      <div className="mt-8 flex justify-between">
        <Button variant="outline" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
          Back
        </Button>
        {step < 2 ? (
          <Button onClick={() => setStep((s) => s + 1)}>Continue</Button>
        ) : (
          <Button disabled={pending} onClick={finish}>
            {pending ? "Saving…" : "Enter dashboard"}
          </Button>
        )}
      </div>
    </div>
  );
}
