import {
  type SetApiKeyRequest,
  type SetApiKeyResponse,
  setApiKeyRequestSchema,
} from "@/api/api-key/set-api-key.validation.js";
import { getCookieSession } from "@/cookies.js";
import { getLogger } from "@/logging.js";
import { type NextRequest, NextResponse } from "next/server.js";

export const maxDuration = 15;

/**
 * Sets an API key to the session cookie
 */
export async function POST(request: NextRequest): Promise<NextResponse<SetApiKeyResponse>> {
  const log = getLogger().withPrefix("[api/set-api-key]");

  const data = (await request.json()) as SetApiKeyRequest;

  log.info("Validating request data");
  setApiKeyRequestSchema.parse(data);

  try {
    const session = await getCookieSession();

    session.apiKey = data.apiKey;

    await session.save();

    log.info("API key set to session cookie");

    return NextResponse.json<SetApiKeyResponse>({
      ok: true,
    });
  } catch (e) {
    log.withError(e).error("Error setting API key to session cookie");
  }

  return NextResponse.json(
    {
      ok: false,
    },
    {
      status: 500,
    },
  );
}

export async function DELETE() {
  const log = getLogger().withPrefix("[api/delete-api-key]");

  try {
    const session = await getCookieSession();

    session.apiKey = "";

    await session.save();

    log.info("API key removed from session cookie");

    return NextResponse.json<SetApiKeyResponse>({
      ok: true,
    });
  } catch (e) {
    log.withError(e).error("Error removing API key from session cookie");
  }

  return NextResponse.json(
    {
      ok: false,
    },
    {
      status: 500,
    },
  );
}
