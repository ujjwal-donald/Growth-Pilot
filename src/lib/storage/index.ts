export type StoredObject = {
  key: string;
  url: string;
  contentType: string;
};

export interface StorageDriver {
  put(input: { key: string; body: Buffer; contentType: string }): Promise<StoredObject>;
  getUrl(key: string): Promise<string>;
}

export class LocalStorageDriver implements StorageDriver {
  constructor(private readonly baseDir = process.env.LOCAL_STORAGE_DIR || "./storage") {}

  async put(input: { key: string; body: Buffer; contentType: string }): Promise<StoredObject> {
    const { mkdir, writeFile } = await import("node:fs/promises");
    const { join } = await import("node:path");
    const filePath = join(this.baseDir, input.key);
    await mkdir(join(filePath, ".."), { recursive: true });
    await writeFile(filePath, input.body);
    return { key: input.key, url: `/media/${input.key}`, contentType: input.contentType };
  }

  async getUrl(key: string) {
    return `/media/${key}`;
  }
}

export class S3CompatibleDriver implements StorageDriver {
  constructor(private readonly config: { bucket: string; publicBaseUrl?: string }) {}

  async put(): Promise<StoredObject> {
    throw new Error(
      "S3/R2 storage is configured in architecture but credentials are not connected yet. Set STORAGE_DRIVER=local for development.",
    );
  }

  async getUrl(key: string) {
    if (this.config.publicBaseUrl) {
      return `${this.config.publicBaseUrl}/${key}`;
    }
    throw new Error("Object storage public URL is not configured");
  }
}

export function getStorageDriver(): StorageDriver {
  const driver = process.env.STORAGE_DRIVER || "local";
  if (driver === "s3" || driver === "r2") {
    return new S3CompatibleDriver({
      bucket: process.env.AWS_S3_BUCKET || process.env.R2_BUCKET || "",
    });
  }
  return new LocalStorageDriver();
}
