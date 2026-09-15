import { NextResponse } from "next/server";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";

const TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
  ".pdf": "application/pdf",
};

export async function GET(_request: Request, context: { params: Promise<{ key: string[] }> }) {
  const { key: parts } = await context.params;
  const key = parts.join("/");
  if (!key || key.includes("\0")) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const root = path.resolve(/*turbopackIgnore: true*/ process.cwd(), process.env.LOCAL_STORAGE_DIR || "storage");
  const resolved = path.resolve(/*turbopackIgnore: true*/ root, key);
  const relative = path.relative(root, resolved);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const info = await stat(/*turbopackIgnore: true*/ resolved);
    if (!info.isFile()) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const stream = Readable.toWeb(createReadStream(/*turbopackIgnore: true*/ resolved)) as ReadableStream;
    const contentType = TYPES[path.extname(resolved).toLowerCase()] ?? "application/octet-stream";
    return new NextResponse(stream, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
