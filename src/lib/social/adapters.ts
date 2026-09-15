export type SocialPublishInput = {
  externalAccountId: string;
  accessToken: string;
  copy: string;
  mediaUrl?: string;
};

export type SocialPublishResult = {
  externalPostId?: string;
  status: "PUBLISHED" | "FAILED";
  error?: string;
};

export interface SocialAdapter {
  readonly platform: string;
  publish(input: SocialPublishInput): Promise<SocialPublishResult>;
}

class UnconfiguredAdapter implements SocialAdapter {
  constructor(readonly platform: string) {}

  async publish(): Promise<SocialPublishResult> {
    return {
      status: "FAILED",
      error: `${this.platform} API credentials are not connected. Tokens stay server-side; connect the adapter in Phase 2.`,
    };
  }
}

export const socialAdapters = {
  FACEBOOK: new UnconfiguredAdapter("Meta Graph API"),
  INSTAGRAM: new UnconfiguredAdapter("Meta Graph API"),
  LINKEDIN: new UnconfiguredAdapter("LinkedIn API"),
  X: new UnconfiguredAdapter("X API"),
  YOUTUBE: new UnconfiguredAdapter("YouTube Data API"),
  GOOGLE_BUSINESS: new UnconfiguredAdapter("Google Business Profile API"),
};

export function getSocialAdapter(platform: keyof typeof socialAdapters) {
  return socialAdapters[platform];
}
