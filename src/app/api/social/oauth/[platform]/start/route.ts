import { startOAuth } from "@/server/services/oauth-connect";

export async function GET(
  request: Request,
  context: { params: Promise<{ platform: string }> },
) {
  const { platform } = await context.params;
  return startOAuth(request, platform);
}
