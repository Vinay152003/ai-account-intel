import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Strip the 'iss' parameter from GitHub OAuth callbacks
  // GitHub added this per RFC 9207 but openid-client in next-auth
  // tries to validate it and fails since GitHub isn't configured as an OIDC issuer
  if (request.nextUrl.pathname === "/api/auth/callback/github") {
    const url = request.nextUrl.clone();
    if (url.searchParams.has("iss")) {
      url.searchParams.delete("iss");
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/auth/callback/:provider*"],
};
