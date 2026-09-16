import {
  getAwsCredentials,
  getAwsRegion,
  awsS3Bucket,
  awsCloudFrontBaseUrl,
  isAwsS3Configured,
  isAwsSesConfigured,
  isAwsSqsConfigured,
  isAwsSecretsManagerConfigured,
} from "@/lib/aws/config";

export type AwsServiceStatus = {
  id: string;
  label: string;
  configured: boolean;
  role: string;
};

export function getAwsArchitecture() {
  const creds = Boolean(getAwsCredentials());
  const services: AwsServiceStatus[] = [
    {
      id: "iam",
      label: "IAM",
      configured: creds,
      role: "Access keys in GitHub Environment secrets, or a task role on ECS/App Runner. Keys never go to the browser.",
    },
    {
      id: "s3",
      label: "S3",
      configured: isAwsS3Configured(),
      role: "Brand assets, generated creatives, and report files. STORAGE_DRIVER=s3.",
    },
    {
      id: "cloudfront",
      label: "CloudFront",
      configured: Boolean(awsCloudFrontBaseUrl()),
      role: "HTTPS CDN in front of the S3 bucket (AWS_CLOUDFRONT_DOMAIN).",
    },
    {
      id: "ses",
      label: "SES",
      configured: isAwsSesConfigured(),
      role: "Transactional mail (password reset, invites). EMAIL_DRIVER=ses.",
    },
    {
      id: "sqs",
      label: "SQS",
      configured: isAwsSqsConfigured(),
      role: "Publish-due-posts queue. EventBridge can also hit POST /api/jobs/publish.",
    },
    {
      id: "eventbridge",
      label: "EventBridge Scheduler",
      configured: Boolean(process.env.CRON_SECRET),
      role: "Minute/hourly schedule that calls the publish job with CRON_SECRET.",
    },
    {
      id: "secretsmanager",
      label: "Secrets Manager",
      configured: isAwsSecretsManagerConfigured(),
      role: "Optional store for DATABASE_URL and OAuth secrets. GitHub Environments remain the source of truth for CI.",
    },
    {
      id: "compute",
      label: "ECS Fargate / App Runner",
      configured: Boolean(process.env.AWS_ECS_CLUSTER || process.env.AWS_APP_RUNNER_SERVICE),
      role: "Container runtime for the Next.js app (see Dockerfile). Aurora/RDS can replace Neon via DATABASE_URL.",
    },
  ];

  return {
    region: getAwsRegion(),
    credentialsPresent: creds,
    bucket: awsS3Bucket() || null,
    cloudFront: awsCloudFrontBaseUrl() || null,
    services,
  };
}
