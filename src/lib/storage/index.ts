import { AwsS3Driver } from "@/lib/aws/s3";
import type { StorageDriver, StoredObject } from "@/lib/storage/types";

export type { StorageDriver, StoredObject };

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

export class R2StorageDriver implements StorageDriver {
  constructor(private readonly config: { bucket: string; publicBaseUrl?: string }) {}

  async put(): Promise<StoredObject> {
    throw new Error(
      "Cloudflare R2 is an optional S3-compatible target. Set STORAGE_DRIVER=s3 for AWS or STORAGE_DRIVER=local for development.",
    );
  }

  async getUrl(key: string) {
    if (this.config.publicBaseUrl) {
      return `${this.config.publicBaseUrl}/${key}`;
    }
    throw new Error("R2 public URL is not configured");
  }
}

export function getStorageDriver(): StorageDriver {
  const driver = process.env.STORAGE_DRIVER || "local";
  if (driver === "s3") return new AwsS3Driver();
  if (driver === "r2") {
    return new R2StorageDriver({
      bucket: process.env.R2_BUCKET || "",
      publicBaseUrl: process.env.R2_PUBLIC_BASE_URL,
    });
  }
  return new LocalStorageDriver();
}
