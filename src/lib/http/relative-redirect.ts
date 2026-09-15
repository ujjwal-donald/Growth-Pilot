import { NextResponse } from "next/server";

/** Stay on the incoming preview origin; never bounce to *.cursorvm.com. */
export function relativeRedirect(path: string) {
  const location = path.startsWith("/") ? path : `/${path}`;
  return new NextResponse(null, { status: 303, headers: { Location: location } });
}

export function locationRedirect(location: string) {
  return new NextResponse(null, { status: 303, headers: { Location: location } });
}

export function originFromHeaders(headersList: Headers) {
  const host = headersList.get("x-forwarded-host") || headersList.get("host") || "localhost:3000";
  const proto =
    headersList.get("x-forwarded-proto") ||
    (host.includes("localhost") || host.startsWith("127.") ? "http" : "https");
  return `${proto}://${host}`;
}

export function requestOrigin(request: Request) {
  return originFromHeaders(request.headers);
}
