import { awsSignedFetch } from "@/lib/aws/sigv4";
import {
  awsCloudFrontBaseUrl,
  awsS3Bucket,
  getAwsCredentials,
  getAwsRegion,
  isAwsS3Configured,
} from "@/lib/aws/config";
import type { StorageDriver, StoredObject } from "@/lib/storage/types";

function objectUrl(key: string) {
  const cdn = awsCloudFrontBaseUrl();
  if (cdn) return `${cdn}/${key}`;
  const bucket = awsS3Bucket();
  const region = getAwsRegion();
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

export class AwsS3Driver implements StorageDriver {
  isConfigured() {
    return isAwsS3Configured();
  }

  async put(input: { key: string; body: Buffer; contentType: string }): Promise<StoredObject> {
    const creds = getAwsCredentials();
    const bucket = awsS3Bucket();
    if (!creds || !bucket) {
      throw new Error(
        "AWS S3 is in the architecture but not connected. Set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, and AWS_S3_BUCKET, or keep STORAGE_DRIVER=local.",
      );
    }
    const encodedKey = input.key
      .split("/")
      .map((part) => encodeURIComponent(part))
      .join("/");
    const url = `https://${bucket}.s3.${creds.region}.amazonaws.com/${encodedKey}`;
    const response = await awsSignedFetch({
      service: "s3",
      region: creds.region,
      method: "PUT",
      url,
      accessKeyId: creds.accessKeyId,
      secretAccessKey: creds.secretAccessKey,
      headers: { "content-type": input.contentType },
      body: input.body,
    });
    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`S3 upload failed (${response.status}). ${detail.slice(0, 180)}`);
    }
    return { key: input.key, url: objectUrl(input.key), contentType: input.contentType };
  }

  async getUrl(key: string) {
    return objectUrl(key);
  }
}
