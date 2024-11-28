import { decryptApiKeyController } from "@/app/api/decrypt-api-key/decrypt-api-key.controller";
import {
  type DecryptApiKeyRequest,
  type DecryptApiKeyResponse,
  decryptApiKeyRequestSchema,
} from "@/app/api/decrypt-api-key/decrypt-api-key.validation";
import { getCookieSession, getCsrfFromCookie, getLogger } from "@local/utils";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

const secret = process.env.EXAMPLES_SITES_COOKIE_SECRET as string;

/**
 * Decrypts the API key sent from the Airtop Portal and sets it into the session cookie.
 */
export async function POST(request: NextRequest) {
  const log = getLogger().withPrefix("[api/decrypt-api-key]");
  const nextCookies = await cookies();

  const csrf = await getCsrfFromCookie(nextCookies);

  const data = (await request.json()) as DecryptApiKeyRequest;

  log.info("Validating request data");

  if (!csrf?.trim() || csrf !== data.csrf?.trim()) {
    return NextResponse.json(
      {
        error: "Invalid CSRF token",
      },
      {
        status: 403,
      },
    );
  }

  try {
    if (!secret) {
      throw new Error("EXAMPLES_SITES_COOKIE_SECRET environment variable is required.");
    }

    decryptApiKeyRequestSchema.parse(data);

    const { apiKey } = await decryptApiKeyController({ log, ...data });
    const session = await getCookieSession(nextCookies);

    session.apiKey = apiKey;
    session.csrf = "";

    await session.save();

    return NextResponse.json<DecryptApiKeyResponse>({
      ok: true,
    });
  } catch (e: any) {
    log.withError(e).error("Error decrypting API key");

    return NextResponse.json(
      {
        error: "Error decrypting API key",
      },
      {
        status: 500,
      },
    );
  }
}
