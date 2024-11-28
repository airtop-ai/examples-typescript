import { generateCsrfCookie } from "@local/utils/cookies.js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Check if the path matches /decrypt-api-key
  if (request.nextUrl.pathname === "/decrypt-api-key") {
    const nextCookies = await cookies();
    // Generate CSRF cookie
    await generateCsrfCookie(nextCookies);

    // Return the response with the cookie
    return NextResponse.next();
  }

  // For all other routes, continue without modification
  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: "/decrypt-api-key",
};
