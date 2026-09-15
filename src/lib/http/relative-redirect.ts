import { NextResponse } from "next/server";

/** Stay on the incoming preview origin; never bounce to *.cursorvm.com. */
export function relativeRedirect(path: string) {
  const location = path.startsWith("/") ? path : `/${path}`;
  return new NextResponse(null, { status: 303, headers: { Location: location } });
}

export function locationRedirect(location: string) {
  return new NextResponse(null, { status: 303, headers: { Location: location } });
}

export function requestOrigin(request: Request) {
  const url = new URL(request.url);
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = forwardedHost || request.headers.get("host") || url.host;
  const proto = request.headers.get("x-forwarded-proto") || url.protocol.replace(":", "") || "https";
  return `${proto}://${host}`;
}
