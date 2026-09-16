export type AwsCredentials = {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
};

export function getAwsRegion() {
  return process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || "ap-south-1";
}

export function getAwsCredentials(): AwsCredentials | null {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  if (!accessKeyId || !secretAccessKey) return null;
  return { accessKeyId, secretAccessKey, region: getAwsRegion() };
}

export function awsS3Bucket() {
  return process.env.AWS_S3_BUCKET || "";
}

export function awsCloudFrontBaseUrl() {
  const domain = process.env.AWS_CLOUDFRONT_DOMAIN || process.env.AWS_S3_PUBLIC_BASE_URL || "";
  if (!domain) return "";
  return domain.startsWith("http") ? domain.replace(/\/$/, "") : `https://${domain.replace(/\/$/, "")}`;
}

export function isAwsS3Configured() {
  return Boolean(getAwsCredentials() && awsS3Bucket());
}

export function isAwsSesConfigured() {
  return Boolean(getAwsCredentials() && (process.env.AWS_SES_FROM || process.env.EMAIL_FROM));
}

export function isAwsSqsConfigured() {
  return Boolean(getAwsCredentials() && process.env.AWS_SQS_PUBLISH_QUEUE_URL);
}

export function isAwsSecretsManagerConfigured() {
  return Boolean(getAwsCredentials() && process.env.AWS_SECRETS_PREFIX);
}
