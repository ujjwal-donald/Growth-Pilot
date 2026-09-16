import { handleOAuthCallback } from "@/server/services/oauth-connect";

export async function GET(
  request: Request,
  context: { params: Promise<{ platform: string }> },
) {
  const { platform } = await context.params;
  return handleOAuthCallback(request, platform);
}
