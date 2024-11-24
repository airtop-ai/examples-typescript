import { decryptApiKeyController } from "@/app/api/decrypt-api-key/decrypt-api-key.controller";
import {
  type DecryptApiKeyRequest,
  type DecryptApiKeyResponse,
  decryptApiKeyRequestSchema,
} from "@/app/api/decrypt-api-key/decrypt-api-key.validation";
import { getCookieSession, getLogger } from "@local/utils";
import { type NextRequest, NextResponse } from "next/server";

const secret = process.env.EXAMPLES_SITES_COOKIE_SECRET as string;

/**
 * Decrypts the API key sent from the Airtop Portal and sets it into the session cookie.
 */
export async function POST(request: NextRequest) {
  const log = getLogger().withPrefix("[api/decrypt-api-key]");

  const data = (await request.json()) as DecryptApiKeyRequest;
  log.withMetadata(data).info("Validating request data");

  try {
    if (!secret) {
      throw new Error("EXAMPLES_SITES_COOKIE_SECRET environment variable is required.");
    }

    decryptApiKeyRequestSchema.parse(data);

    const { apiKey } = await decryptApiKeyController({ log, ...data });

    const session = await getCookieSession();

    session.apiKey = apiKey;

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
