import { serverEnvs } from "@/server.env.js";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers.js";

export const AIRTOP_SESSION_COOKIE_NAME = "airtop-session";

export interface AirtopSessionCookie {
  // The API key for the user
  apiKey?: string;
  // CSRF for form submissions
  csrf?: string;
}

function getCookieSettings() {
  const cookieOptions: Record<string, any> = {
    secure: true,
    sameSite: "strict",
    httpOnly: true,
    path: "/",
  };

  if (serverEnvs.cookieDomain && process.env.NODE_ENV === "production") {
    cookieOptions.domain = serverEnvs.cookieDomain;
  }

  if (process.env.NODE_ENV === "development") {
    cookieOptions.secure = false;
    cookieOptions.domain = "localhost";
  }

  return cookieOptions;
}

export async function getCookieSession() {
  return getIronSession<AirtopSessionCookie>(await cookies(), {
    password: serverEnvs.cookieSecret,
    cookieName: AIRTOP_SESSION_COOKIE_NAME,
    cookieOptions: getCookieSettings(),
  });
}

export async function getApiKeyFromCookie() {
  const session = await getCookieSession();

  return session.apiKey;
}

export async function getCsrfFromCookie() {
  const session = await getCookieSession();

  return session.csrf;
}

export async function generateCsrfCookie() {
  const session = await getCookieSession();

  session.csrf = Math.random().toString(36).substring(2);

  await session.save();

  return session.csrf;
}
