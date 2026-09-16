import { awsSignedFetch } from "@/lib/aws/sigv4";
import { getAwsCredentials, isAwsSqsConfigured } from "@/lib/aws/config";

export async function enqueuePublishJob(payload: Record<string, unknown> = { type: "publish-due-posts" }) {
  const creds = getAwsCredentials();
  const queueUrl = process.env.AWS_SQS_PUBLISH_QUEUE_URL;
  if (!creds || !queueUrl) {
    return {
      status: "skipped" as const,
      message: "SQS is in the architecture. Set AWS_SQS_PUBLISH_QUEUE_URL to enqueue publish jobs.",
    };
  }
  const url = new URL(queueUrl);
  url.searchParams.set("Action", "SendMessage");
  url.searchParams.set("MessageBody", JSON.stringify(payload));
  url.searchParams.set("Version", "2012-11-05");
  const response = await awsSignedFetch({
    service: "sqs",
    region: creds.region,
    method: "POST",
    url: url.toString(),
    accessKeyId: creds.accessKeyId,
    secretAccessKey: creds.secretAccessKey,
    headers: { "content-type": "application/x-www-form-urlencoded" },
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`SQS send failed (${response.status}). ${detail.slice(0, 180)}`);
  }
  return { status: "queued" as const, message: "Publish job queued on SQS." };
}

export function sqsStatus() {
  return {
    configured: isAwsSqsConfigured(),
    queueSet: Boolean(process.env.AWS_SQS_PUBLISH_QUEUE_URL),
  };
}
