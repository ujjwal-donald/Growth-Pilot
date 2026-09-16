import { NextResponse } from "next/server";
import { runPublishDuePosts } from "@/server/jobs/publish-scheduled-posts";

export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  const header = request.headers.get("authorization");
  if (!secret || header !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await runPublishDuePosts();
  return NextResponse.json(result);
}
