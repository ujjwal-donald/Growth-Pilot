export type AdNetworkId = "facebook" | "google" | "linkedin";

export type NetworkPublishResult = {
  network: AdNetworkId;
  status: "demo" | "queued";
  message: string;
  externalId?: string;
};

export interface AdNetworkAdapter {
  id: AdNetworkId;
  label: string;
  isConfigured(): boolean;
  publish(input: { name: string; budget?: string; copy?: string }): Promise<NetworkPublishResult>;
}

class UnconfiguredAdapter implements AdNetworkAdapter {
  constructor(
    readonly id: AdNetworkId,
    readonly label: string,
    private readonly envKeys: string[],
  ) {}

  isConfigured() {
    return this.envKeys.every((key) => Boolean(process.env[key]));
  }

  async publish(input: { name: string; budget?: string; copy?: string }): Promise<NetworkPublishResult> {
    if (!this.isConfigured()) {
      return {
        network: this.id,
        status: "demo",
        message: `${this.label} credentials are not set. Campaign "${input.name}" stays in UPDON until the network adapter is connected.`,
      };
    }
    return {
      network: this.id,
      status: "queued",
      message: `${this.label} adapter is configured. Live create-campaign calls stay disabled until spend limits are approved.`,
      externalId: `pending:${this.id}:${input.name}`,
    };
  }
}

const adapters: Record<AdNetworkId, AdNetworkAdapter> = {
  facebook: new UnconfiguredAdapter("facebook", "Meta Ads", ["META_APP_ID", "META_APP_SECRET"]),
  google: new UnconfiguredAdapter("google", "Google Ads", ["GOOGLE_ADS_DEVELOPER_TOKEN"]),
  linkedin: new UnconfiguredAdapter("linkedin", "LinkedIn Ads", ["LINKEDIN_CLIENT_ID", "LINKEDIN_CLIENT_SECRET"]),
};

export function getAdNetwork(id: AdNetworkId) {
  return adapters[id];
}

export function listAdNetworks() {
  return Object.values(adapters).map((adapter) => ({
    id: adapter.id,
    label: adapter.label,
    configured: adapter.isConfigured(),
  }));
}
