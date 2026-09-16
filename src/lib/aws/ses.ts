import { awsSignedFetch } from "@/lib/aws/sigv4";
import { getAwsCredentials, isAwsSesConfigured } from "@/lib/aws/config";

export type OutboundEmail = {
  to: string;
  subject: string;
  text: string;
};

export interface EmailDriver {
  id: string;
  isConfigured(): boolean;
  send(message: OutboundEmail): Promise<{ id: string; status: "sent" | "logged" | "skipped" }>;
}

class LogEmailDriver implements EmailDriver {
  id = "log";
  isConfigured() {
    return true;
  }
  async send(message: OutboundEmail) {
    console.info("[email:log]", message.subject, message.to);
    return { id: "log", status: "logged" as const };
  }
}

class ResendEmailDriver implements EmailDriver {
  id = "resend";
  isConfigured() {
    return Boolean(process.env.RESEND_API_KEY);
  }
  async send(message: OutboundEmail) {
    const key = process.env.RESEND_API_KEY;
    if (!key) return { id: "resend", status: "skipped" as const };
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "UPDON <noreply@updon.ai>",
        to: [message.to],
        subject: message.subject,
        text: message.text,
      }),
    });
    if (!response.ok) {
      throw new Error(`Resend send failed (${response.status})`);
    }
    return { id: "resend", status: "sent" as const };
  }
}

class AwsSesEmailDriver implements EmailDriver {
  id = "ses";
  isConfigured() {
    return isAwsSesConfigured();
  }

  async send(message: OutboundEmail) {
    const creds = getAwsCredentials();
    if (!creds) return { id: "ses", status: "skipped" as const };
    const from = process.env.AWS_SES_FROM || process.env.EMAIL_FROM || "noreply@updon.ai";
    const url = `https://email.${creds.region}.amazonaws.com/v2/email/outbound-emails`;
    const response = await awsSignedFetch({
      service: "ses",
      region: creds.region,
      method: "POST",
      url,
      accessKeyId: creds.accessKeyId,
      secretAccessKey: creds.secretAccessKey,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        FromEmailAddress: from.replace(/^.*<(.*)>.*$/, "$1"),
        Destination: { ToAddresses: [message.to] },
        Content: {
          Simple: {
            Subject: { Data: message.subject },
            Body: { Text: { Data: message.text } },
          },
        },
      }),
    });
    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`SES send failed (${response.status}). ${detail.slice(0, 180)}`);
    }
    return { id: "ses", status: "sent" as const };
  }
}

export function getEmailDriver(): EmailDriver {
  const requested = (process.env.EMAIL_DRIVER || "").toLowerCase();
  if (requested === "ses" || (!requested && isAwsSesConfigured())) return new AwsSesEmailDriver();
  if (requested === "resend" || process.env.RESEND_API_KEY) return new ResendEmailDriver();
  return new LogEmailDriver();
}
