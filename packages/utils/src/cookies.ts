import { serverEnvs } from "@/server.env.js";
import { getIronSession } from "iron-session";
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies.js";

export const AIRTOP_SESSION_COOKIE_NAME = "airtop-examples-session";

export interface AirtopSessionCookie {
  // The API key for the user
  apiKey?: string;
  // CSRF for form submissions
  csrf?: string;
}

function getCookieSettings() {
  const cookieOptions: Record<string, any> = {
    secure: true,
    sameSite: "lax",
    httpOnly: true,
    path: "/",
  };

  if (process.env.VERCEL_ENV === "production") {
    cookieOptions.domain = ".airtop.ai";
  }

  if (process.env.NODE_ENV === "development") {
    cookieOptions.secure = false;
    cookieOptions.domain = "localhost";
  }

  return cookieOptions;
}

export async function getCookieSession(cookies: ReadonlyRequestCookies) {
  return getIronSession<AirtopSessionCookie>(cookies, {
    password: serverEnvs.cookieSecret,
    cookieName: AIRTOP_SESSION_COOKIE_NAME,
    cookieOptions: getCookieSettings(),
  });
}

export async function getApiKeyFromCookie(cookies: ReadonlyRequestCookies) {
  const session = await getCookieSession(cookies);

  return session.apiKey;
}

export async function getCsrfFromCookie(cookies: ReadonlyRequestCookies) {
  const session = await getCookieSession(cookies);

  return session.csrf;
}

export async function generateCsrfCookie(cookies: ReadonlyRequestCookies) {
  const session = await getCookieSession(cookies);

  if (!session.csrf) {
    session.csrf = Math.random().toString(36).substring(2);
  }

  await session.save();

  return session.csrf;
}
