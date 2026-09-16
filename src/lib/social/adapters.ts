import type { SocialPlatform } from "@/generated/prisma/client";

export type PublishPayload = {
  text: string;
  mediaUrl?: string;
};

export type PublishResult = {
  externalPostId: string;
  permalink?: string;
};

export type InsightsResult = {
  impressions?: number;
  engagement?: number;
  raw?: unknown;
};

export interface SocialAdapter {
  connectLabel: string;
  publish(accessToken: string, payload: PublishPayload): Promise<PublishResult>;
  fetchInsights?(accessToken: string, postId: string): Promise<InsightsResult>;
}

class DemoAdapter implements SocialAdapter {
  constructor(private platform: SocialPlatform) {}
  connectLabel = "Demo connect";
  async publish(_accessToken: string, payload: PublishPayload): Promise<PublishResult> {
    return { externalPostId: `demo-${this.platform}-${Date.now()}`, permalink: payload.mediaUrl };
  }
}

class MetaAdapter implements SocialAdapter {
  connectLabel = "Connect with Meta";
  async publish(accessToken: string, payload: PublishPayload): Promise<PublishResult> {
    const pageId = process.env.META_PAGE_ID;
    if (!pageId) {
      throw new Error("META_PAGE_ID is required to publish to Facebook Pages.");
    }
    const res = await fetch(`https://graph.facebook.com/v20.0/${pageId}/feed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: payload.text, link: payload.mediaUrl, access_token: accessToken }),
    });
    const data = (await res.json()) as { id?: string; error?: { message?: string } };
    if (!res.ok || !data.id) throw new Error(data.error?.message ?? "Meta publish failed");
    return { externalPostId: data.id };
  }
}

class LinkedInAdapter implements SocialAdapter {
  connectLabel = "Connect with LinkedIn";
  async publish(accessToken: string, payload: PublishPayload): Promise<PublishResult> {
    const author = process.env.LINKEDIN_AUTHOR_URN;
    if (!author) throw new Error("LINKEDIN_AUTHOR_URN is required (person or organization URN).");
    const res = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify({
        author,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: { text: payload.text },
            shareMediaCategory: "NONE",
          },
        },
        visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
      }),
    });
    const data = (await res.json()) as { id?: string; message?: string };
    if (!res.ok || !data.id) throw new Error(data.message ?? "LinkedIn publish failed");
    return { externalPostId: data.id };
  }
}

class XAdapter implements SocialAdapter {
  connectLabel = "Connect with X";
  async publish(accessToken: string, payload: PublishPayload): Promise<PublishResult> {
    const res = await fetch("https://api.twitter.com/2/tweets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: payload.text.slice(0, 280) }),
    });
    const data = (await res.json()) as { data?: { id: string }; detail?: string; title?: string };
    if (!res.ok || !data.data?.id) throw new Error(data.detail ?? data.title ?? "X publish failed");
    return { externalPostId: data.data.id };
  }
}

class YouTubeAdapter implements SocialAdapter {
  connectLabel = "Connect YouTube";
  async publish(accessToken: string, payload: PublishPayload): Promise<PublishResult> {
    if (!accessToken) throw new Error("YouTube access token is missing.");
    throw new Error(
      `YouTube publishing requires a video upload (not text-only). Caption length: ${payload.text.length}.`,
    );
  }
}

class GbpAdapter implements SocialAdapter {
  connectLabel = "Connect Google Business";
  async publish(accessToken: string, payload: PublishPayload): Promise<PublishResult> {
    const location = process.env.GOOGLE_BUSINESS_LOCATION_NAME;
    if (!location) throw new Error("GOOGLE_BUSINESS_LOCATION_NAME is required (locations/{id}).");
    const res = await fetch(`https://mybusiness.googleapis.com/v4/${location}/localPosts`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        languageCode: "en-US",
        summary: payload.text,
        topicType: "STANDARD",
      }),
    });
    const data = (await res.json()) as { name?: string; error?: { message?: string } };
    if (!res.ok || !data.name) throw new Error(data.error?.message ?? "Google Business publish failed");
    return { externalPostId: data.name };
  }
}

const liveAdapters: Record<SocialPlatform, SocialAdapter> = {
  INSTAGRAM: new MetaAdapter(),
  FACEBOOK: new MetaAdapter(),
  LINKEDIN: new LinkedInAdapter(),
  X: new XAdapter(),
  YOUTUBE: new YouTubeAdapter(),
  GOOGLE_BUSINESS: new GbpAdapter(),
};

export function getSocialAdapter(platform: SocialPlatform, liveToken: boolean): SocialAdapter {
  if (!liveToken && process.env.NODE_ENV !== "production") {
    return new DemoAdapter(platform);
  }
  return liveAdapters[platform];
}
