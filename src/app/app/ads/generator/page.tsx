"use client";

import { useState } from "react";
import { generateAdsAction } from "@/server/actions/ai";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function AdGeneratorPage() {
  const [variations, setVariations] = useState<Array<Record<string, unknown>>>([]);

  return (
    <div>
      <PageHeader title="AI ad generator" description="Facebook, Instagram, Google Search, and LinkedIn variations." />
      <form
        className="mb-6 grid gap-3 md:grid-cols-2"
        onSubmit={async (event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const response = await generateAdsAction({
            network: String(data.get("network")),
            product: String(data.get("product")),
            offer: String(data.get("offer")),
            audience: String(data.get("audience")),
            objective: String(data.get("objective")),
            tone: String(data.get("tone")),
          });
          if (response.error) toast.error(response.error);
          else {
            const payload = response.data as { variations?: Array<Record<string, unknown>> };
            setVariations(payload.variations ?? []);
          }
        }}
      >
        <div className="space-y-1">
          <Label>Network</Label>
          <select name="network" className="h-9 w-full rounded-lg border px-3 text-sm">
            <option>Facebook Ads</option>
            <option>Instagram Ads</option>
            <option>Google Search Ads</option>
            <option>LinkedIn Ads</option>
          </select>
        </div>
        <div className="space-y-1">
          <Label>Product</Label>
          <Input name="product" required />
        </div>
        <div className="space-y-1">
          <Label>Offer</Label>
          <Input name="offer" />
        </div>
        <div className="space-y-1">
          <Label>Audience</Label>
          <Input name="audience" />
        </div>
        <div className="space-y-1">
          <Label>Objective</Label>
          <Input name="objective" defaultValue="Leads" />
        </div>
        <div className="space-y-1">
          <Label>Tone</Label>
          <Input name="tone" defaultValue="Bold" />
        </div>
        <Button type="submit">Generate variations</Button>
      </form>
      <div className="grid gap-4 md:grid-cols-3">
        {variations.map((item, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>{String(item.headline ?? `Variant ${index + 1}`)}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>{String(item.primaryText ?? "")}</p>
              <p className="text-muted-foreground">{String(item.description ?? "")}</p>
              <p>
                <strong>CTA:</strong> {String(item.cta ?? "")}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
